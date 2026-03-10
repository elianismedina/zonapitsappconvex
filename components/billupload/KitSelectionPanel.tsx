import React from "react";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { KitSelector } from "@/components/billupload/KitSelector";
import { Id } from "@/convex/_generated/dataModel";

interface KitSelectionPanelProps {
  kits: any[] | undefined;
  safeKits: any[];
  selectedKitId: Id<"kits"> | null;
  onSelectKit: (id: Id<"kits">) => void;
  isDisabled: boolean;
  emptyText: string;
  emptyActionLabel: string;
  onCreateKit: () => void;
}

export const KitSelectionPanel = ({
  kits,
  safeKits,
  selectedKitId,
  onSelectKit,
  isDisabled,
  emptyText,
  emptyActionLabel,
  onCreateKit,
}: KitSelectionPanelProps) => {
  if (safeKits.length > 1) {
    return (
      <KitSelector
        kits={kits}
        selectedKitId={selectedKitId}
        onValueChange={onSelectKit}
        isDisabled={isDisabled}
      />
    );
  }

  if (safeKits.length === 1) {
    return (
      <Box className="rounded-lg border border-outline-300 bg-background-50 p-4">
        <VStack space="xs">
          <Text size="xs" className="font-bold text-typography-500 uppercase">
            Kit Seleccionado
          </Text>
          <Text size="md" className="font-medium text-typography-900">
            {safeKits[0].name}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="rounded-lg border border-outline-300 bg-background-50 p-4">
      <VStack space="sm" className="items-center">
        <Text className="text-center text-typography-500">{emptyText}</Text>
        <Button
          variant="solid"
          action="primary"
          onPress={onCreateKit}
          className="mt-2"
        >
          <ButtonText>{emptyActionLabel}</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
