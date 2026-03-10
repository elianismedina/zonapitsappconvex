import React from "react";

import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { RoofType, RoofTypeOption } from "@/components/billupload/types";

interface RoofTypeSelectorProps {
  roofTypes: RoofTypeOption[];
  selectedRoofType: RoofType | null;
  onSelect: (roofType: RoofType) => void;
}

export const RoofTypeSelector = ({
  roofTypes,
  selectedRoofType,
  onSelect,
}: RoofTypeSelectorProps) => {
  return (
    <VStack space="md">
      {roofTypes.map((roofType) => {
        const isSelected = selectedRoofType === roofType.value;
        return (
          <Pressable
            key={roofType.value}
            onPress={() => onSelect(roofType.value)}
            className={`rounded-lg border p-4 ${
              isSelected
                ? "border-primary-600 bg-primary-50"
                : "border-outline-200 bg-background-50"
            }`}
          >
            <HStack space="md" className="items-center">
              <Text className="text-2xl">{roofType.icon}</Text>
              <VStack space="xs" className="flex-1">
                <Text
                  size="md"
                  className={`font-medium ${
                    isSelected ? "text-primary-600" : "text-typography-900"
                  }`}
                >
                  {roofType.label}
                </Text>
                <Text
                  size="xs"
                  className={`${
                    isSelected ? "text-primary-700" : "text-typography-500"
                  }`}
                >
                  {isSelected ? "Seleccionado" : "Toque para seleccionar"}
                </Text>
              </VStack>
              {isSelected && (
                <Box className="rounded-full bg-primary-600 p-1">
                  <Text className="text-sm text-white">✓</Text>
                </Box>
              )}
            </HStack>
          </Pressable>
        );
      })}
    </VStack>
  );
};
