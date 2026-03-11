export type PlanId = "plan_1y" | "plan_5y" | "plan_20y";

type Plan = {
  label: string;
  years: number;
  amount: number; // grosze
  currency: "pln";
  stripePriceId?: string;
};

export const plans: Record<PlanId, Plan> = {
  plan_1y: {
    label: "1 rok",
    years: 1,
    amount: 1000,
    currency: "pln",
    stripePriceId: process.env.STRIPE_PRICE_ID_1Y,
  },
  plan_5y: {
    label: "5 lat",
    years: 5,
    amount: 4500,
    currency: "pln",
    stripePriceId: process.env.STRIPE_PRICE_ID_5Y,
  },
  plan_20y: {
    label: "20 lat",
    years: 20,
    amount: 15000,
    currency: "pln",
    stripePriceId: process.env.STRIPE_PRICE_ID_20Y,
  },
};