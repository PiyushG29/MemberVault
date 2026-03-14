import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIERS } from "@/lib/membership";
import { generateCertificate } from "@/lib/certificate";
import { toast } from "sonner";
import { Crown, Download, CreditCard, User, Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Dashboard() {
  const { user, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // After a successful Stripe checkout, refresh the subscription and clean the URL
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      checkSubscription().then(() => {
        toast.success("Payment successful! Your membership is now active.");
      });
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setPhone(data.phone ?? "");
        }
      });
  }, [user]);

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Could not open subscription management");
    }
  };

  const tierInfo = subscription.tier ? TIERS[subscription.tier] : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 min-h-screen">
      <div 
        className={`transition-all duration-1000 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
          My Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your profile and membership</p>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* Profile Card */}
        <div 
          className={`rounded-2xl border bg-card p-8 shadow-card transition-all duration-700 ease-out hover:shadow-card-hover hover:scale-[1.02] ${
            mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-accent/10 p-3 transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <User className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="transition-all duration-300 hover:translate-x-1">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted transition-all duration-300 focus:ring-2 focus:ring-accent" />
            </div>
            <div className="transition-all duration-300 hover:translate-x-1">
              <Label>Full Name</Label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                className="transition-all duration-300 focus:ring-2 focus:ring-accent focus:scale-[1.01]"
              />
            </div>
            <div className="transition-all duration-300 hover:translate-x-1">
              <Label>Phone</Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="transition-all duration-300 focus:ring-2 focus:ring-accent focus:scale-[1.01]"
              />
            </div>
            <Button 
              onClick={updateProfile} 
              disabled={loading} 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Membership Card */}
        <div 
          className={`rounded-2xl border bg-card p-8 shadow-card transition-all duration-700 ease-out hover:shadow-card-hover hover:scale-[1.02] ${
            mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-accent/10 p-3 transition-transform duration-300 hover:scale-110 hover:rotate-12">
              <Crown className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold">Membership</h2>
          </div>

          {subscription.subscribed && tierInfo ? (
            <div className="space-y-5">
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-accent/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                    {tierInfo.name}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold">{tierInfo.name} Membership</p>
                <p className="mt-1 text-lg font-semibold text-accent">{tierInfo.price}/mo</p>
              </div>
              {subscription.subscriptionEnd && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground transition-all duration-300 hover:translate-x-1">
                  <Calendar className="h-4 w-4" />
                  Renews: {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  className="transition-all duration-300 hover:scale-[1.02] hover:bg-accent/10 hover:border-accent"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/members")}
                  className="transition-all duration-300 hover:scale-[1.02] hover:bg-accent/10 hover:border-accent"
                >
                  Access Members Area
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => generateCertificate(fullName || "Member", tierInfo.name)}
                  className="transition-all duration-300 hover:scale-[1.02] hover:bg-accent/10 hover:border-accent"
                >
                  <Download className="mr-2 h-4 w-4" /> Download Certificate
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">You don't have an active membership.</p>
              <Button 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95" 
                onClick={() => navigate("/#pricing")}
              >
                View Plans
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full transition-all duration-300 hover:scale-[1.02]" 
                onClick={checkSubscription}
              >
                Refresh Status
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}