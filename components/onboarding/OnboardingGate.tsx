"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGetUserSession } from "@/hooks/integration/auth/queries";
import { useCompleteOnboarding } from "@/hooks/integration/auth/mutations";
import OnboardingBalloon from "./OnboardingBalloon";

export default function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = useGetUserSession();
  const completeOnboarding = useCompleteOnboarding();
  const [balloonVisible, setBalloonVisible] = useState(true);

  const onboardingPending =
    session != null && session.onboarding_completed_at === null;
  const isOnOnboardingPage = pathname === "/admin/onboarding";

  const showBalloon =
    !isLoading && onboardingPending && balloonVisible && !isOnOnboardingPage;

  const handleStart = () => {
    setBalloonVisible(false);
    router.push("/admin/onboarding");
  };

  const handleLater = () => {
    setBalloonVisible(false);
  };

  const handleDismiss = async () => {
    try {
      await completeOnboarding.mutateAsync();
      setBalloonVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) return null;

  return (
    <>
      {showBalloon && (
        <OnboardingBalloon
          onStart={handleStart}
          onLater={handleLater}
          onDismiss={handleDismiss}
          isDismissing={completeOnboarding.isPending}
        />
      )}
    </>
  );
}
