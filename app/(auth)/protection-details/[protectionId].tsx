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
import { Info, Shield, Tag, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

export default function ProtectionDetailsScreen() {
  const { protectionId } = useLocalSearchParams<{
    protectionId: Id<"protections">;
  }>();
  const protection = useQuery(api.protections.getProtectionById, {
    id: protectionId,
  });

  if (protection === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (protection === null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No se encontró el dispositivo de protección.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Detalles de Protección",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {protection.imageUrl && (
          <Box className="items-center border-b border-outline-100 bg-background-50 p-6">
            <Image
              source={{ uri: protection.imageUrl }}
              style={{ width: "100%", height: 300 }}
              contentFit="contain"
            />
          </Box>
        )}

        <VStack space="xl" className="p-4">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-950">
              {protection.name}
            </Heading>
            <Heading size="lg" className="font-medium text-error-600 italic">
              {protection.subcategory}
            </Heading>
            <Text size="xl" className="mt-2 font-bold text-success-700">
              ${" "}
              {protection.price
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </Text>
          </VStack>

          <Card variant="outline" className="p-4">
            <VStack space="md">
              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-error-100 p-2">
                  <Shield size={20} className="text-error-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Categoría
                  </Text>
                  <Text size="md" className="font-bold">
                    {protection.category}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-orange-100 p-2">
                  <Zap size={20} className="text-orange-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Subcategoría
                  </Text>
                  <Text size="md" className="font-bold">
                    {protection.subcategory}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-blue-100 p-2">
                  <Tag size={20} className="text-blue-600" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Calificación / Rating
                  </Text>
                  <Text size="md" className="font-bold">
                    {protection.rating}
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
              <SpecRow label="Nombre" value={protection.name} isOdd />
              <SpecRow label="Categoría" value={protection.category} />
              <SpecRow
                label="Subcategoría"
                value={protection.subcategory}
                isOdd
              />
              <SpecRow label="Rating" value={protection.rating} />
              <SpecRow
                label="Precio"
                value={`$ ${protection.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`}
                isOdd
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
