import { LoadingAnimation } from "@/components/LoadingAnimation";
import { RetieComplianceBadge } from "@/components/RetieComplianceBadge";
import { RetieInfoCard } from "@/components/RetieInfoCard";
import { RetieWarningModal } from "@/components/RetieWarningModal";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
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
import { useAction } from "convex/react";
import { useRouter, useSearchParams } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";

const formatCOP = (value: number) =>
  `$ ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

export default function SizingResultsScreen() {
  const { kitId } = useSearchParams();
  const router = useRouter();
  const currentKitId = typeof kitId === "string" ? kitId : undefined;
  const calculateSizing = useAction(api.sizing_retie.calculateSizingWithRetie);
  const [sizing, setSizing] = useState<any>(undefined);
  const [selectedWarning, setSelectedWarning] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<WarningRecommendation | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

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
        console.error("Error calculating RETIE sizing:", error);
      }
    }
    performSizing();
    return () => {
      isMounted = false;
    };
  }, [calculateSizing, currentKitId]);

  if (!currentKitId) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text className="text-base text-typography-700">
          Kit no especificado.
        </Text>
      </Box>
    );
  }

  if (!sizing) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <LoadingAnimation />
      </Box>
    );
  }

  const original = sizing.originalSizingOptions[0];
  const retie = sizing.retieCompliantOptions[0];
  const isCompliant = retie?.retieCompliant ?? false;
  const status = isCompliant ? "compliant" : retie?.warnings?.length ? "warnings" : "pending";

  return (
    <Box className="flex-1 bg-background-0 p-4">
      <HStack className="items-center justify-between mb-4">
        <VStack>
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
          Volver
        </Button>
      </HStack>

      <Card className="mb-4 p-4 gap-4">
        <HStack className="items-center justify-between">
          <VStack>
            <Text className="text-xs uppercase text-typography-500">
              Costo estimado de cumplimiento RETIE
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
                        <AlertCircle size={16} color="#f59e0b" className="mt-0.5" />
                        <Text className="text-xs text-yellow-900 flex-1 leading-4">
                          {warning}
                        </Text>
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              </Box>
            ) : (
              <Text className="text-sm text-typography-600">
                Sin advertencias detectadas en la configuración RETIE.
              </Text>
            )}
          </Box>
        </VStack>
      </Card>

      <RetieInfoCard factors={sizing.retieEnvironmentalFactors} />

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
    </Box>
  );
}
