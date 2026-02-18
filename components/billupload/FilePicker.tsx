import React from "react";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Image,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { FileUp } from "lucide-react-native";

interface FilePickerProps {
  onPress: () => void;
  selectedFile: {
    uri: string;
    mimeType?: string;
    name?: string;
  } | null;
  isDisabled: boolean;
}

export const FilePicker = ({ onPress, selectedFile, isDisabled }: FilePickerProps) => {
  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText>Archivo de Factura</FormControlLabelText>
      </FormControlLabel>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
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
  );
};
