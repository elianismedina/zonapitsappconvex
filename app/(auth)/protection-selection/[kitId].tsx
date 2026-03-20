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
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Minus, Plus, Shield } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";

type ProtectionDoc = Doc<"protections">;

export default function ProtectionSelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const protections = useQuery(api.protections.getProtections);
  const components = useQuery(api.kit_components.getKitComponents, { kitId });
  const addComponent = useMutation(api.kit_components.addComponent);

  const [selectedUnits, setSelectedUnits] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const solarModuleComponent = components?.find((c) => c.type === "solar_module");
  const inverterComponent = components?.find((c) => c.type === "inverter");
  const panelCount = solarModuleComponent?.quantity || 0;

  const groupedProtections = useMemo(() => {
    if (!protections || protections.length === 0) {
      return [];
    }

    const map = new Map<string, ProtectionDoc[]>();
    protections.forEach((protection) => {
      const key = protection.category;
      const bucket = map.get(key) ?? [];
      bucket.push(protection);
      map.set(key, bucket);
    });

    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items: items.sort((a, b) =>
        `${a.subcategory}-${a.name}`.localeCompare(`${b.subcategory}-${b.name}`),
      ),
    }));
  }, [protections]);

  const totals = useMemo(() => {
    if (!protections) {
      return { totalUnits: 0, totalAmount: 0 };
    }

    const totalUnits = protections.reduce((acc, protection) => {
      const selected = selectedUnits[protection._id] ?? 0;
      return acc + selected;
    }, 0);

    const totalAmount = protections.reduce((acc, protection) => {
      const selected = selectedUnits[protection._id] ?? 0;
      return acc + selected * protection.price;
    }, 0);

    return { totalUnits, totalAmount };
  }, [protections, selectedUnits]);

  const updateUnits = (protectionId: Id<"protections">, nextQuantity: number) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [protectionId]: Math.max(0, nextQuantity),
    }));
  };

  const handleConfirmSelection = async () => {
    if (!kitId || isSubmitting) return;

    const entries = Object.entries(selectedUnits).filter(([, qty]) => qty > 0);
    if (entries.length === 0) {
      Alert.alert("Selecciona protecciones", "Agrega al menos una protección.");
      return;
    }

    try {
      setIsSubmitting(true);
      await Promise.all(
        entries.map(([protectionId, quantity]) =>
          addComponent({
            kitId,
            type: "protection",
            protectionId: protectionId as Id<"protections">,
            quantity,
          }),
        ),
      );

      Alert.alert(
        "¡Protecciones añadidas!",
        "Tus protecciones eléctricas fueron agregadas correctamente.",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(auth)/installation-selection/${kitId}`),
          },
        ],
      );
    } catch (error) {
      console.error("Error adding protections:", error);
      Alert.alert("Error", "No se pudo añadir las protecciones al kit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (protections === undefined || !kit) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} text="Cargando protecciones..." />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Protecciones Eléctricas",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Box className="rounded-xl border border-primary-100 bg-primary-50 p-4">
            <Heading size="md" className="mb-2 text-primary-900">
              Selecciona protecciones adecuadas
            </Heading>
            <Text size="sm" className="text-primary-700">
              Kit: {kit.name}
              {"\n"}
              Paneles instalados: {panelCount > 0 ? panelCount : "Ninguno"}
              {"\n"}
              Inversor configurado:{" "}
              {inverterComponent ? "Sí" : "Aún no configurado"}
            </Text>
          </Box>

          {groupedProtections.length === 0 ? (
            <Box className="rounded-xl border border-outline-100 bg-white p-6">
              <Text className="text-center text-base text-typography-600">
                No hay protecciones registradas todavía. Intenta nuevamente más
                tarde.
              </Text>
            </Box>
          ) : (
            <VStack space="xl">
              {groupedProtections.map(({ category, items }) => (
                <VStack key={category} space="md">
                  <Heading size="md" className="text-typography-900">
                    {category}
                  </Heading>

                  {items.map((protection) => {
                    const quantity = selectedUnits[protection._id] ?? 0;
                    const isSelected = quantity > 0;

                    return (
                      <Pressable
                        key={protection._id}
                        onPress={() => {
                          if (!isSelected) {
                            updateUnits(protection._id, 1);
                          }
                        }}
                        className={`flex-row rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                          isSelected
                            ? "border-primary-500 bg-primary-0"
                            : "border-outline-100"
                        }`}
                      >
                        {protection.imageUrl ? (
                          <Image
                            source={{ uri: protection.imageUrl }}
                            style={{ width: 80, height: 80 }}
                            contentFit="contain"
                            className="mr-4 rounded-lg bg-background-50"
                          />
                        ) : (
                          <Box className="mr-4 h-20 w-20 items-center justify-center rounded-lg bg-background-50">
                            <Shield size={32} color="#EF4444" />
                          </Box>
                        )}

                        <VStack className="flex-1" space="sm">
                          <HStack className="items-start justify-between">
                            <VStack className="flex-1">
                              <Text className="text-lg font-bold text-typography-900">
                                {protection.name}
                              </Text>
                              <Text size="sm" className="text-typography-500">
                                {protection.subcategory}
                              </Text>
                              <Text size="xs" className="text-typography-400">
                                Calificación: {protection.rating}
                              </Text>
                            </VStack>
                            <VStack className="items-end">
                              <Text
                                size="xs"
                                className="text-typography-500 uppercase"
                              >
                                Precio unitario
                              </Text>
                              <Text className="text-lg font-bold text-success-700">
                                ${" "}
                                {protection.price
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                              </Text>
                            </VStack>
                          </HStack>

                          <VStack
                            space="sm"
                            className="border-t border-outline-50 pt-3"
                          >
                            <Text
                              size="xs"
                              className="font-bold uppercase text-typography-500"
                            >
                              Ajustar cantidad
                            </Text>
                            <HStack space="md" className="items-center">
                              <Button
                                variant="outline"
                                action="secondary"
                                size="sm"
                                className="h-10 w-10 px-0"
                                onPress={() =>
                                  updateUnits(protection._id, quantity - 1)
                                }
                              >
                                <Minus size={16} color="#64748b" />
                              </Button>

                              <Box className="w-12 items-center">
                                <Text className="text-lg font-bold">
                                  {quantity}
                                </Text>
                              </Box>

                              <Button
                                variant="outline"
                                action="secondary"
                                size="sm"
                                className="h-10 w-10 px-0"
                                onPress={() =>
                                  updateUnits(protection._id, quantity + 1)
                                }
                              >
                                <Plus size={16} color="#64748b" />
                              </Button>

                              <VStack className="ml-auto items-end">
                                <Text size="xs" className="text-typography-400">
                                  Total: ${" "}
                                  {(quantity * protection.price)
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
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>

      <Box className="border-t border-outline-100 bg-white p-4 pb-8">
        <HStack className="mb-3 items-center justify-between">
          <Text size="sm" className="text-typography-500">
            Protecciones seleccionadas: {totals.totalUnits}
          </Text>
          <Text size="sm" className="font-semibold text-typography-900">
            Total: ${" "}
            {totals.totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          </Text>
        </HStack>
        <Button
          size="lg"
          className="w-full"
          isDisabled={totals.totalUnits === 0 || isSubmitting}
          onPress={handleConfirmSelection}
        >
          <ButtonText>
            {isSubmitting ? "Agregando..." : "Confirmar y añadir"}
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
