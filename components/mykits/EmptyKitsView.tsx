import { Box, Button, ButtonText, Text, VStack } from "@/components/ui";
import { useRouter } from "expo-router";
import React from "react";

export const EmptyKitsView = () => {
  const router = useRouter();

  return (
    <Box className="flex-1 justify-center items-center">
      <Box className="p-6 bg-background-50 rounded-xl border border-outline-200 w-full max-w-xs">
        <VStack space="md" className="items-center">
          <Text className="text-center text-typography-500">
            No tienes kits creados aún en tu garaje solar.
          </Text>
          <Button
            variant="solid"
            action="primary"
            onPress={() => router.push("/(auth)/(tabs)/location")}
          >
            <ButtonText>Armar kit</ButtonText>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
