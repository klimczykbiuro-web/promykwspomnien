export type PlanId = "plan_1y" | "plan_5y" | "plan_20y";

type Plan = {
  label: string;
  years: number;
  amount: number; // grosze
  currency: "pln";
};

export const plans: Record<PlanId, Plan> = {
  plan_1y: {
    label: "1 rok",
    years: 1,
    amount: 1000,
    currency: "pln",
  },
  plan_5y: {
    label: "5 lat",
    years: 5,
    amount: 4500,
    currency: "pln",
  },
  plan_20y: {
    label: "20 lat",
    years: 20,
    amount: 15000,
    currency: "pln",
  },
};
