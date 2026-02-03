import { useState } from "react";
import { ScrollView, Platform, View } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { ChevronDown, FileUp, Image as ImageIcon } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Image } from "@/components/ui/image";
import { Icon } from "@/components/ui/icon";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function UploadBillScreen() {
  const router = useRouter();
  const toast = useToast();
  
  // Queries & Mutations
  const kits = useQuery(api.kits.getKits, {});
  const generateUploadUrl = useMutation(api.kits.generateUploadUrl);
  const addBillToKit = useMutation(api.kits.addBillToKit);

  // Component State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState<Id<"kits"> | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; mimeType?: string } | null>(null);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled === false && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  const handleSubmit = async () => {
    if (!selectedKitId || !selectedFile) {
        toast.show({
            placement: "top",
            render: ({ id }) => (
                <Toast nativeID={`toast-${id}`} action="error">
                    <ToastTitle>Faltan datos</ToastTitle>
                    <ToastDescription>Por favor, selecciona un kit y un archivo.</ToastDescription>
                </Toast>
            )
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

      toast.show({
        placement: "top",
        render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success">
                <ToastTitle>¡Éxito!</ToastTitle>
                <ToastDescription>Factura subida y asociada al kit correctamente.</ToastDescription>
            </Toast>
        )
      });
      
      // Reset form and navigate
      setSelectedKitId(null);
      setSelectedFile(null);
      router.push("/(auth)/(tabs)/garage");

    } catch (err) {
      console.error("Error uploading bill:", err);
      toast.show({
        placement: "top",
        render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error">
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>No se pudo subir la factura. Inténtalo de nuevo.</ToastDescription>
            </Toast>
        )
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedKitName = kits?.find(k => k._id === selectedKitId)?.name;

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Heading size="xl">Subir Factura de Energía</Heading>
          <Text size="sm" className="text-typography-500">
            Selecciona el kit y sube una foto o PDF de tu factura de energía.
          </Text>

          <VStack space="lg">
            {/* Kit Selector */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Selecciona un Kit</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={selectedKitId ?? ""}
                onValueChange={(value) => setSelectedKitId(value as Id<"kits">)}
                isDisabled={!kits || kits.length === 0}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder={!kits ? "Cargando kits..." : "Selecciona..."} />
                  <SelectIcon as={ChevronDown} className="mr-3" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {kits?.map((kit) => (
                      <SelectItem key={kit._id} label={kit.name} value={kit._id} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
               {kits && kits.length === 0 && (
                <Text size="sm" className="text-negative-500 mt-2">
                    No tienes kits. Por favor, crea uno en la pestaña de Búsqueda.
                </Text>
            )}
            </FormControl>

            {/* File Picker */}
            <FormControl>
                <FormControlLabel>
                    <FormControlLabelText>Archivo de Factura</FormControlLabelText>
                </FormControlLabel>
                <Pressable onPress={pickFile} className="w-full aspect-[16/9] bg-background-50 rounded-lg border border-dashed border-outline-300 items-center justify-center overflow-hidden">
                {selectedFile ? (
                    selectedFile.mimeType?.startsWith("image/") ? (
                        <Image
                            source={{ uri: selectedFile.uri }}
                            alt="Energy bill"
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    ) : (
                         <VStack className="items-center" space="xs">
                            <FileUp size={48} color="#9CA3AF" />
                            <Text size="sm" className="text-typography-500 mt-2">
                                Archivo seleccionado
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
           
            <Button
              className="mt-4"
              onPress={handleSubmit}
              isDisabled={isSubmitting || !selectedKitId || !selectedFile}
            >
              {isSubmitting ? <ButtonSpinner /> : <ButtonText>Subir Factura</ButtonText>}
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}