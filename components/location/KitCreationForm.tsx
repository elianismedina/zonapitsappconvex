import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Heading,
  Input,
  InputField,
  Text,
  VStack,
} from "@/components/ui";
import React, { useEffect } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface KitCreationFormProps {
  kitType?: string;
  kitName: string;
  setKitName: (name: string) => void;
  selectedLocation: { address: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  keyboardOffset: Animated.Value | any;
  shakeSignal?: number;
}

export const KitCreationForm = ({
  kitType,
  kitName,
  setKitName,
  selectedLocation,
  onConfirm,
  onCancel,
  keyboardOffset,
  shakeSignal = 0,
}: KitCreationFormProps) => {
  const shakeTranslateX = useSharedValue(0);

  useEffect(() => {
    if (shakeSignal > 0) {
      shakeTranslateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(withTiming(10, { duration: 50 }), 5, true),
        withTiming(0, { duration: 50 }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeSignal]);

  const nameAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeTranslateX.value }],
    };
  });

  return (
    <Animated.View style={[styles.formContainer, { bottom: keyboardOffset }]}>
      <Box className="rounded-t-3xl bg-white p-4 shadow-lg">
        <Heading size="md" className="mb-4">
          Crear Nuevo Kit Solar {kitType ? `(${kitType})` : ""}
        </Heading>
        <VStack space="md">
          <Reanimated.View style={nameAnimatedStyle}>
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Nombre del Kit</FormControlLabelText>
              </FormControlLabel>
              <Input size="lg" className="h-12">
                <InputField
                  placeholder="Ej. Kit Solar Cabaña"
                  value={kitName}
                  onChangeText={setKitName}
                  className="py-0"
                />
              </Input>
            </FormControl>
          </Reanimated.View>

          <View>
            <Text className="mb-1 text-sm text-gray-500">Ubicación:</Text>
            <Text numberOfLines={1} className="font-medium">
              {selectedLocation
                ? selectedLocation.address
                : "Ninguna ubicación seleccionada"}
            </Text>
          </View>

          <HStack space="md" className="w-full">
            {selectedLocation && (
              <Button
                variant="outline"
                action="secondary"
                onPress={onCancel}
                className="flex-1"
              >
                <ButtonText>Cancelar</ButtonText>
              </Button>
            )}
            <Button onPress={onConfirm} className="flex-1">
              <ButtonText>Crear Kit</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
});
