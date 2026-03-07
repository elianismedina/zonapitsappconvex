import { LoadingAnimation } from "@/components/LoadingAnimation";
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Info, Zap } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function InverterSelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const inverters = useQuery(api.inverters.getInverters);
  const addComponent = useMutation(api.kit_components.addComponent);

  const [selectedInverterId, setSelectedInverterId] =
    useState<Id<"inverters"> | null>(null);

  const handleConfirmSelection = async () => {
    if (!selectedInverterId || !kitId) return;

    try {
      await addComponent({
        kitId,
        type: "inverter",
        inverterId: selectedInverterId,
        quantity: 1, // Usually 1 inverter per kit, but this can be adjusted if needed
      });

      Alert.alert("¡Éxito!", "Se ha añadido el inversor a tu kit.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/(tabs)/mykits"),
        },
      ]);
    } catch (error) {
      console.error("Error adding component:", error);
      Alert.alert("Error", "No se pudo añadir el inversor al kit.");
    }
  };

  if (inverters === undefined || !kit) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} />
        <Text className="mt-4 text-typography-500">
          Cargando opciones de inversores...
        </Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Seleccionar Inversor",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Box className="rounded-xl border border-primary-100 bg-primary-50 p-4">
            <Heading size="md" className="mb-2 text-primary-900">
              Inversor para {kit.name}
            </Heading>
            <Text size="sm" className="text-primary-700">
              Selecciona el inversor que mejor se adapte a tu sistema.
            </Text>
          </Box>

          <VStack space="md">
            <Heading size="lg">Opciones Disponibles</Heading>

            {inverters.map((inverter) => (
              <Pressable
                key={inverter._id}
                onPress={() => setSelectedInverterId(inverter._id)}
                className={`flex-row items-center rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                  selectedInverterId === inverter._id
                    ? "border-primary-500 bg-primary-0"
                    : "border-outline-100"
                }`}
              >
                {inverter.imageUrl ? (
                  <Image
                    source={{ uri: inverter.imageUrl }}
                    style={{ width: 80, height: 80 }}
                    contentFit="contain"
                    className="mr-4 rounded-lg bg-background-50"
                  />
                ) : (
                  <Box className="mr-4 h-20 w-20 items-center justify-center rounded-lg bg-background-50">
                    <Zap size={32} color="#3B82F6" />
                  </Box>
                )}
                <VStack className="flex-1">
                  <HStack className="items-start justify-between">
                    <VStack className="flex-1">
                      <Text className="text-lg font-bold text-typography-900">
                        {inverter.brand}
                      </Text>
                      <Text size="sm" className="text-typography-500">
                        {inverter.model}
                      </Text>
                    </VStack>
                    <Box className="rounded-md bg-secondary-100 px-2 py-1">
                      <Text size="xs" className="font-bold text-secondary-700">
                        {inverter.power / 1000}kW
                      </Text>
                    </Box>
                  </HStack>

                  <HStack className="mt-3 items-end justify-between">
                    <VStack>
                      <Text size="xs" className="text-typography-400">
                        Tipo
                      </Text>
                      <Text
                        size="sm"
                        className="font-medium text-typography-700"
                      >
                        {inverter.type}
                      </Text>
                    </VStack>
                    <VStack className="items-end">
                      <Text size="xs" className="text-typography-400">
                        Precio
                      </Text>
                      <Text size="lg" className="font-bold text-success-700">
                        ${" "}
                        {inverter.price
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                      </Text>
                    </VStack>
                  </HStack>

                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 h-auto self-start p-0"
                    onPress={() => {
                      router.push({
                        pathname: "/(auth)/inverter-details/[inverterId]",
                        params: { inverterId: inverter._id },
                      });
                    }}
                  >
                    <HStack space="xs" className="items-center">
                      <Info size={14} className="text-primary-600" />
                      <ButtonText className="text-xs text-primary-600">
                        Ver detalles técnicos
                      </ButtonText>
                    </HStack>
                  </Button>
                </VStack>
              </Pressable>
            ))}
          </VStack>
        </VStack>
      </ScrollView>

      <Box className="border-t border-outline-100 bg-white p-4 pb-8">
        <Button
          size="lg"
          className="w-full"
          isDisabled={!selectedInverterId}
          onPress={handleConfirmSelection}
        >
          <ButtonText>Confirmar y Añadir al Kit</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
