import { LoadingAnimation } from "@/components/LoadingAnimation";
import {
  Badge,
  BadgeText,
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
import {
  checkInverterCompatibility,
  CompatibilityResult,
} from "@/utils/solar-calculations";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function InverterSelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const inverters = useQuery(api.inverters.getInverters);
  const components = useQuery(api.kit_components.getKitComponents, { kitId });
  const addComponent = useMutation(api.kit_components.addComponent);

  const [selectedInverterId, setSelectedInverterId] =
    useState<Id<"inverters"> | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [compatibilityResults, setCompatibilityResults] = useState<
    CompatibilityResult[]
  >([]);

  // Find the solar module and its configuration
  const solarModuleComponent = components?.find(
    (c) => c.type === "solar_module",
  );
  // Narrow the type to solar_modules since we filtered by "solar_module" type
  const solarModule = solarModuleComponent?.details as
    | Doc<"solar_modules">
    | undefined;
  const quantity = solarModuleComponent?.quantity || 0;

  const filteredInverters = React.useMemo(() => {
    if (!inverters || !kit) return [];
    if (kit.type === "off-grid") {
      return inverters.filter(
        (i) =>
          i.type.toLowerCase().includes("off") ||
          i.type.toLowerCase().includes("aislad"),
      );
    }
    return inverters;
  }, [inverters, kit]);

  useEffect(() => {
    if (inverters && solarModule && quantity > 0) {
      // Simulate background calculation as requested
      const runCheck = async () => {
        setIsCalculating(true);
        // Small delay to show the LoadingAnimation as requested
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const results = checkInverterCompatibility(
          {
            pmax: solarModule.pmax,
            vmp: solarModule.vmp,
            imp: solarModule.imp,
            voc: solarModule.voc,
            isc: solarModule.isc,
          },
          quantity,
          filteredInverters.map((inv) => ({
            ...inv,
            nominalPower: inv.nominalPower || inv.power || 0,
            maxPvPower: inv.maxPvPower || 0,
            mpptChargeCurrent: inv.mpptChargeCurrent || 0,
            maxPvVoltage: inv.maxPvVoltage || 0,
          })),
        );
        setCompatibilityResults(results);
        setIsCalculating(false);
      };

      runCheck();
    } else if (filteredInverters && (!solarModule || quantity === 0)) {
      setIsCalculating(false);
    }
  }, [filteredInverters, solarModule, quantity, inverters]);

  const handleConfirmSelection = async () => {
    if (!selectedInverterId || !kitId) return;

    // Check if selected inverter is incompatible and warn user
    const result = compatibilityResults.find(
      (r) => r.inverterId === selectedInverterId,
    );
    if (result && !result.isCompatible) {
      Alert.alert(
        "Advertencia de Compatibilidad",
        "Este inversor no es totalmente compatible con tu configuración de paneles actual. ¿Deseas continuar de todas formas?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Continuar", onPress: () => proceedWithSelection() },
        ],
      );
    } else {
      proceedWithSelection();
    }
  };

  const proceedWithSelection = async () => {
    if (!selectedInverterId || !kitId) return;

    try {
      await addComponent({
        kitId,
        type: "inverter",
        inverterId: selectedInverterId,
        quantity: 1,
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

  if (inverters === undefined || !kit || isCalculating) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} />
        <Text className="mt-4 text-typography-500">
          {isCalculating
            ? "Verificando compatibilidad técnica..."
            : "Cargando opciones de inversores..."}
        </Text>
      </Box>
    );
  }

  const getCompatibilityBadge = (inverterId: string) => {
    const result = compatibilityResults.find(
      (r) => r.inverterId === inverterId,
    );
    if (!result) return null;

    if (result.isCompatible) {
      return (
        <Badge
          action="success"
          variant="outline"
          className="gap-1 rounded-full"
        >
          <CheckCircle2 size={12} color="#10b981" />
          <BadgeText className="text-[10px]">Compatible</BadgeText>
        </Badge>
      );
    } else {
      return (
        <Badge action="error" variant="outline" className="gap-1 rounded-full">
          <XCircle size={12} color="#ef4444" />
          <BadgeText className="text-[10px]">Limitaciones</BadgeText>
        </Badge>
      );
    }
  };

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
            {solarModule ? (
              <VStack space="xs">
                <Text size="sm" className="text-primary-700">
                  Basado en {quantity} paneles {solarModule.brand}
                </Text>
                <HStack space="md" className="mt-1">
                  <VStack>
                    <Text size="xs" className="font-bold text-primary-600">
                      Potencia Fotovoltaica:
                    </Text>
                    <Text size="xs" className="text-primary-800">
                      {(quantity * solarModule.pmax) / 1000} kW
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            ) : (
              <Text size="sm" className="text-primary-700">
                Selecciona el inversor que mejor se adapte a tu sistema.
              </Text>
            )}
          </Box>

          <VStack space="md">
            <Heading size="lg">Opciones Disponibles</Heading>

            {filteredInverters.length === 0 && (
              <Text size="sm" className="text-typography-500 italic">
                No se encontraron inversores disponibles para este tipo de kit.
              </Text>
            )}

            {filteredInverters.map((inverter) => {
              const result = compatibilityResults.find(
                (r) => r.inverterId === inverter._id,
              );
              const isSelected = selectedInverterId === inverter._id;

              return (
                <Pressable
                  key={inverter._id}
                  onPress={() => setSelectedInverterId(inverter._id)}
                  className={`flex-row items-center rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                    isSelected
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
                        <HStack space="xs" className="mb-1 items-center">
                          <Text className="text-lg font-bold text-typography-900">
                            {inverter.brand}
                          </Text>
                          {getCompatibilityBadge(inverter._id)}
                        </HStack>
                        <Text size="sm" className="text-typography-500">
                          {inverter.model}
                        </Text>
                      </VStack>
                      <Box className="rounded-md bg-secondary-100 px-2 py-1">
                        <Text
                          size="xs"
                          className="font-bold text-secondary-700"
                        >
                          {inverter.power / 1000}kW
                        </Text>
                      </Box>
                    </HStack>

                    {result?.optimalConfig && (
                      <HStack className="mt-2 items-center rounded-md bg-background-50 p-2">
                        <Text size="xs" className="text-typography-600">
                          Cfg. Óptima: {result.optimalConfig.strings} string
                          {result.optimalConfig.strings > 1 ? "s" : ""} (
                          {result.optimalConfig.panelsInSeries} paneles en
                          serie)
                        </Text>
                      </HStack>
                    )}

                    {!result?.isCompatible && result?.constraints && (
                      <VStack className="mt-2 rounded-md bg-error-50 p-2">
                        <HStack space="xs" className="mb-1 items-center">
                          <AlertCircle size={12} color="#ef4444" />
                          <Text size="xs" className="font-bold text-error-700">
                            Limitaciones detectadas:
                          </Text>
                        </HStack>
                        <HStack space="sm" className="flex-wrap">
                          {!result.constraints.power.isCompatible && (
                            <Text size="xs" className="text-error-600">
                              • Potencia PV excedida
                            </Text>
                          )}
                          {!result.constraints.voltage.isCompatible && (
                            <Text size="xs" className="text-error-600">
                              • Voltaje excedido
                            </Text>
                          )}
                          {!result.constraints.current.isCompatible && (
                            <Text size="xs" className="text-error-600">
                              • Corriente excedida
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    )}

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
              );
            })}
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
