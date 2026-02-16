import {
  Button,
  ButtonIcon,
  ButtonText,
  Card,
  Heading,
  HStack,
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
  Box,
  Pressable,
  Spinner,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Edit, FileText, Trash, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
} from "react-native";
import { KitBillDetails } from "@/components/KitBillDetails";

type SizingResults = {
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
  }[];
} | null;

export default function GarageScreen() {
  const kits = useQuery(api.kits.getKits, {});
  const deleteKit = useMutation(api.kits.deleteKit);
  const updateKit = useMutation(api.kits.updateKit);
  const addComponent = useMutation(api.kit_components.addComponent);
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
  const [selectedKitId, setSelectedKitId] = useState<Id<"kits"> | null>(null);
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
    setSelectedKitId(kit._id);
    setSelectedKitName(kit.name);
    setShowSizingModal(true);
    setIsSizing(true);

    setSizingResults(null);
    setSelectedOptionIndex(null);
    try {
      const results = await calculateSizing({ kitId: kit._id });
      console.log("Sizing Results received:", JSON.stringify(results, null, 2));
      setSizingResults(results as SizingResults);
    } catch (error: any) {
      console.error("Error calculating sizing:", error);
      Alert.alert("Error de Cálculo", error.message);
      setShowSizingModal(false);
    } finally {
      setIsSizing(false);
    }
  };

  const handleSelectModule = async () => {
    if (!sizingResults || selectedOptionIndex === null || !selectedKitId) return;

    const selectedOption = sizingResults.sizingOptions[selectedOptionIndex];
    const moduleId = selectedOption.moduleId;
    
    if (!moduleId) {
      Alert.alert("Error", "No se encontró el ID del módulo solar. Intenta dimensionar de nuevo.");
      return;
    }

    try {
      await addComponent({
        kitId: selectedKitId,
        type: "solar_module",
        solarModuleId: moduleId,
        quantity: selectedOption.panelsNeeded,
      });

      setShowSizingModal(false);
      Alert.alert(
        "¡Éxito!",
        `Se han añadido ${selectedOption.panelsNeeded} paneles ${selectedOption.brand} a tu kit.`,
      );
    } catch (error) {
      console.error("Error adding component:", error);
      Alert.alert("Error", "No se pudo añadir el módulo al kit.");
    }
  };

  if (kits === undefined) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Box className="flex-1 p-4 bg-background-0">
      <Heading size="xl" className="mb-4">
        Mis Kits Solares
      </Heading>

      {kits.length === 0 ? (
        <Box className="flex-1 justify-center items-center">
          <VStack space="lg" className="items-center">
            <Text size="lg" className="text-center">
              No tienes kits registrados.
            </Text>
            <Button
              size="md"
              variant="solid"
              action="primary"
              onPress={() => router.push("/(auth)/(tabs)/location")}
            >
              <ButtonText>Crear un Kit</ButtonText>
            </Button>
          </VStack>
        </Box>
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
                    <Text size="sm" className="font-bold w-24">Dirección:</Text>
                    <Text size="sm" className="flex-1">{item.address}</Text>
                  </HStack>
                  <HStack space="md">
                    <Text size="sm" className="font-bold w-24">Estado:</Text>
                    <Text size="sm" className="capitalize">{item.status}</Text>
                  </HStack>
                  {item.capacity && (
                    <HStack space="md">
                      <Text size="sm" className="font-bold w-24">Capacidad:</Text>
                      <Text size="sm">{item.capacity} kWp</Text>
                    </HStack>
                  )}
                </VStack>

                {item.provider && (
                  <Box className="mt-2 pt-2 border-t border-outline-200">
                    <KitBillDetails 
                      provider={item.provider}
                      billingPeriod={item.billingPeriod}
                      monthlyConsumptionKwh={item.monthlyConsumptionKwh}
                      totalAmount={item.totalAmount}
                      currency={item.currency}
                      showTitle
                      variant="compact"
                    />
                  </Box>
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
              <Box className="h-64 items-center justify-center">
                <Spinner size="large" />
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
                    onPress={() => setSelectedOptionIndex(index)}
                    className={`p-3 rounded-lg shadow-soft-1 mb-3 border-2 ${
                      selectedOptionIndex === index
                        ? "bg-primary-50 border-primary-500"
                        : "bg-white border-transparent"
                    }`}
                  >
                    <HStack className="justify-between items-center">
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
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowSizingModal(false)}
            >
              <ButtonText>Volver</ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={handleSelectModule}
              isDisabled={selectedOptionIndex === null || isSizing}
            >
              <ButtonText>Continuar</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}