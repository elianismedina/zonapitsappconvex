import { useAction, useMutation, useQuery } from "convex/react";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { LoadingAnimation } from "@/components/LoadingAnimation";
import { AnalysisResults } from "@/components/billupload/AnalysisResults";
import { FilePicker } from "@/components/billupload/FilePicker";
import { KitSelector } from "@/components/billupload/KitSelector";
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  HStack,
  Heading,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  VStack,
  useToast,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function UploadBillScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();
  const toast = useToast();

  // Component State
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

      if (kit.billStorageId) {
        setSelectedFile({ uri: "existing", name: "Factura Guardada" });
      }
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

  const handleFinish = () => {
    router.push("/(auth)/(tabs)/mykits");
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Heading size="xl">Subir Factura de Energía</Heading>
          <Text size="sm" className="text-typography-500">
            Sube tu factura para que la IA extraiga tu consumo y tarifas
            automáticamente.
          </Text>

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
                <Box className="p-4 bg-background-50 rounded-lg border border-outline-300">
                  <VStack space="xs">
                    <Text
                      size="xs"
                      className="text-typography-500 uppercase font-bold"
                    >
                      Kit Seleccionado
                    </Text>
                    <Text size="md" className="font-medium text-typography-900">
                      {safeKits[0].name}
                    </Text>
                  </VStack>
                </Box>
              ) : (
                <Box className="p-4 bg-background-50 rounded-lg border border-outline-300">
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
                      <ButtonText>Armar kit</ButtonText>
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
        </VStack>
      </ScrollView>
    </Box>
  );
}
