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
import { useAction, useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Info } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

export type SizingResults = {
  peakSunHours: number;
  dailyDemandKwh: number;
  version?: number;
  sizingOptions: {
    moduleId: Id<"solar_modules">;
    brand: string;
    model: string;
    pmax: number;
    price: number;
    panelsNeeded: number;
    totalCapacityKw: number;
    totalPrice: number;
    imageUrl?: string;
  }[];
} | null;

export default function PanelSelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const calculateSizing = useAction(api.sizing.calculateSizing);
  const addComponent = useMutation(api.kit_components.addComponent);

  const [isSizing, setIsSizing] = useState(true);
  const [sizingResults, setSizingResults] = useState<SizingResults>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function performSizing() {
      if (!kitId) return;
      try {
        const results = await calculateSizing({ kitId });
        setSizingResults(results as SizingResults);
      } catch (error: any) {
        console.error("Error calculating sizing:", error);
        Alert.alert("Error de Cálculo", error.message);
        router.back();
      } finally {
        setIsSizing(false);
      }
    }
    performSizing();
  }, [kitId]);

  const handleConfirmSelection = async () => {
    if (!sizingResults || selectedOptionIndex === null) return;

    const selectedOption = sizingResults.sizingOptions[selectedOptionIndex];
    const moduleId = selectedOption.moduleId;

    try {
      await addComponent({
        kitId,
        type: "solar_module",
        solarModuleId: moduleId,
        quantity: selectedOption.panelsNeeded,
      });

      Alert.alert(
        "¡Éxito!",
        `Se han añadido ${selectedOption.panelsNeeded} paneles ${selectedOption.brand} a tu kit.`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/(tabs)/mykits"),
          },
        ],
      );
    } catch (error) {
      console.error("Error adding component:", error);
      Alert.alert("Error", "No se pudo añadir el módulo al kit.");
    }
  };

  if (isSizing || !kit) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} />
        <Text className="mt-4 text-typography-500">
          Analizando tu consumo y ubicación...
        </Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Configurar Paneles",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Box className="rounded-xl border border-primary-100 bg-primary-50 p-4">
            <Heading size="md" className="mb-2 text-primary-900">
              Resumen para {kit.name}
            </Heading>
            <HStack className="mb-1 justify-between">
              <Text size="sm" className="text-primary-700">
                Horas Pico Solar (HSP):
              </Text>
              <Text size="sm" className="font-bold text-primary-900">
                {sizingResults?.peakSunHours} h
              </Text>
            </HStack>
            <HStack className="justify-between">
              <Text size="sm" className="text-primary-700">
                Demanda Diaria:
              </Text>
              <Text size="sm" className="font-bold text-primary-900">
                {sizingResults?.dailyDemandKwh} kWh
              </Text>
            </HStack>
          </Box>

          <VStack space="md">
            <Heading size="lg">Opciones Recomendadas</Heading>
            <Text size="sm" className="-mt-2 text-typography-500">
              Selecciona el panel que mejor se ajuste a tu presupuesto y espacio
              disponible.
            </Text>

            {sizingResults?.sizingOptions.map((option, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedOptionIndex(index)}
                className={`flex-row items-center rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                  selectedOptionIndex === index
                    ? "border-primary-500 bg-primary-0"
                    : "border-outline-100"
                }`}
              >
                {option.imageUrl && (
                  <Image
                    source={{ uri: option.imageUrl }}
                    style={{ width: 80, height: 80 }}
                    contentFit="contain"
                    className="mr-4 rounded-lg bg-background-50"
                  />
                )}
                <VStack className="flex-1">
                  <HStack className="items-start justify-between">
                    <VStack className="flex-1">
                      <Text className="text-lg font-bold text-typography-900">
                        {option.brand}
                      </Text>
                      <Text size="sm" className="text-typography-500">
                        {option.model}
                      </Text>
                    </VStack>
                    <Box className="rounded-md bg-primary-100 px-2 py-1">
                      <Text size="xs" className="font-bold text-primary-700">
                        {option.pmax}W
                      </Text>
                    </Box>
                  </HStack>

                  <HStack className="mt-3 items-end justify-between">
                    <VStack>
                      <Text size="xs" className="text-typography-400">
                        Cantidad
                      </Text>
                      <Text size="md" className="font-bold text-primary-600">
                        {option.panelsNeeded} Paneles
                      </Text>
                    </VStack>
                    <VStack className="items-end">
                      <Text size="xs" className="text-typography-400">
                        Inversión aprox.
                      </Text>
                      <Text size="lg" className="font-bold text-success-700">
                        ${" "}
                        {option.totalPrice
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
                        pathname: "/(auth)/panel-details/[panelId]",
                        params: { panelId: option.moduleId },
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
          isDisabled={selectedOptionIndex === null}
          onPress={handleConfirmSelection}
        >
          <ButtonText>Confirmar y Añadir al Kit</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
