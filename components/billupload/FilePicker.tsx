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
  }, [selectedFile]);

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
              <Text
                size="sm"
                className="text-typography-500 mt-2 text-center"
                isTruncated
              >
                {selectedFile.name || "Archivo seleccionado"}
              </Text>
            </VStack>
          )
        ) : (
          <VStack className="items-center" space="xs">
            <Animated.View style={animatedStyle}>
              <FileUp size={56} color="#0066FF" />
            </Animated.View>
            <Text size="sm" className="font-medium text-primary-600 mt-2">
              Toca para seleccionar una imagen o PDF
            </Text>
          </VStack>
        )}
      </Pressable>
    </FormControl>
  );
};
