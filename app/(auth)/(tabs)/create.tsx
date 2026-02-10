import { useAction, useMutation, useQuery } from "convex/react";
import * as DocumentPicker from "expo-document-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronDown, FileUp, CheckCircle, AlertCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
import { ScrollView } from "react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Pressable } from "@/components/ui/pressable";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
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
    kitId || null
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
    selectedKitId ? { id: selectedKitId } : "skip"
  );
  const billUrl = useQuery(
    api.kits.getBillUrl,
    kit?.billStorageId ? { storageId: kit.billStorageId } : "skip"
  );
  const generateUploadUrl = useMutation(api.kits.generateUploadUrl);
  const addBillToKit = useMutation(api.kits.addBillToKit);
  const saveBillAnalysis = useMutation(api.kits.saveBillAnalysis);
  const analyzeBill = useAction(api.actions.analyzeBill);
  
  const safeKits = kits ?? [];
  const selectedKitObject = safeKits.find((k) => k._id === selectedKitId);

  // While the selected kit's data is loading, show a spinner.
  const isKitLoading = selectedKitId && kit === undefined;

  // Effect 1: Reset form state whenever the selected kit ID changes.
  // This ensures we start with a clean slate for each kit.
  useEffect(() => {
    setAnalysisResult(null);
    setSelectedFile(null);
  }, [selectedKitId]);

  // Effect 2: When the kit data has loaded, populate the form if there are existing bill details.
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

      // Set a placeholder for the file if a bill is linked to show the preview
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
    console.log("DocumentPicker result:", JSON.stringify(result, null, 2));

    if (result.canceled === false && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({ uri: asset.uri, mimeType: asset.mimeType, name: asset.name });
      setAnalysisResult(null); // Reset analysis if new file picked
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
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();

      // 2. Fetch the file from its local URI
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      // 3. Upload the file to the generated URL
      const uploadResult = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      const { storageId } = await uploadResult.json();

      // 4. Associate the storageId with the selected kit
      await addBillToKit({
        kitId: selectedKitId,
        storageId: storageId,
      });

      // 5. Trigger AI Analysis
      setIsAnalyzing(true);
      const analysis = await analyzeBill({ storageId });
      
      if (analysis.success) {
        setAnalysisResult(analysis.data);
        
        // 6. Save extracted data to the database
        await saveBillAnalysis({
          kitId: selectedKitId,
          monthlyConsumptionKwh: analysis.data.monthlyConsumptionKwh ?? undefined,
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
    router.push("/(auth)/(tabs)/garage");
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Heading size="xl">Subir Factura de Energía</Heading>
          <Text size="sm" className="text-typography-500">
            Sube tu factura para que la IA extraiga tu consumo y tarifas automáticamente.
          </Text>

          {isKitLoading ? (
            <Box className="h-96 w-full items-center justify-center">
              <ButtonSpinner />
            </Box>
          ) : !analysisResult ? (
            <VStack space="lg">
              {/* Kit Selector */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>Selecciona un Kit</FormControlLabelText>
                </FormControlLabel>
                <Select
                  selectedValue={selectedKitId ?? ""}
                  onValueChange={(value) => setSelectedKitId(value as Id<"kits">)}
                  isDisabled={!kits || kits.length === 0 || isSubmitting}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput
                      placeholder={!kits ? "Cargando kits..." : "Selecciona..."}
                      value={selectedKitObject?.name}
                    />
                    <SelectIcon as={ChevronDown} className="mr-3" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {safeKits.map((kit) => (
                        <SelectItem
                          key={kit._id}
                          label={kit.name}
                          value={kit._id}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              {/* File Picker */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>Archivo de Factura</FormControlLabelText>
                </FormControlLabel>
                <Pressable
                  onPress={pickFile}
                  disabled={isSubmitting}
                  className="w-full aspect-[16/9] bg-background-50 rounded-lg border border-dashed border-outline-300 items-center justify-center overflow-hidden"
                >
                  {selectedFile ? (
                    selectedFile.mimeType?.startsWith("image/") ? (
                      <Image
                        source={{ uri: selectedFile.uri }}
                        alt="Energy bill"
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    ) : (
                      <VStack className="items-center p-4" space="xs">
                        <FileUp size={48} color="#9CA3AF" />
                        <Text size="sm" className="text-typography-500 mt-2 text-center" isTruncated>
                          {selectedFile.name || 'Archivo seleccionado'}
                        </Text>
                      </VStack>
                    )
                  ) : (
                    <VStack className="items-center" space="xs">
                      <FileUp size={48} color="#9CA3AF" />
                      <Text size="sm" className="text-typography-400 mt-2">
                        Toca para seleccionar una imagen o PDF
                      </Text>
                    </VStack>
                  )}
                </Pressable>
              </FormControl>

              <HStack space="md" className="mt-4 w-full">
                <Button
                  variant="outline"
                  action="secondary"
                  onPress={() => router.push("/(auth)/(tabs)/garage")}
                  className="flex-1"
                >
                  <ButtonText>Cancelar</ButtonText>
                </Button>
                <Button
                  onPress={handleSubmit}
                  isDisabled={isSubmitting || !selectedKitId || !selectedFile}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <HStack space="sm" className="items-center justify-center">
                      <ButtonSpinner />
                      <ButtonText>{isAnalyzing ? "Analizando..." : "Subiendo..."}</ButtonText>
                    </HStack>
                  ) : (
                    <ButtonText>Subir y Analizar</ButtonText>
                  )}
                </Button>
              </HStack>
            </VStack>
          ) : (
            /* Analysis Results Card */
            <VStack space="lg">
              {/* Only show the file preview box right after a file has been picked, not when viewing existing data. */}
              {selectedFile && selectedFile.uri !== 'existing' && (
                <Box className="w-full aspect-[16/9] bg-background-50 rounded-lg overflow-hidden border border-outline-200">
                  {(billUrl || selectedFile?.mimeType?.startsWith("image/")) ? (
                    <Image
                      source={{ uri: billUrl || selectedFile!.uri }}
                      alt="Uploaded bill"
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  ) : (
                    <VStack className="items-center justify-center flex-1" space="xs">
                      <FileUp size={48} color="#9CA3AF" />
                      <Text size="sm" className="text-typography-500 mt-2">
                        Documento PDF subido
                      </Text>
                    </VStack>
                  )}
                </Box>
              )}

              <Card variant="outline" className="p-4 border-success-300 bg-success-50">
                <HStack space="md" className="items-center mb-4">
                  <CheckCircle size={24} color="#10B981" />
                  <Heading size="md" className="text-success-800">Datos Extraídos</Heading>
                </HStack>
                
                <VStack space="md">
                  <HStack className="justify-between">
                    <Text className="text-typography-500">Proveedor:</Text>
                    <Text className="font-bold">{analysisResult.provider || "N/A"}</Text>
                  </HStack>
                  <HStack className="justify-between">
                    <Text className="text-typography-500">Periodo:</Text>
                    <Text className="font-bold">{analysisResult.billingPeriod || "N/A"}</Text>
                  </HStack>
                  <HStack className="justify-between border-t border-success-200 pt-2">
                    <Text className="text-typography-500">Consumo:</Text>
                    <Text className="font-bold text-lg">{analysisResult.monthlyConsumptionKwh} kWh</Text>
                  </HStack>
                  <HStack className="justify-between">
                    <Text className="text-typography-500">Tarifa:</Text>
                    <Text className="font-bold">{analysisResult.currency} ${analysisResult.energyRate}</Text>
                  </HStack>
                  <HStack className="justify-between">
                    <Text className="text-typography-500">Total:</Text>
                    <Text className="font-bold">{analysisResult.currency} ${analysisResult.totalAmount}</Text>
                  </HStack>
                </VStack>
              </Card>

              <Text size="xs" className="text-typography-400 text-center italic">
                Estos datos se han extraído automáticamente. En el siguiente paso podrás ajustar tu configuración solar.
              </Text>

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
