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
import { BarChart3, Info, Ruler, Weight, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

export default function PanelDetailsScreen() {
  const { panelId } = useLocalSearchParams<{ panelId: Id<"solar_modules"> }>();
  const panel = useQuery(api.modules.getModuleById, { id: panelId });

  if (panel === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (panel === null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No se encontró el panel solar.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Detalles del Panel",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {panel.imageUrl && (
          <Box className="bg-background-50 p-6 items-center border-b border-outline-100">
            <Image
              source={{ uri: panel.imageUrl }}
              style={{ width: "100%", height: 300 }}
              contentFit="contain"
            />
          </Box>
        )}

        <VStack space="xl" className="p-4">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-950">
              {panel.brand}
            </Heading>
            <Heading size="lg" className="text-primary-600 font-medium italic">
              {panel.model}
            </Heading>
            <Text size="xl" className="font-bold text-success-700 mt-2">
              ${panel.price.toLocaleString()} por unidad
            </Text>
          </VStack>

          <Card variant="outline" className="p-4">
            <VStack space="lg">
              <HStack className="items-center" space="md">
                <Box className="p-2 rounded-full bg-primary-100">
                  <Zap size={20} className="text-primary-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Potencia Máxima (Pmax)
                  </Text>
                  <Text size="md" className="font-bold">
                    {panel.pmax} Wp
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="p-2 rounded-full bg-success-100">
                  <BarChart3 size={20} className="text-success-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Eficiencia
                  </Text>
                  <Text size="md" className="font-bold">
                    {(panel.efficiency * 100).toFixed(2)}%
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="p-2 rounded-full bg-blue-100">
                  <Ruler size={20} className="text-blue-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Dimensiones
                  </Text>
                  <Text size="md" className="font-bold">
                    {panel.dimensions}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="p-2 rounded-full bg-orange-100">
                  <Weight size={20} className="text-orange-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Peso
                  </Text>
                  <Text size="md" className="font-bold">
                    {panel.weight} kg
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          <VStack space="md">
            <Heading size="md" className="flex-row items-center">
              <Info size={20} className="mr-2 inline" /> Especificaciones
              Eléctricas
            </Heading>
            <VStack className="bg-background-50 rounded-lg border border-outline-100 overflow-hidden">
              <SpecRow
                label="Voltaje Máximo (Vmp)"
                value={`${panel.vmp} V`}
                isOdd
              />
              <SpecRow
                label="Corriente Máxima (Imp)"
                value={`${panel.imp} A`}
              />
              <SpecRow
                label="Voltaje Circuito Abierto (Voc)"
                value={`${panel.voc} V`}
                isOdd
              />
              <SpecRow
                label="Corriente Cortocircuito (Isc)"
                value={`${panel.isc} A`}
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
