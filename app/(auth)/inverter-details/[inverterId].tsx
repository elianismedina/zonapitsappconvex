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
import { Activity, BarChart3, Cpu, Info, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

export default function InverterDetailsScreen() {
  const { inverterId } = useLocalSearchParams<{
    inverterId: Id<"inverters">;
  }>();
  const inverter = useQuery(api.inverters.getInverterById, { id: inverterId });

  if (inverter === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (inverter === null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No se encontró el inversor.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Detalles del Inversor",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {inverter.imageUrl && (
          <Box className="items-center border-b border-outline-100 bg-background-50 p-6">
            <Image
              source={{ uri: inverter.imageUrl }}
              style={{ width: "100%", height: 300 }}
              contentFit="contain"
            />
          </Box>
        )}

        <VStack space="xl" className="p-4">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-950">
              {inverter.brand}
            </Heading>
            <Heading size="lg" className="font-medium text-primary-600 italic">
              {inverter.model}
            </Heading>
            <Text size="xl" className="mt-2 font-bold text-success-700">
              ${" "}
              {inverter.price
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
            </Text>
          </VStack>

          <Card variant="outline" className="p-4">
            <VStack space="md">
              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-primary-100 p-2">
                  <Zap size={20} className="text-primary-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Potencia Nominal
                  </Text>
                  <Text size="md" className="font-bold">
                    {inverter.nominalPower || inverter.power} W
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-success-100 p-2">
                  <BarChart3 size={20} className="text-success-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Eficiencia
                  </Text>
                  <Text size="md" className="font-bold">
                    {inverter.efficiency
                      ? (inverter.efficiency * 100).toFixed(1)
                      : "N/A"}
                    %
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-secondary-100 p-2">
                  <Cpu size={20} className="text-secondary-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Tipo de Inversor
                  </Text>
                  <Text size="md" className="font-bold">
                    {inverter.type}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-orange-100 p-2">
                  <Activity size={20} className="text-orange-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Onda de Salida
                  </Text>
                  <Text size="md" className="font-bold">
                    {inverter.waveForm || "Onda senoidal pura"}
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
                label="Máx. Potencia FV"
                value={inverter.maxPvPower ? `${inverter.maxPvPower} W` : "N/A"}
                isOdd
              />
              <SpecRow
                label="Pico de Arranque"
                value={inverter.peakPower ? `${inverter.peakPower} W` : "N/A"}
              />
              <SpecRow
                label="Tensión Salida AC"
                value={inverter.nominalOutputVoltage || "N/A"}
                isOdd
              />
              <SpecRow
                label="Frecuencia"
                value={inverter.frequency ? `${inverter.frequency} Hz` : "N/A"}
              />
              <SpecRow
                label="Tensión Batería"
                value={
                  inverter.batteryVoltage
                    ? `${inverter.batteryVoltage} VDC`
                    : "N/A"
                }
                isOdd
              />
              <SpecRow
                label="Carga MPPT"
                value={
                  inverter.mpptChargeCurrent
                    ? `${inverter.mpptChargeCurrent} A`
                    : "N/A"
                }
              />
              <SpecRow
                label="Corriente Entrada AC"
                value={inverter.acInputVoltage || "N/A"}
                isOdd
              />
              <SpecRow
                label="Máx. Tensión PV"
                value={
                  inverter.maxPvVoltage ? `${inverter.maxPvVoltage} VDC` : "N/A"
                }
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
