import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Maps Stripe product_id → tier key
const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_U4z93eyUiPVC0z": "basic",
  "prod_U4zApySz0rqGtc": "premium",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(userError.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      // No Stripe customer → ensure profile reflects inactive
      await supabaseClient
        .from("profiles")
        .update({ subscribed: false, tier: null, stripe_customer_id: null, stripe_subscription_id: null, subscription_end: null })
        .eq("user_id", user.id);
      return new Response(JSON.stringify({ subscribed: false, tier: null, subscription_end: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let tier: string | null = null;
    let subscriptionEnd: string | null = null;
    let stripeSubscriptionId: string | null = null;

    if (hasActiveSub) {
      const sub = subscriptions.data[0];
      stripeSubscriptionId = sub.id;
      if (sub.current_period_end) {
        const d = new Date(sub.current_period_end * 1000);
        if (!isNaN(d.getTime())) subscriptionEnd = d.toISOString();
      }
      const productId = sub.items.data[0]?.price?.product as string ?? null;
      tier = productId ? (PRODUCT_TIER_MAP[productId] ?? null) : null;
    }

    // Persist into profiles table
    await supabaseClient
      .from("profiles")
      .update({
        subscribed: hasActiveSub,
        tier: tier,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("check-subscription FAILED:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
