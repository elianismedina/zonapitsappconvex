import { hasSeenOnboarding } from "@/components/Onboarding";
import { Onboarding } from "@/components/Onboarding";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function OnboardingScreen() {
  const router = useRouter();

  useEffect(() => {
    // If user has already seen onboarding, go directly to login
    hasSeenOnboarding().then((seen) => {
      if (seen) {
        router.replace("/(public)");
      }
    });
  }, [router]);

  const handleComplete = () => {
    router.replace("/(public)");
  };

  return <Onboarding onComplete={handleComplete} />;
}