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
import { Cable, Minus, Plus } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function WiringSelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const wiringOptions = useQuery(api.wiring.getWiring);
  const components = useQuery(api.kit_components.getKitComponents, { kitId });
  const addComponent = useMutation(api.kit_components.addComponent);

  const [selectedMeters, setSelectedMeters] = useState<Record<string, number>>(
    {},
  );

  const solarModuleComponent = components?.find((c) => c.type === "solar_module");
  const panelCount = solarModuleComponent?.quantity || 0;

  const handleConfirmSelection = async () => {
    if (!kitId) return;

    try {
      const selectedEntries = Object.entries(selectedMeters).filter(
        ([, meters]) => meters > 0,
      );

      await Promise.all(
        selectedEntries.map(([wiringId, meters]) =>
          addComponent({
            kitId,
            type: "wiring",
            wiringId: wiringId as Id<"wiring">,
            quantity: meters,
          }),
        ),
      );

      Alert.alert("¡Éxito!", "Cableado añadido correctamente a tu kit.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/(tabs)/mykits"),
        },
      ]);
    } catch (error) {
      console.error("Error adding wiring:", error);
      Alert.alert("Error", "No se pudo añadir el cableado al kit.");
    }
  };

  const totals = useMemo(() => {
    if (!wiringOptions) {
      return { totalMeters: 0, totalAmount: 0 };
    }

    const items = wiringOptions.map((wiring) => {
      const meters = selectedMeters[wiring._id] ?? 0;
      const subtotal = meters * wiring.pricePerMeter;
      return { meters, subtotal };
    });

    const totalMeters = items.reduce((acc, item) => acc + item.meters, 0);
    const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);

    return { totalMeters, totalAmount };
  }, [wiringOptions, selectedMeters]);

  const updateMeters = (wiringId: Id<"wiring">, nextMeters: number) => {
    setSelectedMeters((prev) => ({
      ...prev,
      [wiringId]: Math.max(0, nextMeters),
    }));
  };

  if (wiringOptions === undefined || !kit) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} text="Cargando cableado..." />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Seleccionar Cableado",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Box className="rounded-xl border border-primary-100 bg-primary-50 p-4">
            <Heading size="md" className="mb-2 text-primary-900">
              Cableado y Conexiones
            </Heading>
            <Text size="sm" className="text-primary-700">
              Kit: {kit.name}{"\n"}
              Paneles instalados: {panelCount > 0 ? panelCount : "Ninguno"}
            </Text>
          </Box>

          <VStack space="md">
            <Heading size="lg">Opciones de Cableado</Heading>

            {wiringOptions.map((wiring) => {
              const meters = selectedMeters[wiring._id] ?? 0;
              const isSelected = meters > 0;

              return (
                <Pressable
                  key={wiring._id}
                  onPress={() => {
                    if (!isSelected) {
                      updateMeters(wiring._id, 1);
                    }
                  }}
                  className={`flex-row items-center rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                    isSelected
                      ? "border-primary-500 bg-primary-0"
                      : "border-outline-100"
                  }`}
                >
                  {wiring.imageUrl ? (
                    <Image
                      source={{ uri: wiring.imageUrl }}
                      style={{ width: 80, height: 80 }}
                      contentFit="contain"
                      className="mr-4 rounded-lg bg-background-50"
                    />
                  ) : (
                    <Box className="mr-4 h-20 w-20 items-center justify-center rounded-lg bg-background-50">
                      <Cable size={32} color="#F97316" />
                    </Box>
                  )}
                  <VStack className="flex-1">
                    <HStack className="items-start justify-between">
                      <VStack className="flex-1">
                        <Text className="text-lg font-bold text-typography-900">
                          {wiring.name}
                        </Text>
                        <Text size="sm" className="text-typography-500">
                          {wiring.brand ? `Marca: ${wiring.brand}` : "Sin marca"}
                        </Text>
                        <Text size="sm" className="text-typography-500">
                          Tipo: {wiring.type}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack className="mt-3 items-end justify-between">
                      <VStack>
                        <Text size="xs" className="text-typography-400">
                          Precio por metro
                        </Text>
                        <Text size="lg" className="font-bold text-success-700">
                          ${" "}
                          {wiring.pricePerMeter
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                        </Text>
                      </VStack>
                    </HStack>

                    <VStack
                      space="sm"
                      className="mt-4 border-t border-outline-50 pt-4"
                    >
                      <Text
                        size="xs"
                        className="font-bold uppercase text-typography-500"
                      >
                        Ajustar Metros
                      </Text>

                      <HStack space="md" className="items-center">
                        <Button
                          variant="outline"
                          action="secondary"
                          size="sm"
                          className="h-10 w-10 px-0"
                          onPress={() => updateMeters(wiring._id, meters - 1)}
                        >
                          <Minus size={16} color="#64748b" />
                        </Button>

                        <Box className="w-16 items-center">
                          <Text className="text-lg font-bold">{meters} m</Text>
                        </Box>

                        <Button
                          variant="outline"
                          action="secondary"
                          size="sm"
                          className="h-10 w-10 px-0"
                          onPress={() => updateMeters(wiring._id, meters + 1)}
                        >
                          <Plus size={16} color="#64748b" />
                        </Button>

                        <VStack className="ml-auto items-end">
                          <Text size="xs" className="text-typography-400">
                            Total: ${" "}
                            {(meters * wiring.pricePerMeter)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </VStack>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>

      <Box className="border-t border-outline-100 bg-white p-4 pb-8">
        <HStack className="mb-3 items-center justify-between">
          <Text size="sm" className="text-typography-500">
            Metros seleccionados: {totals.totalMeters}
          </Text>
          <Text size="sm" className="font-semibold text-typography-900">
            Total: ${" "}
            {totals.totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          </Text>
        </HStack>
        <Button
          size="lg"
          className="w-full"
          isDisabled={totals.totalMeters === 0}
          onPress={handleConfirmSelection}
        >
          <ButtonText>Confirmar y Añadir al Kit</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
