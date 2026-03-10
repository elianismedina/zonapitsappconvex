import { useAction, useMutation, useQuery } from "convex/react";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  BillAnalysisResult,
  RoofType,
  SelectedFile,
} from "@/components/billupload/types";
import { ToastNotifyOptions } from "@/components/hooks/useToastNotify";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type NotifyFn = (opts: ToastNotifyOptions) => void;

const noopNotify: NotifyFn = () => undefined;

export const useBillUpload = (options?: { notify?: NotifyFn }) => {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();
  const notify = options?.notify ?? noopNotify;

  const [activeTab, setActiveTab] = useState<"bill" | "roof">("bill");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState<Id<"kits"> | null>(
    kitId || null,
  );
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<BillAnalysisResult | null>(null);
  const [generationPercentage, setGenerationPercentage] = useState(100);
  const [selectedRoofType, setSelectedRoofType] = useState<RoofType | null>(
    null,
  );

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
  const isKitLoading = selectedKitId && kit === undefined;

  useEffect(() => {
    if (safeKits.length === 1 && !selectedKitId) {
      setSelectedKitId(safeKits[0]._id);
    }
  }, [safeKits, selectedKitId]);

  useEffect(() => {
    setAnalysisResult(null);
    setSelectedFile(null);
  }, [selectedKitId]);

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
      notify({
        title: "Faltan datos",
        description: "Por favor, selecciona un kit y un archivo.",
        action: "error",
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

        notify({
          title: "Análisis completado",
          description: "Hemos extraído los datos de tu factura.",
          action: "success",
        });
      } else {
        throw new Error(analysis.error || "Error en el análisis");
      }
    } catch (err) {
      console.error("Error processing bill:", err);
      notify({
        title: "Error",
        description: "No se pudo procesar la factura. Inténtalo de nuevo.",
        action: "error",
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
        notify({
          title: "Tipo de techo guardado",
          description: "El tipo de techo se ha actualizado correctamente.",
          action: "success",
        });
      } catch (err) {
        console.error("Error updating kit roof type:", err);
        notify({
          title: "Error",
          description:
            "No se pudo guardar el tipo de techo. Inténtalo de nuevo.",
          action: "error",
        });
      }
    }
  };

  const handleFinish = () => {
    router.push("/(auth)/(tabs)/mykits");
  };

  const handleCancel = () => {
    router.push("/(auth)/(tabs)/mykits");
  };

  const handleCreateKit = () => {
    router.push("/(auth)/(tabs)/location");
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setSelectedFile(null);
  };

  return {
    activeTab,
    setActiveTab,
    isSubmitting,
    isAnalyzing,
    selectedKitId,
    setSelectedKitId,
    selectedFile,
    analysisResult,
    generationPercentage,
    selectedRoofType,
    kits,
    kit,
    billUrl,
    safeKits,
    isKitLoading,
    pickFile,
    handleSubmit,
    handlePercentageChange,
    handleRoofTypeChange,
    handleFinish,
    handleCancel,
    handleCreateKit,
    resetAnalysis,
  };
};
