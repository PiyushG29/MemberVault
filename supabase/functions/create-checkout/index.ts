import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ✅ Real Stripe Price IDs from membership.ts
const PRICE_TIER_MAP: Record<string, { tier: string; name: string }> = {
  "price_1T6pB35wVTZyGsgPBLHAlBxs": { tier: "basic", name: "Basic Membership" },
  "price_1T6pCI5wVTZyGsgPQXH59wOg": { tier: "premium", name: "Premium Membership" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated: " + userError?.message);

    const body = await req.json();
    const priceId = body?.priceId;

    console.log("Body received:", body);

    if (!priceId) throw new Error("No priceId provided");

    const tierInfo = PRICE_TIER_MAP[priceId];
    if (!tierInfo) throw new Error(`Unknown priceId: ${priceId}`);

    console.log("Creating checkout — user:", user.email, "tier:", tierInfo.tier, "priceId:", priceId);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get or create Stripe customer
    let customerId: string;
    const existing = await stripe.customers.list({ email: user.email!, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
      console.log("Existing customer:", customerId);
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = newCustomer.id;
      console.log("New customer:", customerId);
    }

    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/$/, "") ||
      "http://localhost:8080";

    // ✅ Use the real Stripe price_id directly — no price_data needed
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,   // ✅ use existing Stripe price
          quantity: 1,
        },
      ],
      mode: "subscription",  // ✅ your prices are recurring (monthly)
      success_url: `${origin}/dashboard?success=true&tier=${tierInfo.tier}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        tier: tierInfo.tier,
      },
    });

    console.log("Session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("create-checkout FAILED:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
