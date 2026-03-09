export type PlanId = "plan_1y" | "plan_5y" | "plan_20y";

export const plans: Record<PlanId, { label: string; years: number; amount: number; stripePriceId?: string }> = {
  plan_1y: {
    label: "1 rok",
    years: 1,
    amount: 10,
    stripePriceId: process.env.STRIPE_PRICE_ID_1Y,
  },
  plan_5y: {
    label: "5 lat",
    years: 5,
    amount: 45,
    stripePriceId: process.env.STRIPE_PRICE_ID_5Y,
  },
  plan_20y: {
    label: "20 lat",
    years: 20,
    amount: 150,
    stripePriceId: process.env.STRIPE_PRICE_ID_20Y,
  },
};
