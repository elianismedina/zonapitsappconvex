import { LoadingAnimation } from "@/components/LoadingAnimation";
import { EditKitModal } from "@/components/mykits/EditKitModal";
import { EmptyKitsView } from "@/components/mykits/EmptyKitsView";
import { KitCard } from "@/components/mykits/KitCard";
import { SizingModal, SizingResults } from "@/components/mykits/SizingModal";
import { Box, Heading } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import React, { useMemo, useState } from "react";
import { Alert, FlatList } from "react-native";

export default function GarageScreen() {
  const kits = useQuery(api.kits.getKits, {});
  const deleteKit = useMutation(api.kits.deleteKit);
  const updateKit = useMutation(api.kits.updateKit);
  const addComponent = useMutation(api.kit_components.addComponent);
  const calculateSizing = useAction(api.sizing.calculateSizing);

  // Query all kit components for all of user's kits
  const allKitComponents = useQuery(api.kit_components.getAllComponents);

  // Create a map of kitId to components for efficient lookup
  const kitComponentsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    if (allKitComponents) {
      allKitComponents.forEach((comp) => {
        const kitIdStr = String(comp.kitId);
        const existing = map.get(kitIdStr) || [];
        map.set(kitIdStr, [...existing, comp]);
      });
    }
    return map;
  }, [allKitComponents]);

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKit, setEditingKit] = useState<{
    id: Id<"kits">;
    name: string;
  } | null>(null);

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
    setShowEditModal(true);
  };

  const handleSaveEdit = async (newName: string) => {
    if (!editingKit) return;

    try {
      await updateKit({
        id: editingKit.id,
        name: newName,
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
    if (!sizingResults || selectedOptionIndex === null || !selectedKitId)
      return;

    const selectedOption = sizingResults.sizingOptions[selectedOptionIndex];
    const moduleId = selectedOption.moduleId;

    if (!moduleId) {
      Alert.alert(
        "Error",
        "No se encontró el ID del módulo solar. Intenta dimensionar de nuevo.",
      );
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
        <LoadingAnimation />
      </Box>
    );
  }

  return (
    <Box className="flex-1 p-4 bg-background-0">
      <Heading size="xl" className="mb-4">
        Mis Kits
      </Heading>

      {kits.length === 0 ? (
        <EmptyKitsView />
      ) : (
        <FlatList
          data={kits}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <KitCard
              item={item}
              components={kitComponentsMap.get(String(item._id))}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSizing={handleSizing}
              onAddInverter={(id) => console.log("Add Inverter for kit:", id)}
            />
          )}
        />
      )}

      <EditKitModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        kit={editingKit}
        onSave={handleSaveEdit}
      />

      <SizingModal
        isOpen={showSizingModal}
        onClose={() => setShowSizingModal(false)}
        isSizing={isSizing}
        sizingResults={sizingResults}
        selectedKitName={selectedKitName}
        selectedOptionIndex={selectedOptionIndex}
        onSelectOption={setSelectedOptionIndex}
        onConfirm={handleSelectModule}
      />
    </Box>
  );
}
