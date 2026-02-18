import React from "react";
import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  Input,
  InputField,
  Text,
  VStack,
} from "@/components/ui";
import { Animated, StyleSheet, View } from "react-native";

interface KitCreationFormProps {
  kitType?: string;
  kitName: string;
  setKitName: (name: string) => void;
  selectedLocation: { address: string } | null;
  onConfirm: () => void;
  keyboardOffset: Animated.Value | any;
}

export const KitCreationForm = ({
  kitType,
  kitName,
  setKitName,
  selectedLocation,
  onConfirm,
  keyboardOffset,
}: KitCreationFormProps) => {
  return (
    <Animated.View
      style={[
        styles.formContainer,
        { bottom: keyboardOffset }
      ]}
    >
      <Box className="bg-white p-4 rounded-t-3xl shadow-lg">
        <Heading size="md" className="mb-4">
          Crear Nuevo Kit Solar {kitType ? `(${kitType})` : ""}
        </Heading>
        <VStack space="md">
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>Nombre del Kit</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                placeholder="Ej. Kit Solar Cabaña"
                value={kitName}
                onChangeText={setKitName}
              />
            </Input>
          </FormControl>

          <View>
            <Text className="text-gray-500 text-sm mb-1">Ubicación:</Text>
            <Text numberOfLines={1} className="font-medium">
              {selectedLocation
                ? selectedLocation.address
                : "Ninguna ubicación seleccionada"}
            </Text>
          </View>

          <Button
            onPress={onConfirm}
            isDisabled={!selectedLocation || !kitName}
          >
            <ButtonText>Crear Kit</ButtonText>
          </Button>
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
