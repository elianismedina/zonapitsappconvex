import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Id } from "@/convex/_generated/dataModel";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import React from "react";
import { LoadingAnimation } from "../LoadingAnimation";

export type SizingResults = {
  peakSunHours: number;
  dailyDemandKwh: number;
  version?: number;
  sizingOptions: {
    moduleId: Id<"solar_modules">;
    brand: string;
    model: string;
    pmax: number;
    price: number;
    panelsNeeded: number;
    totalCapacityKw: number;
    totalPrice: number;
    imageUrl?: string;
  }[];
} | null;

interface SizingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSizing: boolean;
  sizingResults: SizingResults;
  selectedKitName: string;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  onConfirm: () => Promise<void>;
}

export const SizingModal = ({
  isOpen,
  onClose,
  isSizing,
  sizingResults,
  selectedKitName,
  selectedOptionIndex,
  onSelectOption,
  onConfirm,
}: SizingModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            Dimensionamiento para {selectedKitName || "Kit Seleccionado"}
          </Heading>
          <ModalCloseButton>
            <X size={24} color="gray" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          {isSizing && (
            <Box className="h-64 items-center justify-center">
              <LoadingAnimation size={140} />
              <Text className="mt-4">
                Calculando... Estamos contactando a la NASA...
              </Text>
            </Box>
          )}
          {sizingResults && (
            <VStack space="md">
              <HStack className="justify-between p-2 bg-background-50 rounded-md">
                <Text size="sm">Horas Pico Solar (HSP):</Text>
                <Text size="sm" className="font-bold">
                  {sizingResults.peakSunHours}
                </Text>
              </HStack>
              <HStack className="justify-between p-2 bg-background-50 rounded-md">
                <Text size="sm">Demanda Diaria (con margen):</Text>
                <Text size="sm" className="font-bold">
                  {sizingResults.dailyDemandKwh} kWh
                </Text>
              </HStack>

              <Heading size="md" className="mt-4">
                Opciones de Paneles
              </Heading>
              {sizingResults.sizingOptions.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => onSelectOption(index)}
                  className={`p-3 rounded-lg shadow-soft-1 mb-3 border-2 flex-row items-center ${
                    selectedOptionIndex === index
                      ? "bg-primary-50 border-primary-500"
                      : "bg-white border-transparent"
                  }`}
                >
                  {option.imageUrl && (
                    <Image
                      source={{ uri: option.imageUrl }}
                      style={{ width: 64, height: 64 }}
                      contentFit="contain"
                      transition={200}
                      className="mr-3 rounded-md border border-outline-100 bg-background-50"
                    />
                  )}
                  <HStack className="justify-between items-center flex-1">
                    <VStack className="flex-1 flex-shrink min-w-0">
                      <Text className="font-bold">
                        {option.brand} {option.model}
                      </Text>
                      <Text size="xs" className="text-typography-500">
                        {option.pmax} Wp @ ${option.price}/panel
                      </Text>
                    </VStack>
                    <VStack className="items-end ml-2">
                      <Text size="lg" className="font-bold text-primary-600">
                        {option.panelsNeeded}
                      </Text>
                      <Text size="xs">paneles</Text>
                      <Text size="sm" className="font-bold mt-1">
                        ${option.totalPrice.toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter className="flex-row justify-between w-full">
          <Button variant="outline" action="secondary" onPress={onClose}>
            <ButtonText>Volver</ButtonText>
          </Button>
          <Button
            action="primary"
            onPress={onConfirm}
            isDisabled={selectedOptionIndex === null || isSizing}
          >
            <ButtonText>Continuar</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
