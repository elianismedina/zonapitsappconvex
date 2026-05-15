import { hasSeenOnboarding, Onboarding } from "@/components/Onboarding";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function OnboardingScreen() {
  const { replace } = useRouter();

  useEffect(() => {
    // If user has already seen onboarding, go directly to login
    hasSeenOnboarding().then((seen) => {
      if (seen) {
        replace("/(public)");
      }
    });
  }, [replace]);

  const handleComplete = () => {
    replace("/(public)");
  };

  return <Onboarding onComplete={handleComplete} />;
}