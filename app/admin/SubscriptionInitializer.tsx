"use client";

import { useValidateSubscription } from "@/hooks/utils/use-validate-subscription";

export default function SubscriptionInitializer() {
  useValidateSubscription();
  return null;
}
