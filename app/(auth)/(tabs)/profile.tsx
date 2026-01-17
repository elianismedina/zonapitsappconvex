import { useUser, useClerk } from "@clerk/clerk-expo";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
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
          Profile
        </Heading>
        <Box className="w-full">
          <Text size="lg">
            Name: {user?.firstName} {user?.lastName}
          </Text>
          <Text size="lg">
            Email: {user?.emailAddresses[0]?.emailAddress}
          </Text>
          <Text size="lg">
            Username: {user?.username}
          </Text>
        </Box>
        <Button 
          onPress={handleSignOut} 
          action="negative" 
          className="mt-6 w-full"
        >
          <ButtonText>Sign Out</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}