import React, { useState } from 'react';
import { FlatList, ActivityIndicator, View, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { Trash, Edit, X } from 'lucide-react-native';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@/components/ui/modal';
import { Input, InputField } from '@/components/ui/input';
import { Id } from '@/convex/_generated/dataModel';

export default function GarageScreen() {
  const kits = useQuery(api.kits.getKits, {});
  const deleteKit = useMutation(api.kits.deleteKit);
  const updateKit = useMutation(api.kits.updateKit);
  const router = useRouter();

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKit, setEditingKit] = useState<{ id: Id<"kits">, name: string } | null>(null);
  const [newKitName, setNewKitName] = useState("");

  const handleDelete = (id: Id<"kits">) => {
    Alert.alert(
      "Eliminar Kit",
      "¿Estás seguro de que quieres eliminar este kit? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteKit({ id });
            } catch (error) {
              console.error("Error deleting kit:", error);
              Alert.alert("Error", "No se pudo eliminar el kit.");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (kit: any) => {
    setEditingKit({ id: kit._id, name: kit.name });
    setNewKitName(kit.name);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingKit || !newKitName.trim()) return;

    try {
      await updateKit({
        id: editingKit.id,
        name: newKitName.trim(),
      });
      setShowEditModal(false);
      setEditingKit(null);
    } catch (error) {
      console.error("Error updating kit:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre del kit.");
    }
  };

  if (kits === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Heading size="xl" className="mb-4">Mis Kits Solares</Heading>
      
      {kits.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <VStack space="lg" className="items-center">
            <Text size="lg" className="text-center">No tienes kits registrados.</Text>
            <Button 
                size="md" 
                variant="solid" 
                action="primary"
                onPress={() => router.push("/(auth)/(tabs)/search")}
            >
                <ButtonText>Crear un Kit</ButtonText>
            </Button>
          </VStack>
        </View>
      ) : (
        <FlatList
          data={kits}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card size="md" variant="elevated" className="mb-4 p-4">
              <VStack space="md">
                <HStack className="justify-between items-center">
                    <Heading size="md" className="flex-1">{item.name}</Heading>
                    <HStack space="sm">
                        <Button 
                            size="xs" 
                            variant="outline" 
                            action="secondary" 
                            onPress={() => handleEdit(item)}
                        >
                            <ButtonIcon as={Edit} />
                        </Button>
                        <Button 
                            size="xs" 
                            variant="outline" 
                            action="negative" 
                            onPress={() => handleDelete(item._id)}
                        >
                             <ButtonIcon as={Trash} />
                        </Button>
                    </HStack>
                </HStack>
                
                <VStack space="xs">
                    <HStack space="md" className="items-center">
                        <Text className="font-bold w-24">Dirección:</Text>
                        <Text className="flex-1">{item.address}</Text>
                    </HStack>
                    <HStack space="md">
                        <Text className="font-bold w-24">Estado:</Text>
                        <Text className="capitalize">{item.status}</Text>
                    </HStack>
                    {item.capacity && (
                      <HStack space="md">
                          <Text className="font-bold w-24">Capacidad:</Text>
                          <Text>{item.capacity} kWp</Text>
                      </HStack>
                    )}
                </VStack>
              </VStack>
            </Card>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        size="md"
      >
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
              onPress={() => {
                setShowEditModal(false);
              }}
              className="mr-3"
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>
            <Button
              size="md"
              action="primary"
              borderWidth="$0"
              onPress={handleSaveEdit}
            >
              <ButtonText>Guardar</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
}