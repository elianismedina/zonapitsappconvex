import {
  Box,
  Card,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { BarChart3, Battery, Info, Share2, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

export default function BatteryDetailsScreen() {
  const { batteryId } = useLocalSearchParams<{ batteryId: Id<"batteries"> }>();
  const battery = useQuery(api.batteries.getBatteryById, { id: batteryId });

  if (battery === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (battery === null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No se encontró la batería.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Detalles de la Batería",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {battery.imageUrl && (
          <Box className="items-center border-b border-outline-100 bg-background-50 p-6">
            <Image
              source={{ uri: battery.imageUrl }}
              style={{ width: "100%", height: 300 }}
              contentFit="contain"
            />
          </Box>
        )}

        <VStack space="xl" className="p-4">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-950">
              {battery.brand}
            </Heading>
            <Heading size="lg" className="font-medium text-success-600 italic">
              {battery.model}
            </Heading>
            <Text size="xl" className="mt-2 font-bold text-success-700">
              $ {battery.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </Text>
          </VStack>

          <Card variant="outline" className="p-4">
            <VStack space="md">
              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-success-100 p-2">
                  <Battery size={20} className="text-success-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Energía Nominal
                  </Text>
                  <Text size="md" className="font-bold">
                    {battery.nominalEnergyWh || battery.capacity * 1000} Wh
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-blue-100 p-2">
                  <Zap size={20} className="text-blue-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Voltaje Nominal
                  </Text>
                  <Text size="md" className="font-bold">
                    {battery.voltage || "N/A"} V
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-orange-100 p-2">
                  <BarChart3 size={20} className="text-orange-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Ciclos de Vida
                  </Text>
                  <Text size="sm" className="font-bold">
                    {battery.lifeCycles || "N/A"}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-secondary-100 p-2">
                  <Share2 size={20} className="text-secondary-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Comunicación
                  </Text>
                  <Text size="sm" className="font-bold">
                    {battery.communication || "N/A"}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          <VStack space="md">
            <Heading size="md" className="flex-row items-center">
              <Info size={20} className="mr-2 inline" /> Especificaciones
              Técnicas
            </Heading>
            <VStack className="overflow-hidden rounded-lg border border-outline-100 bg-background-50">
              <SpecRow
                label="Capacidad Nominal"
                value={
                  battery.nominalCapacityAh
                    ? `${battery.nominalCapacityAh} Ah`
                    : "N/A"
                }
                isOdd
              />
              <SpecRow
                label="V. Carga Recomendado"
                value={
                  battery.recommendedChargeVoltage
                    ? `${battery.recommendedChargeVoltage} V`
                    : "N/A"
                }
              />
              <SpecRow
                label="Corriente de Carga"
                value={battery.chargeCurrent || "N/A"}
                isOdd
              />
              <SpecRow
                label="Corriente de Descarga"
                value={battery.dischargeCurrent || "N/A"}
              />
              <SpecRow
                label="V. Corte (Descarga)"
                value={
                  battery.endOfDischargeVoltage
                    ? `${battery.endOfDischargeVoltage} V`
                    : "N/A"
                }
                isOdd
              />
              <SpecRow
                label="Temp. Operación"
                value={battery.operatingTemperature || "N/A"}
              />
              <SpecRow
                label="Temp. Almacenamiento"
                value={battery.storageTemperature || "N/A"}
                isOdd
              />
              <SpecRow
                label="Módulos en Paralelo"
                value={battery.parallelModules || "N/A"}
              />
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

function SpecRow({
  label,
  value,
  isOdd,
}: {
  label: string;
  value: string;
  isOdd?: boolean;
}) {
  return (
    <HStack
      className={`justify-between p-3 ${isOdd ? "bg-background-100" : ""}`}
    >
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
      <Text size="sm" className="font-bold">
        {value}
      </Text>
    </HStack>
  );
}
