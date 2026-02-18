import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonText,
  Heading,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from "@/components/ui";
import { X } from "lucide-react-native";
import { Id } from "@/convex/_generated/dataModel";

interface EditKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  kit: { id: Id<"kits">; name: string } | null;
  onSave: (newName: string) => Promise<void>;
}

export const EditKitModal = ({ isOpen, onClose, kit, onSave }: EditKitModalProps) => {
  const [newKitName, setNewKitName] = useState("");

  useEffect(() => {
    if (kit) {
      setNewKitName(kit.name);
    }
  }, [kit]);

  const handleSave = () => {
    if (newKitName.trim()) {
      onSave(newKitName.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg" className="text-typography-950">
            Editar Kit
          </Heading>
          <ModalCloseButton>
            <X size={24} color="gray" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack space="sm">
            <Text size="sm" className="text-typography-500">
              Nombre del Kit
            </Text>
            <Input>
              <InputField
                value={newKitName}
                onChangeText={setNewKitName}
                placeholder="Nombre del kit"
              />
            </Input>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            className="mr-3"
          >
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button size="md" action="primary" onPress={handleSave}>
            <ButtonText>Guardar</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
