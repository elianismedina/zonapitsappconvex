import React from "react";
import { Box, Button, ButtonText, Text, VStack } from "@/components/ui";
import { useRouter } from "expo-router";

export const EmptyKitsView = () => {
  const router = useRouter();
  
  return (
    <Box className="flex-1 justify-center items-center">
      <VStack space="lg" className="items-center">
        <Text size="lg" className="text-center">
          No tienes kits registrados.
        </Text>
        <Button
          size="md"
          variant="solid"
          action="primary"
          onPress={() => router.push("/(auth)/(tabs)/location")}
        >
          <ButtonText>Crear un Kit</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
