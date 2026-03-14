export type PlanCode = "starter" | "professional" | "enterprise";
export type SubscriptionStatus = "active" | "trial" | "expired" | "suspended";

export interface Plan {
  id: number;
  code: PlanCode;
  name: string;
  max_users: number;
  max_lots_per_month: number;
  features: Record<string, boolean>;
  price_monthly: string; // decimal string
}

export interface TenantSubscription {
  id: number;
  plan: Plan;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
