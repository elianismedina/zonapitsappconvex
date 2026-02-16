import React from "react";
import { HStack, VStack, Text, Heading } from "@/components/ui";

interface KitBillDetailsProps {
  provider?: string;
  billingPeriod?: string;
  monthlyConsumptionKwh?: number;
  energyRate?: number;
  totalAmount?: number;
  currency?: string;
  showTitle?: boolean;
  variant?: "compact" | "full";
}

export const KitBillDetails = ({
  provider,
  billingPeriod,
  monthlyConsumptionKwh,
  energyRate,
  totalAmount,
  currency = "$",
  showTitle = false,
  variant = "full",
}: KitBillDetailsProps) => {
  const isCompact = variant === "compact";

  return (
    <VStack space={isCompact ? "xs" : "md"} className="w-full">
      {showTitle && (
        <Heading size="sm" className="mb-1">
          Detalles de Factura
        </Heading>
      )}
      
      <HStack className="justify-between items-center">
        <Text size="sm" className="text-typography-500">Proveedor:</Text>
        <Text size="sm" className="font-bold">{provider || "N/A"}</Text>
      </HStack>

      <HStack className="justify-between items-center">
        <Text size="sm" className="text-typography-500">Periodo:</Text>
        <Text size="sm" className="font-bold">{billingPeriod || "N/A"}</Text>
      </HStack>

      <HStack 
        className={`justify-between items-center ${!isCompact ? "border-t border-outline-200 pt-2" : ""}`}
      >
        <Text size="sm" className="text-typography-500">Consumo:</Text>
        <Text size={isCompact ? "sm" : "lg"} className="font-bold">
          {monthlyConsumptionKwh ?? 0} kWh
        </Text>
      </HStack>

      {energyRate !== undefined && (
        <HStack className="justify-between items-center">
          <Text size="sm" className="text-typography-500">Tarifa:</Text>
          <Text size="sm" className="font-bold">{currency} {energyRate}</Text>
        </HStack>
      )}

      <HStack className="justify-between items-center">
        <Text size="sm" className="text-typography-500">Total:</Text>
        <Text size="sm" className="font-bold">{currency} {totalAmount ?? 0}</Text>
      </HStack>
    </VStack>
  );
};
