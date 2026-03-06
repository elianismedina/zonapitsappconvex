import { useAction, useMutation, useQuery } from "convex/react";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native";

import { LoadingAnimation } from "@/components/LoadingAnimation";
import { AnalysisResults } from "@/components/billupload/AnalysisResults";
import { FilePicker } from "@/components/billupload/FilePicker";
import { KitSelector } from "@/components/billupload/KitSelector";
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type RoofType =
  | "thermoacoustic"
  | "standing_seam"
  | "clay_tile"
  | "asphalt_mantle"
  | "eternit_tile"
  | "wood"
  | "zinc";

interface RoofTypeOption {
  value: RoofType;
  label: string;
  icon: string;
}

const ROOF_TYPES: RoofTypeOption[] = [
  { value: "thermoacoustic", label: "Termoacústica", icon: "🏠" },
  { value: "standing_seam", label: "Pie de amigo", icon: "🔧" },
  { value: "clay_tile", label: "Teja de barro", icon: "🧱" },
  { value: "asphalt_mantle", label: "Manto asfáltico", icon: "🛣️" },
  { value: "eternit_tile", label: "Teja eternit", icon: "🔲" },
  { value: "wood", label: "Madera", icon: "🪵" },
  { value: "zinc", label: "Zinc", icon: "⚙️" },
];

