export const TIERS = {
  basic: {
    name: "Basic",
    price: "₹499",
    priceAmount: 499,
    interval: "month",
    price_id: "price_1T6pB35wVTZyGsgPBLHAlBxs",
    product_id: "prod_U4z93eyUiPVC0z",
    features: [
      "Access to member-only content",
      "Community forum access",
      "Basic resource library",
      "Monthly newsletter",
      "Membership certificate",
    ],
  },
  premium: {
    name: "Premium",
    price: "₹999",
    priceAmount: 999,
    interval: "month",
    price_id: "price_1T6pCI5wVTZyGsgPQXH59wOg",
    product_id: "prod_U4zApySz0rqGtc",
    features: [
      "Everything in Basic",
      "Premium resource library",
      "1-on-1 mentoring sessions",
      "Priority support",
      "Exclusive webinars",
      "Downloadable templates",
      "Premium certificate",
    ],
    highlighted: true,
  },
} as const;

export type TierKey = keyof typeof TIERS;

export function getTierByProductId(productId: string): TierKey | null {
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return null;
}
