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
import { Cable, Info, Tag, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function WiringDetailsScreen() {
  const { wiringId } = useLocalSearchParams<{ wiringId: Id<"wiring"> }>();
  const wiring = useQuery(api.wiring.getWiringById, { id: wiringId });

  if (wiring === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (wiring === null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No se encontró el cableado.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Detalles del Cableado",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {wiring.imageUrl && (
          <Box className="items-center border-b border-outline-100 bg-background-50 p-6">
            <Image
              source={{ uri: wiring.imageUrl }}
              style={{ width: "100%", height: 300 }}
              contentFit="contain"
            />
          </Box>
        )}

        <VStack space="xl" className="p-4">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-950">
              {wiring.name}
            </Heading>
            {wiring.brand && (
              <Heading size="lg" className="font-medium text-orange-600 italic">
                {wiring.brand}
              </Heading>
            )}
            <Text size="xl" className="mt-2 font-bold text-success-700">
              $ {fmt(wiring.pricePerMeter)}{" "}
              <Text size="sm" className="font-normal text-typography-500">
                / metro
              </Text>
            </Text>
          </VStack>

          <Card variant="outline" className="p-4">
            <VStack space="md">
              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-orange-100 p-2">
                  <Cable size={20} color="#F97316" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Tipo de Cable
                  </Text>
                  <Text size="md" className="font-bold">
                    {wiring.type}
                  </Text>
                </VStack>
              </HStack>

              {wiring.brand && (
                <HStack className="items-center" space="md">
                  <Box className="rounded-full bg-blue-100 p-2">
                    <Zap size={20} color="#3B82F6" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="sm" className="text-typography-500">
                      Marca
                    </Text>
                    <Text size="md" className="font-bold">
                      {wiring.brand}
                    </Text>
                  </VStack>
                </HStack>
              )}

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-success-100 p-2">
                  <Tag size={20} color="#16a34a" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Precio por Metro
                  </Text>
                  <Text size="md" className="font-bold">
                    $ {fmt(wiring.pricePerMeter)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          <VStack space="md">
            <Heading size="md" className="flex-row items-center">
              <Info size={20} className="mr-2 inline" /> Especificaciones
            </Heading>
            <VStack className="overflow-hidden rounded-lg border border-outline-100 bg-background-50">
              <SpecRow label="Nombre" value={wiring.name} isOdd />
              <SpecRow label="Tipo" value={wiring.type} />
              <SpecRow label="Marca" value={wiring.brand || "N/A"} isOdd />
              <SpecRow
                label="Precio por Metro"
                value={`$ ${fmt(wiring.pricePerMeter)}`}
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