export default function UploadBillScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();
  const toast = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState<"bill" | "roof">("bill");

  // Bill Tab State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState<Id<"kits"> | null>(
    kitId || null,
  );
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    mimeType?: string;
    name?: string;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [generationPercentage, setGenerationPercentage] = useState(100);

  // Roof Tab State
  const [selectedRoofType, setSelectedRoofType] = useState<RoofType | null>(
    null,
  );

  // Queries, Mutations & Actions
  const kits = useQuery(api.kits.getKits, {});
  const kit = useQuery(
    api.kits.getKitById,
    selectedKitId ? { id: selectedKitId } : "skip",
  );
  const billUrl = useQuery(
    api.kits.getBillUrl,
    kit?.billStorageId ? { storageId: kit.billStorageId } : "skip",
  );
  const generateUploadUrl = useMutation(api.kits.generateUploadUrl);
  const addBillToKit = useMutation(api.kits.addBillToKit);
  const saveBillAnalysis = useMutation(api.kits.saveBillAnalysis);
  const updateKit = useMutation(api.kits.updateKit);
  const analyzeBill = useAction(api.actions.analyzeBill);

  const safeKits = useMemo(() => kits ?? [], [kits]);

  // While the selected kit's data is loading, show a spinner.
  const isKitLoading = selectedKitId && kit === undefined;

  // Effect 1: Auto-select kit if only one exists.
  useEffect(() => {
    if (safeKits.length === 1 && !selectedKitId) {
      setSelectedKitId(safeKits[0]._id);
    }
  }, [safeKits, selectedKitId]);

  // Effect 2: Reset form state whenever the selected kit ID changes.
  useEffect(() => {
    setAnalysisResult(null);
    setSelectedFile(null);
  }, [selectedKitId]);

  // Effect 3: When the kit data has loaded, populate the form if there are existing bill details.
  useEffect(() => {
    if (kit && kit.provider && kit.monthlyConsumptionKwh) {
      setAnalysisResult({
        provider: kit.provider,
        billingPeriod: kit.billingPeriod,
        monthlyConsumptionKwh: kit.monthlyConsumptionKwh,
        totalAmount: kit.totalAmount,
        currency: kit.currency,
        energyRate: kit.energyRate,
      });

      if (kit.generationPercentage) {
        setGenerationPercentage(kit.generationPercentage);
      }

      if (kit.billStorageId) {
        setSelectedFile({ uri: "existing", name: "Factura Guardada" });
      }
    }
  }, [kit]);

  // Effect 4: Load roof type from kit
  useEffect(() => {
    if (kit?.roofType) {
      setSelectedRoofType(kit.roofType);
    }
  }, [kit]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled === false && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        mimeType: asset.mimeType,
        name: asset.name,
      });
      setAnalysisResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedKitId || !selectedFile) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Faltan datos</ToastTitle>
            <ToastDescription>
              Por favor, selecciona un kit y un archivo.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const postUrl = await generateUploadUrl();
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      const uploadResult = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      const { storageId } = await uploadResult.json();

      await addBillToKit({
        kitId: selectedKitId,
        storageId: storageId,
      });

      setIsAnalyzing(true);
      const analysis = await analyzeBill({ storageId });

      if (analysis.success) {
        setAnalysisResult(analysis.data);

        await saveBillAnalysis({
          kitId: selectedKitId,
          monthlyConsumptionKwh:
            analysis.data.monthlyConsumptionKwh ?? undefined,
          energyRate: analysis.data.energyRate ?? undefined,
          totalAmount: analysis.data.totalAmount ?? undefined,
          currency: analysis.data.currency ?? undefined,
          billingPeriod: analysis.data.billingPeriod ?? undefined,
          provider: analysis.data.provider ?? undefined,
          generationPercentage: generationPercentage,
        });

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success">
              <ToastTitle>Análisis completado</ToastTitle>
              <ToastDescription>
                Hemos extraído los datos de tu factura.
              </ToastDescription>
            </Toast>
          ),
        });
      } else {
        throw new Error(analysis.error || "Error en el análisis");
      }
    } catch (err) {
      console.error("Error processing bill:", err);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>
              No se pudo procesar la factura. Inténtalo de nuevo.
            </ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  const handlePercentageChange = async (val: number) => {
    setGenerationPercentage(val);
    if (selectedKitId) {
      try {
        await updateKit({
          id: selectedKitId,
          generationPercentage: val,
        });
      } catch (err) {
        console.error("Error updating kit percentage:", err);
      }
    }
  };

  const handleRoofTypeChange = async (roofType: RoofType) => {
    setSelectedRoofType(roofType);
    if (selectedKitId) {
      try {
        await updateKit({
          id: selectedKitId,
          roofType: roofType,
        });
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success">
              <ToastTitle>Tipo de techo guardado</ToastTitle>
              <ToastDescription>
                El tipo de techo se ha actualizado correctamente.
              </ToastDescription>
            </Toast>
          ),
        });
      } catch (err) {
        console.error("Error updating kit roof type:", err);
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error">
              <ToastTitle>Error</ToastTitle>
              <ToastDescription>
                No se pudo guardar el tipo de techo. Inténtalo de nuevo.
              </ToastDescription>
            </Toast>
          ),
        });
      }
    }
  };

  const handleFinish = () => {
    router.push("/(auth)/(tabs)/mykits");
  };

  return (
    <Box className="flex-1 bg-background-0">
      {/* Tab Header */}
      <Box className="flex-row border-b border-outline-200">
        <Pressable
          onPress={() => setActiveTab("bill")}
          className={`flex-1 flex-row items-center justify-center py-4 ${
            activeTab === "bill"
              ? "border-b-2 border-primary-600 bg-background-50"
              : "bg-background-0"
          }`}
        >
          <Text
            size="sm"
            className={`font-medium ${
              activeTab === "bill"
                ? "text-primary-600"
                : "text-typography-500"
            }`}
          >
            Factura
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("roof")}
          className={`flex-1 flex-row items-center justify-center py-4 ${
            activeTab === "roof"
              ? "border-b-2 border-primary-600 bg-background-50"
              : "bg-background-0"
          }`}
        >
          <Text
            size="sm"
            className={`font-medium ${
              activeTab === "roof"
                ? "text-primary-600"
                : "text-typography-500"
            }`}
          >
            Tipo de Techo
          </Text>
        </Pressable>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          {/* Bill Tab Content */}
          {activeTab === "bill" && (
            <>
              <Heading size="xl">Subir Factura de Energía</Heading>
              <Text size="sm" className="text-typography-500">
                Sube tu factura para que la IA extraiga tu consumo y tarifas
                automáticamente.
              </Text>

              <VStack
                space="md"
                className="rounded-xl border border-outline-100 bg-background-50 p-4"
              >
                <Heading size="sm">
                  ¿Qué porcentaje de tu factura quieres cubrir?
                </Heading>
                <Text size="xs" className="text-typography-500">
                  Esto nos ayuda a dimensionar el kit ideal para tu presupuesto y
                  espacio.
                </Text>
                <HStack space="xs" className="flex-wrap">
                  {[50, 60, 70, 80, 90, 100].map((val) => (
                    <Button
                      key={val}
                      variant={
                        generationPercentage === val ? "solid" : "outline"
                      }
                      action={
                        generationPercentage === val ? "primary" : "secondary"
                      }
                      size="sm"
                      onPress={() => handlePercentageChange(val)}
                      className="min-w-[60px] flex-1"
                    >
                      <ButtonText>{val}%</ButtonText>
                    </Button>
                  ))}
                </HStack>
              </VStack>

              {isKitLoading ? (
                <Box className="h-96 w-full items-center justify-center">
                  <LoadingAnimation size={120} />
                </Box>
              ) : !analysisResult ? (
                <VStack space="lg">
                  {safeKits.length > 1 ? (
                    <KitSelector
                      kits={kits}
                      selectedKitId={selectedKitId}
                      onValueChange={setSelectedKitId}
                      isDisabled={isSubmitting}
                    />
                  ) : safeKits.length === 1 ? (
                    <Box className="rounded-lg border border-outline-300 bg-background-50 p-4">
                      <VStack space="xs">
                        <Text
                          size="xs"
                          className="font-bold text-typography-500 uppercase"
                        >
                          Kit Seleccionado
                        </Text>
                        <Text
                          size="md"
                          className="font-medium text-typography-900"
                        >
                          {safeKits[0].name}
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box className="rounded-lg border border-outline-300 bg-background-50 p-4">
                      <VStack space="sm" className="items-center">
                        <Text className="text-center text-typography-500">
                          No tienes kits creados aún para vincular una factura.
                        </Text>
                        <Button
                          variant="solid"
                          action="primary"
                          onPress={() => router.push("/(auth)/(tabs)/location")}
                          className="mt-2"
                        >
                          <ButtonText>Crear kit</ButtonText>
                        </Button>
                      </VStack>
                    </Box>
                  )}

                  {safeKits.length > 0 && (
                    <>
                      <FilePicker
                        onPress={pickFile}
                        selectedFile={selectedFile}
                        isDisabled={isSubmitting}
                      />

                      <HStack space="md" className="mt-4 w-full">
                        <Button
                          variant="outline"
                          action="secondary"
                          onPress={() => router.push("/(auth)/(tabs)/mykits")}
                          className="flex-1"
                        >
                          <ButtonText>Cancelar</ButtonText>
                        </Button>
                        <Button
                          onPress={handleSubmit}
                          isDisabled={
                            isSubmitting || !selectedKitId || !selectedFile
                          }
                          className="flex-1"
                        >
                          {isSubmitting ? (
                            <HStack
                              space="sm"
                              className="items-center justify-center"
                            >
                              <ButtonSpinner />
                              <ButtonText>
                                {isAnalyzing ? "Analizando..." : "Subiendo..."}
                              </ButtonText>
                            </HStack>
                          ) : (
                            <ButtonText>Subir y Analizar</ButtonText>
                          )}
                        </Button>
                      </HStack>
                    </>
                  )}
                </VStack>
              ) : (
                <VStack space="lg">
                  <AnalysisResults
                    selectedFile={selectedFile}
                    billUrl={billUrl ?? null}
                    analysisResult={analysisResult}
                  />

                  <Button onPress={handleFinish} className="bg-success-600">
                    <ButtonText>Arma tu Efikit Solar</ButtonText>
                  </Button>

                  {safeKits.length > 1 && (
                    <Button
                      variant="outline"
                      action="secondary"
                      onPress={() => {
                        setAnalysisResult(null);
                        setSelectedFile(null);
                      }}
                    >
                      <ButtonText>Elegir otro Kit</ButtonText>
                    </Button>
                  )}
                </VStack>
              )}
            </>
          )}

          {/* Roof Type Tab Content */}
          {activeTab === "roof" && (
            <>
              <Heading size="xl">Seleccionar Tipo de Techo</Heading>
              <Text size="sm" className="text-typography-500">
                Elige el tipo de techo donde se instalará el kit solar.
              </Text>

              {safeKits.length > 1 ? (
                <KitSelector
                  kits={kits}
                  selectedKitId={selectedKitId}
                  onValueChange={setSelectedKitId}
                  isDisabled={false}
                />
              ) : safeKits.length === 1 ? (
                <Box className="rounded-lg border border-outline-300 bg-background-50 p-4">
                  <VStack space="xs">
                    <Text
                      size="xs"
                      className="font-bold text-typography-500 uppercase"
                    >
                      Kit Seleccionado
                    </Text>
                    <Text size="md" className="font-medium text-typography-900">
                      {safeKits[0].name}
                    </Text>
                  </VStack>
                </Box>
              ) : (
                <Box className="rounded-lg border border-outline-300 bg-background-50 p-4">
                  <VStack space="sm" className="items-center">
                    <Text className="text-center text-typography-500">
                      No tienes kits creados aún.
                    </Text>
                    <Button
                      variant="solid"
                      action="primary"
                      onPress={() => router.push("/(auth)/(tabs)/location")}
                      className="mt-2"
                    >
                      <ButtonText>Crear kit</ButtonText>
                    </Button>
                  </VStack>
                </Box>
              )}

              {safeKits.length > 0 && (
                <>
                  <VStack space="md">
                    <Heading size="md">Tipos de techo disponibles</Heading>
                    <Text size="xs" className="text-typography-500">
                      Selecciona una opción:
                    </Text>

                    {ROOF_TYPES.map((roofType) => (
                      <Pressable
                        key={roofType.value}
                        onPress={() => handleRoofTypeChange(roofType.value)}
                        className={`rounded-lg border p-4 ${
                          selectedRoofType === roofType.value
                            ? "border-primary-600 bg-primary-50"
                            : "border-outline-200 bg-background-50"
                        }`}
                      >
                        <HStack space="md" className="items-center">
                          <Text className="text-2xl">{roofType.icon}</Text>
                          <VStack space="xs" className="flex-1">
                            <Text
                              size="md"
                              className={`font-medium ${
                                selectedRoofType === roofType.value
                                  ? "text-primary-600"
                                  : "text-typography-900"
                              }`}
                            >
                              {roofType.label}
                            </Text>
                            <Text
                              size="xs"
                              className={`${
                                selectedRoofType === roofType.value
                                  ? "text-primary-700"
                                  : "text-typography-500"
                              }`}
                            >
                              {selectedRoofType === roofType.value
                                ? "Seleccionado"
                                : "Toque para seleccionar"}
                            </Text>
                          </VStack>
                          {selectedRoofType === roofType.value && (
                            <Box className="rounded-full bg-primary-600 p-1">
                              <Text className="text-sm text-white">✓</Text>
                            </Box>
                          )}
                        </HStack>
                      </Pressable>
                    ))}
                  </VStack>

                  {selectedRoofType && (
                    <Button
                      onPress={handleFinish}
                      className="bg-success-600 mt-4"
                    >
                      <ButtonText>Continuar</ButtonText>
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}