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
  BatteryCompatibilityResult,
  checkBatteryBankCompatibility,
} from "@/utils/solar-calculations";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Battery, CheckCircle2, Info, XCircle, Zap } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function BatterySelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const batteries = useQuery(api.batteries.getBatteries);
  const components = useQuery(api.kit_components.getKitComponents, { kitId });
  const addComponent = useMutation(api.kit_components.addComponent);

  const [selectedBatteryId, setSelectedBatteryId] =
    useState<Id<"batteries"> | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [compatibilityResults, setCompatibilityResults] = useState<
    BatteryCompatibilityResult[]
  >([]);

  // Find the inverter in the kit
  const inverterComponent = components?.find((c) => c.type === "inverter");
  const inverter = inverterComponent?.details as Doc<"inverters"> | undefined;

  React.useEffect(() => {
    if (batteries && kit && inverter) {
      const runCheck = async () => {
        setIsCalculating(true);
        // Small delay for UI feel
        await new Promise((resolve) => setTimeout(resolve, 800));

        const dailyConsumptionKwh = (kit.monthlyConsumptionKwh || 0) / 30;
        const daysOfAutonomy = kit.type === "off-grid" ? 2 : 1; // Default rules

        const results = checkBatteryBankCompatibility(
          {
            ...inverter,
            nominalPower: inverter.nominalPower || inverter.power || 0,
            maxPvPower: inverter.maxPvPower || 0,
            mpptChargeCurrent: inverter.mpptChargeCurrent || 0,
            maxPvVoltage: inverter.maxPvVoltage || 0,
          },
          batteries,
          dailyConsumptionKwh,
          daysOfAutonomy,
        );
        setCompatibilityResults(results);
        setIsCalculating(false);
      };

      runCheck();
    } else if (batteries && !inverter) {
      setIsCalculating(false);
    }
  }, [batteries, kit, inverter]);

  const handleConfirmSelection = async () => {
    if (!selectedBatteryId || !kitId) return;

    const result = compatibilityResults.find(
      (r) => r.batteryId === selectedBatteryId,
    );
    const quantity = result?.optimalConfig?.quantity || 1;

    try {
      await addComponent({
        kitId,
        type: "battery",
        batteryId: selectedBatteryId,
        quantity,
      });

      Alert.alert(
        "¡Éxito!",
        `Se han añadido ${quantity} batería${quantity > 1 ? "s" : ""} a tu kit para garantizar la autonomía necesaria.`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/(tabs)/mykits"),
          },
        ],
      );
    } catch (error) {
      console.error("Error adding component:", error);
      Alert.alert("Error", "No se pudo añadir la batería al kit.");
    }
  };

  if (batteries === undefined || !kit || isCalculating) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} />
        <Text className="mt-4 text-typography-500">
          {isCalculating
            ? "Calculando autonomía óptima..."
            : "Cargando opciones de baterías..."}
        </Text>
      </Box>
    );
  }

  const getCompatibilityBadge = (result?: BatteryCompatibilityResult) => {
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
          <BadgeText className="text-[10px]">Incompatible</BadgeText>
        </Badge>
      );
    }
  };

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
              Banco de Baterías para {kit.name}
            </Heading>
            <VStack space="xs">
              <Text size="sm" className="text-primary-700">
                Consumo Diario Estimado:{" "}
                {((kit.monthlyConsumptionKwh || 0) / 30).toFixed(2)} kWh
              </Text>
              <Text size="xs" className="text-primary-600">
                Calculamos la cantidad de baterías necesaria para{" "}
                {kit.type === "off-grid" ? "2 días" : "1 día"} de autonomía.
              </Text>
            </VStack>
          </Box>

          <VStack space="md">
            <Heading size="lg">Opciones Disponibles</Heading>

            {batteries.map((currBattery) => {
              const result = compatibilityResults.find(
                (r) => r.batteryId === currBattery._id,
              );
              const isSelected = selectedBatteryId === currBattery._id;

              return (
                <Pressable
                  key={currBattery._id}
                  onPress={() => setSelectedBatteryId(currBattery._id)}
                  className={`flex-row items-center rounded-xl border-2 bg-white p-4 shadow-soft-1 ${
                    isSelected
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
                        <HStack space="xs" className="mb-1 items-center">
                          <Text className="text-lg font-bold text-typography-900">
                            {currBattery.brand}
                          </Text>
                          {getCompatibilityBadge(result)}
                        </HStack>
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

                    {result?.optimalConfig && (
                      <HStack className="mt-2 items-center rounded-md bg-background-50 p-2">
                        <HStack space="xs" className="items-center">
                          <Zap size={12} color="#EAB308" />
                          <Text
                            size="xs"
                            className="font-bold text-typography-700"
                          >
                            Cant. Sugerida: {result.optimalConfig.quantity}{" "}
                            {result.optimalConfig.quantity > 1
                              ? "unidades"
                              : "unidad"}
                          </Text>
                        </HStack>
                      </HStack>
                    )}

                    {!result?.isCompatible && result?.constraints && (
                      <VStack
                        className="mt-2 rounded-md bg-error-50 p-2"
                        space="xs"
                      >
                        {!result.constraints.voltage.isCompatible && (
                          <Text size="xs" className="text-error-600">
                            • Tensión (
                            {result.constraints.voltage.batteryVoltage}V)
                            incompatible con inversor (
                            {result.constraints.voltage.inverterVoltage}V)
                          </Text>
                        )}
                        {!result.constraints.chargeCurrent.isCompatible && (
                          <Text size="xs" className="text-error-600">
                            • Corriente de carga excedida (Inv:{" "}
                            {
                              result.constraints.chargeCurrent
                                .inverterChargeCurrent
                            }
                            A {">"} Bat:{" "}
                            {result.constraints.chargeCurrent.batteryMaxCharge}
                            A)
                          </Text>
                        )}
                        {!result.constraints.dischargeCurrent.isCompatible && (
                          <Text size="xs" className="text-error-600">
                            • Descarga insuficiente para potencia pico (Req:{" "}
                            {Math.round(
                              result.constraints.dischargeCurrent
                                .requiredByInverter,
                            )}
                            A {">"} Bat:{" "}
                            {
                              result.constraints.dischargeCurrent
                                .batteryMaxDischarge
                            }
                            A)
                          </Text>
                        )}
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
                          {currBattery.type}
                        </Text>
                      </VStack>
                      <VStack className="items-end">
                        <Text size="xs" className="text-typography-400">
                          Precio (Ud.)
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
              );
            })}
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
          <ButtonText>Confirmar y Añadir Banco</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
