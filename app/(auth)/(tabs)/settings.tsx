import { Box, Button, ButtonText, Heading, Text, VStack } from "@/components/ui";
import { resetOnboarding } from "@/components/Onboarding"; // Import resetOnboarding
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    alert("Onboarding has been reset! Please restart the app to see the onboarding flow again.");
    router.replace("/"); // Optionally redirect to trigger onboarding re-display
  };

  return (
    <Box className="flex-1 justify-center p-4">
      <VStack space="md" className="items-center">
        <Heading size="2xl" className="mb-4">
          Perfil
        </Heading>
        <Box className="w-full">
          <Text size="lg">
            Nombre: {user?.firstName} {user?.lastName}
          </Text>
          <Text size="lg">Correo: {user?.emailAddresses[0]?.emailAddress}</Text>
          <Text size="lg">Usuario: {user?.username}</Text>
        </Box>
        <Button
          onPress={handleSignOut}
          action="negative"
          className="mt-6 w-full"
        >
          <ButtonText>Salir</ButtonText>
        </Button>
        <Button
          onPress={handleResetOnboarding}
          action="secondary"
          className="mt-4 w-full"
        >
          <ButtonText>Reset Onboarding</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
