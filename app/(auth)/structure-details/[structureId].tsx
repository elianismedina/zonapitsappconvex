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
import { Hammer, Info, Layers, Tag } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

export default function StructureDetailsScreen() {
  const { structureId } = useLocalSearchParams<{
    structureId: Id<"structures">;
  }>();
  const structure = useQuery(api.structures.getStructureById, {
    id: structureId,
  });

  if (structure === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (structure === null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No se encontró la estructura.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Detalles de la Estructura",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {structure.imageUrl && (
          <Box className="items-center border-b border-outline-100 bg-background-50 p-6">
            <Image
              source={{ uri: structure.imageUrl }}
              style={{ width: "100%", height: 300 }}
              contentFit="contain"
            />
          </Box>
        )}

        <VStack space="xl" className="p-4">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-950">
              {structure.name}
            </Heading>
            <Heading size="lg" className="font-medium text-secondary-600 italic">
              {structure.type}
            </Heading>
            <Text size="xl" className="mt-2 font-bold text-success-700">
              ${" "}
              {structure.pricePerUnit
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
              <Text size="sm" className="font-normal text-typography-500">
                / unidad
              </Text>
            </Text>
          </VStack>

          <Card variant="outline" className="p-4">
            <VStack space="md">
              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-secondary-100 p-2">
                  <Hammer size={20} className="text-secondary-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Tipo de Estructura
                  </Text>
                  <Text size="md" className="font-bold">
                    {structure.type}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-orange-100 p-2">
                  <Layers size={20} className="text-orange-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Material
                  </Text>
                  <Text size="md" className="font-bold">
                    {structure.material || "N/A"}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-success-100 p-2">
                  <Tag size={20} className="text-success-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Precio por Unidad
                  </Text>
                  <Text size="md" className="font-bold">
                    ${" "}
                    {structure.pricePerUnit
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
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
              <SpecRow label="Nombre" value={structure.name} isOdd />
              <SpecRow label="Tipo" value={structure.type} />
              <SpecRow
                label="Material"
                value={structure.material || "N/A"}
                isOdd
              />
              <SpecRow
                label="Precio por Unidad"
                value={`$ ${structure.pricePerUnit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`}
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
