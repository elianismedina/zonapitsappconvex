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
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface FilePickerProps {
  onPress: () => void;
  selectedFile: {
    uri: string;
    mimeType?: string;
    name?: string;
  } | null;
  isDisabled: boolean;
}

export const FilePicker = ({
  onPress,
  selectedFile,
  isDisabled,
}: FilePickerProps) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!selectedFile) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [selectedFile, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText>Archivo de Factura</FormControlLabelText>
      </FormControlLabel>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className="aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-outline-300 bg-background-50"
      >
        {selectedFile ? (
          selectedFile.mimeType?.startsWith("image/") ? (
            <Image
              source={{ uri: selectedFile.uri }}
              alt="Energy bill"
              className="h-full w-full"
              resizeMode="contain"
            />
          ) : (
            <VStack className="items-center p-4" space="xs">
              <FileUp size={48} color="#9CA3AF" />
              <Text
                size="sm"
                className="mt-2 text-center text-typography-500"
                isTruncated
              >
                {selectedFile.name || "Archivo seleccionado"}
              </Text>
            </VStack>
          )
        ) : (
          <VStack className="items-center" space="xs">
            <Animated.View style={animatedStyle}>
              <FileUp size={56} color="#F0D117" />
            </Animated.View>
            <Text size="sm" className="mt-2 font-medium text-primary-600">
              Toca para seleccionar una imagen o PDF
            </Text>
          </VStack>
        )}
      </Pressable>
    </FormControl>
  );
};
