import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Edit, FileText, Trash, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

type SizingResults = {
  peakSunHours: number;
  dailyDemandKwh: number;
  sizingOptions: {
    module: {
      brand: string;
      model: string;
      pmax: number;
      price: number; // Price per panel
    };
    panelsNeeded: number;
    totalCapacityKw: number;
    totalPrice: number; // Total price for this option
  }[];
} | null;

export default function GarageScreen() {
  const kits = useQuery(api.kits.getKits, {});
  const deleteKit = useMutation(api.kits.deleteKit);
  const updateKit = useMutation(api.kits.updateKit);
  const calculateSizing = useAction(api.sizing.calculateSizing);
  const router = useRouter();

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKit, setEditingKit] = useState<{
    id: Id<"kits">;
    name: string;
  } | null>(null);
  const [newKitName, setNewKitName] = useState("");

  // State for Sizing Modal
  const [showSizingModal, setShowSizingModal] = useState(false);
  const [isSizing, setIsSizing] = useState(false);
  const [sizingResults, setSizingResults] = useState<SizingResults>(null);
  const [selectedKitName, setSelectedKitName] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );

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
          },
        },
      ],
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

  const handleSizing = async (kit: any) => {
    if (!kit.monthlyConsumptionKwh) {
      Alert.alert(
        "Datos incompletos",
        "Primero debes adjuntar una factura para este kit para poder dimensionar el sistema.",
      );
      return;
    }
    setSelectedKitName(kit.name);
    setShowSizingModal(true);
    setIsSizing(true);

    setSizingResults(null);
    setSelectedOptionIndex(null);
    try {
      const results = await calculateSizing({ kitId: kit._id });
      setSizingResults(results as SizingResults);
    } catch (error: any) {
      console.error("Error calculating sizing:", error);
      Alert.alert("Error de Cálculo", error.message);
      setShowSizingModal(false);
    } finally {
      setIsSizing(false);
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
      <Heading size="xl" className="mb-4">
        Mis Kits Solares
      </Heading>

      {kits.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <VStack space="lg" className="items-center">
            <Text size="lg" className="text-center">
              No tienes kits registrados.
            </Text>
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
                  <HStack space="sm" className="items-center flex-1">
                    <Heading size="md" className="flex-shrink-0">
                      {item.name}
                    </Heading>
                    {item.billStorageId && (
                      <FileText size={16} color="#6B7280" />
                    )}
                  </HStack>
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

                {item.provider && (
                  <VStack
                    space="sm"
                    className="mt-2 pt-2 border-t border-outline-200"
                  >
                    <Heading size="sm" className="mb-1">
                      Detalles de Factura
                    </Heading>
                    <HStack space="md">
                      <Text className="font-bold w-32">Proveedor:</Text>
                      <Text className="flex-1">{item.provider}</Text>
                    </HStack>
                    <HStack space="md">
                      <Text className="font-bold w-32">Periodo:</Text>
                      <Text className="flex-1">{item.billingPeriod}</Text>
                    </HStack>
                    <HStack space="md">
                      <Text className="font-bold w-32">Consumo Mensual:</Text>
                      <Text className="flex-1">
                        {item.monthlyConsumptionKwh} kWh
                      </Text>
                    </HStack>
                    <HStack space="md">
                      <Text className="font-bold w-32">Costo Total:</Text>
                      <Text className="flex-1">
                        {item.currency} ${item.totalAmount}
                      </Text>
                    </HStack>
                  </VStack>
                )}

                {item.billStorageId && (
                  <Button
                    className="mt-4"
                    onPress={() => handleSizing(item)}
                    isDisabled={!item.monthlyConsumptionKwh}
                  >
                    <ButtonText>Dimensionar Kit</ButtonText>
                  </Button>
                )}
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
            <Button size="md" action="primary" onPress={handleSaveEdit}>
              <ButtonText>Guardar</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sizing Modal */}
      <Modal
        isOpen={showSizingModal}
        onClose={() => setShowSizingModal(false)}
        size="lg"
      >
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
              <View className="h-64 items-center justify-center">
                <ActivityIndicator size="large" />
                <Text className="mt-4">
                  Calculando... Estamos contactando a la NASA...
                </Text>
              </View>
            )}
            {sizingResults && (
              <VStack space="md">
                <HStack className="justify-between p-2 bg-background-100 rounded-md">
                  <Text>Horas Pico Solar (HSP):</Text>
                  <Text className="font-bold">
                    {sizingResults.peakSunHours}
                  </Text>
                </HStack>
                <HStack className="justify-between p-2 bg-background-100 rounded-md">
                  <Text>Demanda Diaria (con margen):</Text>
                  <Text className="font-bold">
                    {sizingResults.dailyDemandKwh} kWh
                  </Text>
                </HStack>

                <Heading size="md" className="mt-4">
                  Opciones de Paneles
                </Heading>
                {sizingResults.sizingOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedOptionIndex(index)}
                    className={`p-3 rounded-lg shadow-md mb-3 border-2 ${
                      selectedOptionIndex === index
                        ? "bg-primary-50 border-primary-500"
                        : "bg-white border-transparent"
                    }`}
                  >
                    {/* Replaced Card with View */}
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 flex-shrink min-w-0">
                        {/* Allow text to wrap/shrink */}
                        <Text className="font-bold">
                          {String(option.module.brand)}{" "}
                          {String(option.module.model)}
                        </Text>
                        <Text size="sm" className="text-typography-500">
                          {String(option.module.pmax)} Wp @ $
                          {String(option.module.price)}/panel
                        </Text>
                      </View>
                      <View className="items-end ml-2">
                        {/* Add some left margin */}
                        <Text className="text-lg font-bold text-primary-600">
                          {String(option.panelsNeeded)}
                        </Text>
                        <Text size="sm">paneles</Text>
                        <Text className="text-sm font-bold mt-1">
                          ${String(option.totalPrice.toLocaleString())}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter className="flex-row justify-between w-full">
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowSizingModal(false)}
            >
              <ButtonText>Volver</ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={() => {
                if (selectedOptionIndex !== null && sizingResults) {
                  // TODO: Implement continuation logic here
                  console.log(
                    "Selected option:",
                    sizingResults.sizingOptions[selectedOptionIndex],
                  );
                  setShowSizingModal(false);
                }
              }}
              isDisabled={selectedOptionIndex === null}
            >
              <ButtonText>Continuar</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
}
