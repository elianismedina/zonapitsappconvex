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
import { CheckCircle2, Info, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

export type SizingResults = {
  peakSunHours: number;
  dailyDemandKwh: number;
  version: number;
  retieEnvironmentalFactors?: {
    ambientTemperature: number;
    soilingFactor: number;
    tropicalDerating: number;
    panelDerating: number;
    totalDerating: number;
  };
  originalSizingOptions: {
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
  retieCompliantOptions: {
    moduleId: Id<"solar_modules">;
    brand: string;
    model: string;
    pmax: number;
    price: number;
    panelsNeeded: number;
    strings: number;
    panelsPerString: number;
    dcBreaker: { breakerSize: number; standard: string };
    stringFuses: { fuseSize: number; type: string; voltageRating: number }[];
    dcWireGauge: { wireGauge: string; mm2: number; maxCurrent: number };
    totalCapacityKw: number;
    totalPrice: number;
    retieCompliant: boolean;
    warnings: string[];
  }[];
  retieCompliance: {
    region: string;
    standardsApplied: string[];
    documentationRequired: string[];
    inspectionRequired: boolean;
    estimatedComplianceCost: number;
  };
} | null;

export default function PanelSelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const calculateSizing = useAction(api.sizing_retie.calculateSizingWithRetie);
  const addComponent = useMutation(api.kit_components.addComponent);

  const [sizingResults, setSizingResults] = useState<SizingResults>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    async function performSizing() {
      if (!kitId) return;
      try {
        const results = await calculateSizing({ kitId });
        if (isMounted) {
          setSizingResults(results as SizingResults);
        }
      } catch (error: any) {
        console.error("Error al calcular el dimensionamiento:", error);
        if (isMounted) {
          Alert.alert("Error de Cálculo", error.message);
          router.back();
        }
      }
    }
    performSizing();
    return () => {
      isMounted = false;
    };
  }, [kitId, calculateSizing, router]);

  const handleConfirmSelection = async () => {
    if (!sizingResults || selectedOptionIndex === null) return;

    const selectedOption = sizingResults.retieCompliantOptions[selectedOptionIndex];
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
      console.error("Error al añadir componente:", error);
      Alert.alert("Error", "No se pudo añadir el módulo al kit.");
    }
  };

  if (!sizingResults || !kit) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} />
        <Text size="sm" className="mt-4 text-center text-typography-500">
          Calculando opciones óptimas…
        </Text>
      </Box>
    );
  }

  const displayOptions = sizingResults.retieCompliantOptions.length > 0
    ? sizingResults.retieCompliantOptions
    : sizingResults.originalSizingOptions;

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
          <Box className="rounded-xl border border-green-200 bg-green-50 p-4">
            <HStack gap={2} alignItems="center" className="mb-2">
              <CheckCircle2 size={20} color="#16a34a" />
              <Heading size="md" className="text-green-900">
                Configuración RETIE
              </Heading>
            </HStack>
            <Text size="sm" className="text-green-700 mb-3">
              Las opciones mostradas cumplen con los estándares RETIE colombianos,
              incluyendo protecciones y dimensionamiento apropiado para condiciones tropicales.
            </Text>
            {sizingResults.retieEnvironmentalFactors && (
              <VStack space="xs" className="mt-2">
                <HStack justifyContent="space-between">
                  <Text size="xs" className="text-green-600">Factor de seguridad tropical:</Text>
                  <Text size="xs" className="font-bold text-green-700">
                    {(sizingResults.retieEnvironmentalFactors.totalDerating * 100).toFixed(0)}%
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text size="xs" className="text-green-600">Demanda diaria ajustada:</Text>
                  <Text size="xs" className="font-bold text-green-700">
                    {sizingResults.dailyDemandKwh} kWh
                  </Text>
                </HStack>
              </VStack>
            )}
          </Box>

          <VStack space="md">
            <Heading size="lg">Opciones Recomendadas</Heading>
            <Text size="sm" className="-mt-2 text-typography-500">
              Selecciona el panel que mejor se adapte a tus necesidades.
              Todas las opciones incluyen protecciones RETIE.
            </Text>

            {displayOptions.map((option, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedOptionIndex(index)}
                className={`flex-row items-center rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                  selectedOptionIndex === index
                    ? "border-primary-500 bg-primary-0"
                    : "border-outline-100"
                }`}
              >
                <VStack className="flex-1">
                  <HStack className="items-start justify-between">
                    <VStack className="flex-1">
                      <HStack gap={2} alignItems="center">
                        <HStack gap={1} className="bg-green-100 px-2 py-0.5 rounded-full">
                          <Star size={12} color="#16a34a" fill="#16a34a" />
                          <Text size="xs" className="font-bold text-green-700">
                            RETIE
                          </Text>
                        </HStack>
                      </HStack>
                      <Text className="text-lg font-bold text-typography-900 mt-1">
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

                  {'dcBreaker' in option && (
                    <Box className="mt-2 rounded bg-gray-50 p-2">
                      <Text size="xs" className="font-bold text-gray-600">Protecciones DC:</Text>
                      <Text size="xs" className="text-gray-500">
                        Breaker: {option.dcBreaker.breakerSize}A • String: {option.strings}x{option.panelsPerString}
                      </Text>
                    </Box>
                  )}

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