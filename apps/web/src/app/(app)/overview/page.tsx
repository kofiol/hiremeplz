"use client";

import { useEffect, useState } from "react";
import { useSession } from "../../auth/session-provider";
import { OnboardingChatbot } from "@/components/onboarding-chatbot";
import { OverviewCopilot } from "@/components/overview-copilot";

export default function OverviewPage() {
  const { session, isLoading } = useSession();
  const [isGuardChecked, setIsGuardChecked] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState<number>(0);
  const [isCheckingCompleteness, setIsCheckingCompleteness] = useState(true);

  useEffect(() => {
    async function guardOverview() {
      if (isLoading) {
        return;
      }

      if (!session) {
        return;
      }

      try {
        const response = await fetch("/api/v1/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          setIsGuardChecked(true);
          setIsCheckingCompleteness(false);
          return;
        }

        const payload = await response.json();
        const completeness =
          typeof payload.profile_completeness_score === "number"
            ? payload.profile_completeness_score
            : 0;

        setProfileCompleteness(completeness);
      } finally {
        setIsGuardChecked(true);
        setIsCheckingCompleteness(false);
      }
    }

    guardOverview();
  }, [isLoading, session]);

  if (!isGuardChecked || isCheckingCompleteness) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If profile is incomplete (< 80%), show the onboarding chatbot
  if (profileCompleteness < 0.8) {
    return <OnboardingChatbot />;
  }

  return <OverviewCopilot />;
}
