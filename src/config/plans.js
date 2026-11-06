// Subscription plans -> feature flags. Backend later returns the tenant's entitlements; this is the contract.
export const PLANS = {
  starter: {
    name: "Starter",
    price: "₹24,999/mo",
    features: ["core", "pharmacy", "lab", "billing"],
  },
  professional: {
    name: "Professional",
    price: "₹74,999/mo",
    features: [
      "core",
      "pharmacy",
      "lab",
      "billing",
      "hr",
      "inventory",
      "analytics",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    features: [
      "core",
      "pharmacy",
      "lab",
      "billing",
      "hr",
      "inventory",
      "analytics",
      "ai",
      "automation",
      "audit",
      "multi_branch",
    ],
  },
};
export const FEATURE_LABELS = {
  core: "Core HMS",
  pharmacy: "Pharmacy",
  lab: "Laboratory",
  billing: "Billing & claims",
  hr: "HR & rostering",
  inventory: "Inventory & procurement",
  analytics: "Analytics",
  ai: "AI insights",
  automation: "Workflow automation",
  audit: "Audit trail",
  multi_branch: "Multi-branch",
};
