import {
  Box,
  Card,
  HStack,
  Heading,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { Id } from "@/convex/_generated/dataModel";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Battery,
  Cable as CableIcon,
  Hammer,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react-native";
import { useState } from "react";

export interface KitComponentCardProps {
  type: string;
  brand?: string;
  model?: string;
  quantity: number;
  pmax?: number; // for solar modules
  price?: number;
  power?: number; // for inverters
  capacity?: number; // for batteries
  imageUrl?: string;
  // Component IDs for navigation
  solarModuleId?: string;
  inverterId?: string;
  batteryId?: string;
  structureId?: string;
  cableId?: string;
  protectionId?: string;
  componentId: Id<"kit_components">;
  onRemove?: (componentId: Id<"kit_components">) => void;
}

export function KitComponentCard({
  type,
  brand,
  model,
  quantity,
  pmax,
  price,
  power,
  capacity,
  imageUrl,
  solarModuleId,
  inverterId,
  batteryId,
  structureId,
  cableId,
  protectionId,
}: KitComponentCardProps) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const canViewDetails =
    (type === "solar_module" && solarModuleId) ||
    (type === "inverter" && inverterId) ||
    (type === "battery" && batteryId);

  const handleViewDetails = () => {
    // Determine destination based on component type
    switch (type) {
      case "solar_module":
        if (solarModuleId) {
          router.push({
            pathname: "/(auth)/panel-details/[panelId]",
            params: { panelId: solarModuleId },
          });
        }
        break;
      case "inverter":
        if (inverterId) {
          router.push({
            pathname: "/(auth)/inverter-details/[inverterId]",
            params: { inverterId },
          });
        }
        break;
      case "battery":
        if (batteryId) {
          router.push({
            pathname: "/(auth)/battery-details/[batteryId]",
            params: { batteryId },
          });
        }
        break;
      default:
        // No detail screen for other types yet
        break;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "solar_module":
        return <Sun size={18} color="#EAB308" />;
      case "inverter":
        return <Zap size={18} color="#3B82F6" />;
      case "battery":
        return <Battery size={18} color="#22C55E" />;
      case "structure":
        return <Hammer size={18} color="#64748B" />;
      case "cable":
        return <CableIcon size={18} color="#F97316" />;
      case "protection":
        return <ShieldCheck size={18} color="#EF4444" />;
      default:
        return <Sun size={18} color="#6B7280" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "solar_module":
        return "Paneles Solares";
      case "inverter":
        return "Inversor";
      case "battery":
        return "Batería";
      case "structure":
        return "Estructura";
      case "cable":
        return "Cables";
      case "protection":
        return "Protecciones";
      default:
        return type;
    }
  };

  return (
    <Pressable
      onPress={canViewDetails ? handleViewDetails : undefined}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={canViewDetails ? "active:opacity-80" : ""}
    >
      <Card
        variant="elevated"
        className={`overflow-hidden border-outline-100 bg-white p-0 shadow-soft-1 ${
          canViewDetails
            ? isPressed
              ? "border-primary-300"
              : "border-outline-100"
            : ""
        }`}
      >
        <HStack className="relative items-stretch">
          {/* Image Section */}
          <Box className="h-32 w-32 items-center justify-center border-r border-outline-50 bg-background-50">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <Box className="rounded-full bg-white p-3 shadow-sm">
                {getIcon()}
              </Box>
            )}
          </Box>

          {/* Info Section */}
          <VStack className="flex-1 p-3" space="xs">
            {/* onRemove button removed */}
            <HStack className="items-start justify-between">
              <VStack className="flex-1">
                <Text
                  size="xs"
                  className="font-medium tracking-wider text-typography-500 uppercase"
                >
                  {getTypeLabel()}
                </Text>
                <Heading
                  size="xs"
                  className="mt-0.5 text-typography-900"
                  numberOfLines={1}
                >
                  {brand && model ? `${brand} ${model}` : "Sin detalle"}
                </Heading>
              </VStack>
              <Box className="rounded-md bg-primary-50 px-2 py-1">
                <Text size="xs" className="font-bold text-primary-600">
                  x{quantity}
                </Text>
              </Box>
            </HStack>

            <HStack className="mt-1 flex-wrap items-center" space="sm">
              {pmax && (
                <Box className="rounded border border-outline-100 bg-background-50 px-2 py-0.5">
                  <Text size="xs" className="text-typography-700">
                    {pmax} Wp
                  </Text>
                </Box>
              )}
              {power && (
                <Box className="rounded border border-outline-100 bg-background-50 px-2 py-0.5">
                  <Text size="xs" className="text-typography-700">
                    {power} W
                  </Text>
                </Box>
              )}
              {capacity && (
                <Box className="rounded border border-outline-100 bg-background-50 px-2 py-0.5">
                  <Text size="xs" className="text-typography-700">
                    {capacity} kWh
                  </Text>
                </Box>
              )}
            </HStack>

            {price && (
              <VStack className="mt-2 border-t border-outline-50 pt-2">
                <HStack className="items-center justify-between">
                  <Text size="xs" className="text-typography-500">
                    Precio unitario
                  </Text>
                  <Text size="sm" className="font-semibold text-typography-900">
                    $ {price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </Text>
                </HStack>
                <HStack className="mt-1 items-center justify-between">
                  <Text size="sm" className="font-medium text-typography-700">
                    Subtotal
                  </Text>
                  <Text size="md" className="font-bold text-primary-600">
                    ${" "}
                    {(price * quantity)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </Text>
                </HStack>
              </VStack>
            )}
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}
