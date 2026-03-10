import React from "react";

import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const PERCENTAGES = [50, 60, 70, 80, 90, 100];

interface GenerationPercentageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  isDisabled?: boolean;
}

export const GenerationPercentageSelector = ({
  value,
  onChange,
  isDisabled = false,
}: GenerationPercentageSelectorProps) => {
  return (
    <VStack
      space="md"
      className="rounded-xl border border-outline-100 bg-background-50 p-4"
    >
      <Heading size="sm">¿Qué porcentaje de tu factura quieres cubrir?</Heading>
      <Text size="xs" className="text-typography-500">
        Esto nos ayuda a dimensionar el kit ideal para tu presupuesto y espacio.
      </Text>
      <HStack space="xs" className="flex-wrap">
        {PERCENTAGES.map((val) => (
          <Button
            key={val}
            variant={value === val ? "solid" : "outline"}
            action={value === val ? "primary" : "secondary"}
            size="sm"
            onPress={() => onChange(val)}
            isDisabled={isDisabled}
            className="min-w-[60px] flex-1"
          >
            <ButtonText>{val}%</ButtonText>
          </Button>
        ))}
      </HStack>
    </VStack>
  );
};
