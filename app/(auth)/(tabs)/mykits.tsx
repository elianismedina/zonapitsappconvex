import { LoadingAnimation } from "@/components/LoadingAnimation";
import { EditKitModal } from "@/components/mykits/EditKitModal";
import { EmptyKitsView } from "@/components/mykits/EmptyKitsView";
import { KitCard } from "@/components/mykits/KitCard";
import { Box, Heading } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList } from "react-native";

export default function GarageScreen() {
  const router = useRouter();
  const kits = useQuery(api.kits.getKits, {});
  const deleteKit = useMutation(api.kits.deleteKit);
  const updateKit = useMutation(api.kits.updateKit);
  const removeComponent = useMutation(api.kit_components.removeComponent);
  const updateQuantity = useMutation(api.kit_components.updateQuantity);
  const removeAllOfType = useMutation(api.kit_components.removeAllComponentsOfType);

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

  const handleRemoveComponent = async (componentId: Id<"kit_components">) => {
    try {
      await removeComponent({ id: componentId });
    } catch (error) {
      console.error("Error removing kit component:", error);
      Alert.alert("Error", "No se pudo eliminar el componente.");
    }
  };

  const handleUpdateQuantity = async (componentId: Id<"kit_components">, quantity: number) => {
    try {
      await updateQuantity({ id: componentId, quantity });
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "No se pudo actualizar la cantidad.");
    }
  };

  const handleRemoveAllOfType = async (kitId: Id<"kits">, type: any) => {
    try {
      await removeAllOfType({ kitId, type });
    } catch (error) {
      console.error("Error removing all components of type:", error);
      Alert.alert("Error", "No se pudo eliminar el grupo de componentes.");
    }
  };
  const handleRemoveInstallation = async (id: Id<"kits">) => {
    try {
      // Clear legacy field
      await updateKit({ id, laborCost: 0 });
      // Clear new component
      await removeAllOfType({ kitId: id, type: "installation" });
    } catch (error) {
      console.error("Error resetting labor cost:", error);
      Alert.alert("Error", "No se pudo eliminar la mano de obra.");
    }
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

  const handleSizing = (kit: any) => {
    if (!kit.monthlyConsumptionKwh) {
      Alert.alert(
        "Datos incompletos",
        "Primero debes adjuntar una factura para este kit para poder dimensionar el sistema.",
      );
      return;
    }
    router.push({
      pathname: "/(auth)/panel-selection/[kitId]",
      params: { kitId: kit._id },
    });
  };

  if (kits === undefined) {
    return (
      <Box className="flex-1 items-center justify-center">
        <LoadingAnimation />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0 p-4">
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
              onAddInverter={(id) => {
                router.push({
                  pathname: "/(auth)/inverter-selection/[kitId]",
                  params: { kitId: id },
                });
              }}
              onAddBattery={(id) => {
                router.push({
                  pathname: "/(auth)/battery-selection/[kitId]",
                  params: { kitId: id },
                });
              }}
              onAddStructure={(id) => {
                router.push({
                  pathname: "/(auth)/structure-selection/[kitId]",
                  params: { kitId: id },
                });
              }}
              onAddWiring={(id) => {
                router.push({
                  pathname: "/(auth)/wiring-selection/[kitId]",
                  params: { kitId: id },
                });
              }}
              onAddProtection={(id) => {
                router.push({
                  pathname: "/(auth)/protection-selection/[kitId]",
                  params: { kitId: id },
                });
              }}
              onAddInstallation={(id) => {
                router.push({
                  pathname: "/(auth)/installation-selection/[kitId]",
                  params: { kitId: id },
                });
              }}
              onRemoveInstallation={handleRemoveInstallation}
              onRemoveComponent={handleRemoveComponent}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveAllOfType={handleRemoveAllOfType}
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
    </Box>
  );
}
