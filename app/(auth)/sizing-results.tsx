import { LoadingAnimation } from "@/components/LoadingAnimation";
import { RetieComplianceBadge } from "@/components/RetieComplianceBadge";
import { RetieInfoCard } from "@/components/RetieInfoCard";
import { RetieWarningModal } from "@/components/RetieWarningModal";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { api } from "@/convex/_generated/api";
import {
    findRecommendationForWarning,
    WarningRecommendation,
} from "@/utils/retie-warning-mapping";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";

const formatCOP = (value: number) =>
  `$ ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

export default function SizingResultsScreen() {
  const { kitId } = useLocalSearchParams<{ kitId?: string }>();
  const router = useRouter();
  const currentKitId = typeof kitId === "string" ? kitId : undefined;
  const calculateSizing = useAction(api.sizing_retie.calculateSizingWithRetie);
  const applyRetie = useMutation(api.kits.applyRetieRecommendations);
  const kit = useQuery(api.kits.getKitById, { id: currentKitId });
  const [sizing, setSizing] = useState<any>(undefined);
  const [selectedWarning, setSelectedWarning] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<WarningRecommendation | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Check if RETIE has already been applied
  const isRetieApplied = kit?.status === "retie_pending" || kit?.status === "retie_compliant";

  useEffect(() => {
    let isMounted = true;
    async function performSizing() {
      if (!currentKitId) return;
      try {
        const result = await calculateSizing({ kitId: currentKitId });
        if (isMounted) {
          setSizing(result);
        }
      } catch (error: any) {
        console.error("Error al calcular dimensionamiento RETIE:", error);
      }
    }
    performSizing();
    return () => {
      isMounted = false;
    };
  }, [calculateSizing, currentKitId]);

  if (!currentKitId) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <Box className="flex-1 items-center justify-center px-4">
          <Text className="text-base text-typography-700 text-center">
            Kit no especificado.
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (!sizing) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <Box className="flex-1 items-center justify-center px-4">
          <LoadingAnimation />
        </Box>
      </SafeAreaView>
    );
  }

  const original = sizing.originalSizingOptions[0];
  const retie = sizing.retieCompliantOptions[0];
  const isCompliant = retie?.retieCompliant ?? false;
  const status = isCompliant ? "compliant" : retie?.warnings?.length ? "warnings" : "pending";

  const panelDiff = (retie?.panelsNeeded ?? 0) - (original?.panelsNeeded ?? 0);
  const capacityDiff = (retie?.totalCapacityKw ?? 0) - (original?.totalCapacityKw ?? 0);

  const handleApplyRetie = async () => {
    if (!currentKitId || !retie) return;

    Alert.alert(
      "Aplicar Recomendaciones RETIE",
      `Esto actualizará tu kit de ${original?.panelsNeeded ?? 0} paneles (${original?.totalCapacityKw ?? 0} kW) a ${retie.panelsNeeded} paneles (${retie.totalCapacityKw} kW) para cumplir con RETIE. ¿Deseas continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aplicar",
          style: "default",
          onPress: async () => {
            try {
              setIsApplying(true);
              await applyRetie({
                kitId: currentKitId,
                retieCapacityKw: retie.totalCapacityKw,
                retiePanelsNeeded: retie.panelsNeeded,
              });
            } catch (error: any) {
              Alert.alert("Error", "No se pudieron aplicar las recomendaciones: " + error.message);
            } finally {
              setIsApplying(false);
            }
          },
        },
      ]
    );
  };

  // If RETIE is already applied, show simplified compliant view
  if (isRetieApplied) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Box className="flex-1 px-4 pb-6 pt-2">
            <HStack className="items-center justify-between mb-4">
              <VStack className="flex-1 pr-2">
                <Heading size="xl" className="mb-1">
                  Resultados RETIE
                </Heading>
                <Text className="text-sm text-typography-500">
                  Configuración RETIE aplicada
                </Text>
              </VStack>
              <Button
                action="secondary"
                size="sm"
                onPress={() => router.back()}
              >
                <ButtonText>Volver</ButtonText>
              </Button>
            </HStack>

            <Card className="mb-4 p-4 gap-4">
              <HStack className="items-center justify-between flex-wrap gap-2">
                <VStack className="flex-1">
                  <Text className="text-xs uppercase text-typography-500">
                    Capacidad Configurada
                  </Text>
                  <Text className="text-lg font-bold text-typography-900">
                    {kit?.capacity ?? retie?.totalCapacityKw ?? "-"} kWp
                  </Text>
                </VStack>
                <HStack className="items-center bg-green-100 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <Text size="sm" className="ml-1 font-bold text-green-700">
                    RETIE Cumplido
                  </Text>
                </HStack>
              </HStack>
            </Card>

            <RetieInfoCard factors={sizing?.retieEnvironmentalFactors} />

            <Card className="mt-4 p-4 gap-3 bg-blue-50 border-blue-200">
              <HStack gap={3} alignItems="center">
                <CheckCircle2 size={24} color="#22c55e" />
                <VStack className="flex-1">
                  <Text className="text-sm font-semibold text-blue-900">
                    Configuración Completa
                  </Text>
                  <Text className="text-xs text-blue-700">
                    Tu kit ahora cumple con RETIE. Continúa con la selección de paneles.
                  </Text>
                </VStack>
              </HStack>
              <Button
                size="sm"
                action="primary"
                onPress={() => router.push(`/panel-selection/${currentKitId}`)}
              >
                <ButtonText>Continuar a Selección de Paneles</ButtonText>
              </Button>
            </Card>
          </Box>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Box className="flex-1 px-4 pb-6 pt-2">
            <HStack className="items-center justify-between mb-4">
              <VStack className="flex-1 pr-2">
                <Heading size="xl" className="mb-1">
                  Resultados RETIE
                </Heading>
                <Text className="text-sm text-typography-500">
                  Análisis de dimensionamiento con derating colombiano.
                </Text>
              </VStack>
              <Button
                action="secondary"
                size="sm"
                onPress={() => router.back()}
              >
                <ButtonText>Volver</ButtonText>
              </Button>
            </HStack>

            <Card className="mb-4 p-4 gap-4">
              <HStack className="items-center justify-between flex-wrap gap-2">
                <VStack className="flex-1">
                  <Text className="text-xs uppercase text-typography-500">
                    Costo estimado
                  </Text>
                  <Text className="text-lg font-bold text-typography-900">
                    {formatCOP(sizing.retieCompliance.estimatedComplianceCost)}
                  </Text>
                </VStack>
                <RetieComplianceBadge
                  status={status}
                  count={retie?.warnings?.length}
                  detailed
                />
              </HStack>
            </Card>

            <Card className="mb-4 p-4 gap-4">
              <Heading size="sm">Original vs RETIE</Heading>
              <VStack gap={3}>
                <Box className="rounded-2xl bg-slate-50 p-4">
                  <Text className="text-sm font-semibold text-typography-700 mb-2">
                    Dimensionamiento Original
                  </Text>
                  <Text className="text-sm text-typography-600">
                    {original?.panelsNeeded ?? "-"} paneles × {original?.pmax ?? "-"} W
                  </Text>
                  <Text className="text-sm text-typography-600">
                    Capacidad total: {original?.totalCapacityKw ?? "-"} kW
                  </Text>
                </Box>

                <Box className="rounded-2xl bg-blue-50 p-4">
                  <Text className="text-sm font-semibold text-blue-900 mb-2">
                    Ajuste RETIE
                  </Text>
                  <Text className="text-sm text-typography-600">
                    {retie?.panelsNeeded ?? "-"} paneles × {retie?.pmax ?? "-"} W
                  </Text>
                  <Text className="text-sm text-typography-600">
                    Capacidad total: {retie?.totalCapacityKw ?? "-"} kW
                  </Text>
                  {retie?.warnings?.length ? (
                    <Box className="mt-3 rounded-2xl bg-yellow-50 p-3 gap-2">
                      <Text className="text-xs font-semibold text-yellow-900 mb-1">
                        Advertencias RETIE (tap para detalles)
                      </Text>
                      <VStack gap={2}>
                        {retie.warnings.map((warning, index) => (
                          <Pressable
                            key={index}
                            onPress={() => {
                              const recommendation = findRecommendationForWarning(warning);
                              if (recommendation) {
                                setSelectedWarning(warning);
                                setSelectedRecommendation(recommendation);
                                setShowWarningModal(true);
                              }
                            }}
                          >
                            <HStack
                              gap={2}
                              alignItems="flex-start"
                              className="bg-white rounded-lg p-2 border border-yellow-200"
                            >
                              <AlertCircle size={16} color="#f59e0b" className="mt-0.5 shrink-0" />
                              <Text className="text-xs text-yellow-900 flex-1 leading-4">
                                {warning}
                              </Text>
                            </HStack>
                          </Pressable>
                        ))}
                      </VStack>
                    </Box>
                  ) : (
                    <Text className="text-sm text-typography-600 mt-2">
                      Sin advertencias detectadas en la configuración RETIE.
                    </Text>
                  )}
                </Box>
              </VStack>
            </Card>

            <RetieInfoCard factors={sizing.retieEnvironmentalFactors} />

            {!isCompliant && (
              <Card className="mt-2 p-4 gap-4 bg-green-50 border-green-200">
                <HStack gap={3} alignItems="flex-start">
                  <Box className="bg-green-100 p-2 rounded-full shrink-0 mt-0.5">
                    <AlertCircle size={20} color="#16a34a" />
                  </Box>
                  <VStack className="flex-1" gap={2}>
                    <VStack gap={1}>
                      <Text className="text-sm font-semibold text-green-900">
                        Recomendación: Aumentar paneles
                      </Text>
                      <Text className="text-xs text-green-800">
                        Para cumplir con RETIE, necesitas {panelDiff} panel(es) adicional(es)
                        ({capacityDiff > 0 ? "+" : ""}{capacityDiff?.toFixed(2)} kW).
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      onPress={handleApplyRetie}
                      disabled={isApplying}
                      className="bg-green-700"
                    >
                      <ButtonText className="text-white">
                        {isApplying ? "Aplicando..." : "Aplicar Recomendaciones RETIE"}
                      </ButtonText>
                      {!isApplying && <ArrowRight size={16} color="white" className="ml-1" />}
                    </Button>
                  </VStack>
                </HStack>
              </Card>
            )}
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      <RetieWarningModal
        isOpen={showWarningModal}
        warning={selectedRecommendation}
        warningMessage={selectedWarning || ""}
        onClose={() => {
          setShowWarningModal(false);
          setSelectedWarning(null);
          setSelectedRecommendation(null);
        }}
      />
    </SafeAreaView>
  );
}
