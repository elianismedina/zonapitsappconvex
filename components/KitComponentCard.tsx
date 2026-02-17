import {
  Box,
  Card,
  Heading,
  HStack,
  Text,
  VStack,
} from "@/components/ui";
import { Image } from "expo-image";
import { Sun, Zap, Battery, Hammer, Cable as CableIcon, ShieldCheck } from "lucide-react-native"; // X icon removed

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
  // onRemove prop removed
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
  // onRemove removed from destructuring
}: KitComponentCardProps) {
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
    <Card variant="elevated" className="p-0 overflow-hidden border-outline-100 bg-white shadow-soft-1">
      <HStack className="items-stretch relative">
        {/* Image Section */}
        <Box className="w-32 h-32 bg-background-50 items-center justify-center border-r border-outline-50">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <Box className="p-3 rounded-full bg-white shadow-sm">
              {getIcon()}
            </Box>
          )}
        </Box>

        {/* Info Section */}
        <VStack className="flex-1 p-3" space="xs">
          {/* onRemove button removed */}
          <HStack className="justify-between items-start">
            <VStack className="flex-1">
              <Text size="xs" className="text-typography-500 font-medium uppercase tracking-wider">
                {getTypeLabel()}
              </Text>
              <Heading size="xs" className="text-typography-900 mt-0.5" numberOfLines={1}>
                {brand && model ? `${brand} ${model}` : "Sin detalle"}
              </Heading>
            </VStack>
            <Box className="bg-primary-50 px-2 py-1 rounded-md">
              <Text size="xs" className="text-primary-600 font-bold">
                x{quantity}
              </Text>
            </Box>
          </HStack>

          <HStack className="flex-wrap items-center mt-1" space="sm">
            {pmax && (
              <Box className="bg-background-50 px-2 py-0.5 rounded border border-outline-100">
                <Text size="xs" className="text-typography-700">{pmax} Wp</Text>
              </Box>
            )}
            {power && (
              <Box className="bg-background-50 px-2 py-0.5 rounded border border-outline-100">
                <Text size="xs" className="text-typography-700">{power} W</Text>
              </Box>
            )}
            {capacity && (
              <Box className="bg-background-50 px-2 py-0.5 rounded border border-outline-100">
                <Text size="xs" className="text-typography-700">{capacity} kWh</Text>
              </Box>
            )}
          </HStack>

          {price && (
            <VStack className="mt-2 pt-2 border-t border-outline-50">
              <HStack className="justify-between items-center">
                <Text size="xs" className="text-typography-500">Precio unitario</Text>
                <Text size="sm" className="text-typography-900 font-semibold">
                  ${price.toLocaleString()}
                </Text>
              </HStack>
              <HStack className="justify-between items-center mt-1">
                <Text size="sm" className="text-typography-700 font-medium">Subtotal</Text>
                <Text size="md" className="text-primary-600 font-bold">
                  ${(price * quantity).toLocaleString()}
                </Text>
              </HStack>
            </VStack>
          )}
        </VStack>
      </HStack>
    </Card>
  );
}