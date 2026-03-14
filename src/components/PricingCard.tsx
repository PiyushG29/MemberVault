import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TierKey, TIERS } from "@/lib/membership";

interface PricingCardProps {
  tierKey: TierKey;
}

export default function PricingCard({ tierKey }: PricingCardProps) {
  const tier = TIERS[tierKey];
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const isHighlighted = "highlighted" in tier && tier.highlighted;
  const isCurrentPlan = subscription.tier === tierKey;

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth?tab=register");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:shadow-card-hover ${
        isHighlighted
          ? "border-accent shadow-gold bg-card scale-[1.02]"
          : "border-border shadow-card bg-card"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-foreground">
          <Sparkles className="h-3 w-3" /> Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        {tier.name}
      </h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold">{tier.price}</span>
        <span className="text-muted-foreground">/{tier.interval}</span>
      </div>

      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`mt-8 w-full ${
          isHighlighted
            ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold"
            : ""
        }`}
        variant={isHighlighted ? "default" : "outline"}
        size="lg"
        onClick={handleSubscribe}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "Current Plan" : "Get Started"}
      </Button>
    </div>
  );
}
