import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
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
      </VStack>
    </Box>
  );
}
