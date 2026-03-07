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
import { Battery, Info } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function BatterySelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const batteries = useQuery(api.batteries.getBatteries);
  const addComponent = useMutation(api.kit_components.addComponent);

  const [selectedBatteryId, setSelectedBatteryId] =
    useState<Id<"batteries"> | null>(null);

  const handleConfirmSelection = async () => {
    if (!selectedBatteryId || !kitId) return;

    try {
      await addComponent({
        kitId,
        type: "battery",
        batteryId: selectedBatteryId,
        quantity: 1, // Default quantity, can be adjusted in the UI later if needed
      });

      Alert.alert("¡Éxito!", "Se ha añadido la batería a tu kit.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/(tabs)/mykits"),
        },
      ]);
    } catch (error) {
      console.error("Error adding component:", error);
      Alert.alert("Error", "No se pudo añadir la batería al kit.");
    }
  };

  if (batteries === undefined || !kit) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} />
        <Text className="mt-4 text-typography-500">
          Cargando opciones de baterías...
        </Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Seleccionar Batería",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Box className="rounded-xl border border-primary-100 bg-primary-50 p-4">
            <Heading size="md" className="mb-2 text-primary-900">
              Batería para {kit.name}
            </Heading>
            <Text size="sm" className="text-primary-700">
              Selecciona la batería que mejor se adapte a tu sistema de
              almacenamiento.
            </Text>
          </Box>

          <VStack space="md">
            <Heading size="lg">Opciones Disponibles</Heading>

            {batteries.map((currBattery) => (
              <Pressable
                key={currBattery._id}
                onPress={() => setSelectedBatteryId(currBattery._id)}
                className={`flex-row items-center rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                  selectedBatteryId === currBattery._id
                    ? "border-primary-500 bg-primary-0"
                    : "border-outline-100"
                }`}
              >
                {currBattery.imageUrl ? (
                  <Image
                    source={{ uri: currBattery.imageUrl }}
                    style={{ width: 80, height: 80 }}
                    contentFit="contain"
                    className="mr-4 rounded-lg bg-background-50"
                  />
                ) : (
                  <Box className="mr-4 h-20 w-20 items-center justify-center rounded-lg bg-background-50">
                    <Battery size={32} color="#22C55E" />
                  </Box>
                )}
                <VStack className="flex-1">
                  <HStack className="items-start justify-between">
                    <VStack className="flex-1">
                      <Text className="text-lg font-bold text-typography-900">
                        {currBattery.brand}
                      </Text>
                      <Text size="sm" className="text-typography-500">
                        {currBattery.model}
                      </Text>
                    </VStack>
                    <Box className="rounded-md bg-success-100 px-2 py-1">
                      <Text size="xs" className="font-bold text-success-700">
                        {currBattery.capacity}kWh
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
                        {currBattery.type}
                      </Text>
                    </VStack>
                    <VStack className="items-end">
                      <Text size="xs" className="text-typography-400">
                        Precio
                      </Text>
                      <Text size="lg" className="font-bold text-success-700">
                        ${" "}
                        {currBattery.price
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
                        pathname: "/(auth)/battery-details/[batteryId]",
                        params: { batteryId: currBattery._id },
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
          isDisabled={!selectedBatteryId}
          onPress={handleConfirmSelection}
        >
          <ButtonText>Confirmar y Añadir al Kit</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
