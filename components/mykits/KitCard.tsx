import { KitComponentCard } from "@/components/KitComponentCard";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Id } from "@/convex/_generated/dataModel";
import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  Battery,
  Cable,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Edit,
  FileText,
  Hammer as HammerIcon,
  Shield,
  Sun,
  Trash,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const kitImage = require("@/assets/images/kitImage.webp");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PulsingNextStep = ({
  children,
  active,
  ...props
}: {
  children: React.ReactNode;
  active: boolean;
  [key: string]: any;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(1);
    }
  }, [active, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: active ? "#0ea5e9" : "#e5e5e5",
    borderWidth: active ? 2 : 1,
  }));

  return (
    <AnimatedPressable {...props} style={[props.style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
};

export interface KitCardProps {
  item: any;
  components: any[] | undefined;
  onEdit: (item: any) => void;
  onDelete: (id: Id<"kits">) => void;
  onSizing: (item: any) => void;
  onAddInverter: (id: Id<"kits">) => void;
  onAddBattery: (id: Id<"kits">) => void;
  onAddStructure: (id: Id<"kits">) => void;
  onAddWiring: (id: Id<"kits">) => void;
  onAddProtection: (id: Id<"kits">) => void;
  onRemoveComponent: (componentId: Id<"kit_components">) => void;
  onUpdateQuantity: (componentId: Id<"kit_components">, quantity: number) => void;
  onRemoveAllOfType: (kitId: Id<"kits">, type: any) => void;
  onAddInstallation: (id: Id<"kits">) => void;
  onRemoveInstallation: (id: Id<"kits">) => void;
}

export const KitCard = ({
  item,
  components,
  onEdit,
  onDelete,
  onSizing,
  onAddInverter,
  onAddBattery,
  onAddStructure,
  onAddWiring,
  onAddProtection,
  onRemoveComponent,
  onUpdateQuantity,
  onRemoveAllOfType,
  onAddInstallation,
  onRemoveInstallation,
}: KitCardProps) => {
  const hasSolarModule = components
    ? components.some((comp) => comp.type === "solar_module")
    : false;
  const hasInverter = components
    ? components.some((comp) => comp.type === "inverter")
    : false;
  const hasBattery = components
    ? components.some((comp) => comp.type === "battery")
    : false;
  const hasStructure = components
    ? components.some((comp) => comp.type === "structure")
    : false;
  const hasWiring = components
    ? components.some((comp) => comp.type === "wiring")
    : false;
  const hasProtection = components
    ? components.some((comp) => comp.type === "protection")
    : false;

  // Determine which step should pulse
  const isStep0Next =
    !hasSolarModule && !(item.billStorageId && !item.monthlyConsumptionKwh);
  const isStep1Next = hasSolarModule && !hasInverter;
  const isStep2Next = hasInverter && !hasBattery;
  const isStep3Next = hasSolarModule && !hasStructure;
  const isStep4Next = hasSolarModule && !hasWiring;
  const isStep5Next = hasSolarModule && hasWiring && !hasProtection;
  const isInstallationNext = hasSolarModule && hasInverter && hasStructure && hasWiring && hasProtection && !item.laborCost;

  const totalInvestment = useMemo(() => {
    if (!components) return item.laborCost || 0;
    const componentTotal = components.reduce((acc, comp) => {
      const details = comp.details as any;
      if (!details) return acc;

      const unitPrice =
        details.price ?? details.pricePerUnit ?? details.pricePerMeter ?? 0;
      const quantity = comp.quantity ?? 0;

      return acc + unitPrice * quantity;
    }, 0);
    return Math.round(componentTotal + (item.laborCost || 0));
  }, [components, item.laborCost]);

  const { displayComponents, structureSummary, wiringSummary, protectionSummary } = useMemo(() => {
    if (!components) {
      return { displayComponents: [], structureSummary: null, wiringSummary: null, protectionSummary: null };
    }

    const nonStructureWiringOrProtection = components.filter(
      (comp) => comp.type !== "structure" && comp.type !== "wiring" && comp.type !== "protection",
    );
    const structureComponents = components.filter(
      (comp) => comp.type === "structure",
    );
    const wiringComponents = components.filter(
      (comp) => comp.type === "wiring",
    );
    const protectionComponents = components.filter(
      (comp) => comp.type === "protection",
    );

    const structureSummary =
      structureComponents.length === 0
        ? null
        : structureComponents.reduce(
      (acc, comp) => {
        const details = comp.details as any;
        if (!details) return acc;

        const unitPrice = details.pricePerUnit ?? 0;
        const quantity = comp.quantity ?? 0;

        acc.quantity += quantity;
        acc.subtotal += unitPrice * quantity;
        // Optionally use the first available image
        if (!acc.imageUrl) {
          acc.imageUrl = details.imageUrl || details.image || details.imageURL;
        }
        return acc;
      },
      { quantity: 0, subtotal: 0, imageUrl: undefined as string | undefined },
    );

    const wiringSummary =
      wiringComponents.length === 0
        ? null
        : wiringComponents.reduce(
      (acc, comp) => {
        const details = comp.details as any;
        if (!details) return acc;

        const unitPrice = details.pricePerMeter ?? 0;
        const quantity = comp.quantity ?? 0;

        acc.quantity += quantity;
        acc.subtotal += unitPrice * quantity;
        // Optionally use the first available image
        if (!acc.imageUrl) {
          acc.imageUrl = details.imageUrl || details.image || details.imageURL;
        }
        return acc;
      },
      { quantity: 0, subtotal: 0, imageUrl: undefined as string | undefined },
    );

    const protectionSummary =
      protectionComponents.length === 0
        ? null
        : protectionComponents.reduce(
      (acc, comp) => {
        const details = comp.details as any;
        if (!details) return acc;

        const unitPrice = details.price ?? 0;
        const quantity = comp.quantity ?? 0;

        acc.quantity += quantity;
        acc.subtotal += unitPrice * quantity;
        // Optionally use the first available image
        if (!acc.imageUrl) {
          acc.imageUrl = details.imageUrl || details.image || details.imageURL;
        }
        return acc;
      },
      { quantity: 0, subtotal: 0, imageUrl: undefined as string | undefined },
    );

    return {
      displayComponents: nonStructureWiringOrProtection,
      structureSummary,
      wiringSummary,
      protectionSummary,
    };
  }, [components]);

  return (
    <Card size="md" variant="elevated" className="mb-4 overflow-hidden p-0">
      <Box className="relative">
        <Image
          source={kitImage}
          style={{ width: "100%", height: 200 }}
          contentFit="cover"
          transition={300}
        />
        {/* Actions - Now on the top-left */}
        <HStack space="sm" className="absolute top-3 left-3 z-10">
          <Button
            size="xs"
            variant="solid"
            action="secondary"
            className="rounded-full bg-white/90"
            onPress={() => onEdit(item)}
          >
            <ButtonIcon as={Edit} className="text-secondary-600" />
          </Button>
          <Button
            size="xs"
            variant="solid"
            action="negative"
            className="rounded-full bg-white/90"
            onPress={() => onDelete(item._id)}
          >
            <ButtonIcon as={Trash} className="text-negative-600" />
          </Button>
        </HStack>

        {/* Total Price - Now on the top-right */}
        <Box className="absolute top-3 right-3 z-10 rounded-full bg-white/95 px-3 py-1.5 shadow-soft-2">
          <HStack space="xs" className="items-center">
            <CircleDollarSign size={14} className="text-primary-600" />
            <Text className="text-sm font-bold text-primary-700">
              ${" "}
              {totalInvestment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </Text>
          </HStack>
        </Box>
      </Box>

      <VStack space="md" className="p-4">
        <VStack space="xs">
          <Heading size="md" className="font-bold text-typography-900">
            {item.name}
          </Heading>
          {item.capacity && (
            <HStack space="xs" className="items-center">
              <Text
                size="xs"
                className="font-bold text-typography-500 uppercase"
              >
                Capacidad:
              </Text>
              <Text size="xs" className="font-medium text-typography-700">
                {item.capacity} kWp
              </Text>
            </HStack>
          )}
        </VStack>

        {/* Display kit components */}
        {displayComponents.map((component: any) => (
          <Box key={component._id} className="mt-2">
            <KitComponentCard
              type={component.type}
              brand={component.details?.brand}
              model={component.details?.model}
              name={component.details?.name}
              quantity={component.quantity}
              pmax={component.details?.pmax}
              price={component.details?.price ?? component.details?.pricePerUnit ?? component.details?.pricePerMeter}
              power={component.details?.power}
              capacity={component.details?.capacity}
              imageUrl={component.details?.imageUrl || component.details?.image || component.details?.imageURL || (component as any).imageUrl}
              solarModuleId={component.solarModuleId}
              inverterId={component.inverterId}
              batteryId={component.batteryId}
              structureId={component.structureId}
              wiringId={component.wiringId}
              protectionId={component.protectionId}
              componentId={component._id}
              onRemove={onRemoveComponent}
              onUpdateQuantity={onUpdateQuantity}
            />
          </Box>
        ))}
        {structureSummary && (
          <Box className="mt-2">
            <KitComponentCard
              type="structure"
              name="Estructura (varios)"
              quantity={structureSummary.quantity}
              subtotalOverride={structureSummary.subtotal}
              imageUrl={structureSummary.imageUrl}
              componentId={item._id as any}
              onRemove={() => onRemoveAllOfType(item._id, "structure")}
            />
          </Box>
        )}
        {wiringSummary && (
          <Box className="mt-2">
            <KitComponentCard
              type="wiring"
              name="Cableado (varios)"
              quantity={wiringSummary.quantity}
              subtotalOverride={wiringSummary.subtotal}
              imageUrl={wiringSummary.imageUrl}
              componentId={item._id as any}
              onRemove={() => onRemoveAllOfType(item._id, "wiring")}
            />
          </Box>
        )}
        {protectionSummary && (
          <Box className="mt-2">
            <KitComponentCard
              type="protection"
              name="Protecciones (varios)"
              quantity={protectionSummary.quantity}
              subtotalOverride={protectionSummary.subtotal}
              imageUrl={protectionSummary.imageUrl}
              componentId={item._id as any}
              onRemove={() => onRemoveAllOfType(item._id, "protection")}
            />
          </Box>
        )}
        {item.laborCost > 0 && (
          <Box className="mt-2">
            <KitComponentCard
              type="installation"
              name="Mano de Obra / Instalación"
              quantity={1}
              subtotalOverride={item.laborCost}
              componentId={item._id as any}
              onRemove={() => onRemoveInstallation(item._id)}
            />
          </Box>
        )}

        {/* Grid of Steps */}
        <Box className="mt-4 flex-row flex-wrap justify-between">
          {/* Step 1: Paneles / Factura */}
          {!item.monthlyConsumptionKwh && !item.billStorageId ? (
            <Link
              href={{
                pathname: "/(auth)/(tabs)/billupload",
                params: { kitId: item._id },
              }}
              asChild
            >
              <PulsingNextStep
                active={isStep0Next}
                className="mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl bg-white p-4"
              >
                <VStack space="xs" className="items-center">
                  <Box className="rounded-full bg-background-50 p-3">
                    <FileText size={24} color="#64748b" />
                  </Box>
                  <Text
                    size="xs"
                    className="text-center font-bold text-typography-500"
                  >
                    Subir Factura
                  </Text>
                </VStack>
              </PulsingNextStep>
            </Link>
          ) : (
            <PulsingNextStep
              active={isStep0Next}
              onPress={() => onSizing(item)}
              disabled={!!item.billStorageId && !item.monthlyConsumptionKwh}
              className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl p-4 ${
                hasSolarModule ? "bg-success-50" : "bg-white"
              }`}
            >
              <VStack space="xs" className="items-center">
                <Box
                  className={`rounded-full p-3 ${
                    hasSolarModule ? "bg-success-100" : "bg-background-50"
                  }`}
                >
                  <Sun
                    size={24}
                    color={hasSolarModule ? "#16a34a" : "#64748b"}
                  />
                </Box>
                <Text
                  size="xs"
                  className={`text-center font-bold ${
                    hasSolarModule ? "text-success-700" : "text-typography-500"
                  }`}
                >
                  {item.billStorageId && !item.monthlyConsumptionKwh
                    ? "Procesando..."
                    : "Paneles"}
                </Text>
                {hasSolarModule && (
                  <Box className="absolute -top-1 -right-1">
                    <CheckCircle2 size={16} color="#16a34a" />
                  </Box>
                )}
              </VStack>
            </PulsingNextStep>
          )}

          {/* Step 2: Inversor */}
          <PulsingNextStep
            active={isStep1Next}
            onPress={() => onAddInverter(item._id)}
            disabled={!hasSolarModule}
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl p-4 ${
              hasInverter ? "bg-success-50" : "bg-white"
            } ${!hasSolarModule ? "opacity-50" : ""}`}
          >
            <VStack space="xs" className="items-center">
              <Box
                className={`rounded-full p-3 ${
                  hasInverter ? "bg-success-100" : "bg-background-50"
                }`}
              >
                <Zap size={24} color={hasInverter ? "#16a34a" : "#64748b"} />
              </Box>
              <Text
                size="xs"
                className={`text-center font-bold ${
                  hasInverter ? "text-success-700" : "text-typography-500"
                }`}
              >
                Inversor
              </Text>
              {hasInverter && (
                <Box className="absolute -top-1 -right-1">
                  <CheckCircle2 size={16} color="#16a34a" />
                </Box>
              )}
            </VStack>
          </PulsingNextStep>

          {/* Step 3: Baterías */}
          <PulsingNextStep
            active={isStep2Next}
            onPress={() => onAddBattery(item._id)}
            disabled={!hasInverter}
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl p-4 ${
              hasBattery ? "bg-success-50" : "bg-white"
            } ${!hasInverter ? "opacity-50" : ""}`}
          >
            <VStack space="xs" className="items-center">
              <Box
                className={`rounded-full p-3 ${
                  hasBattery ? "bg-success-100" : "bg-background-50"
                }`}
              >
                <Battery size={24} color={hasBattery ? "#16a34a" : "#64748b"} />
              </Box>
              <Text
                size="xs"
                className={`text-center font-bold ${
                  hasBattery ? "text-success-700" : "text-typography-500"
                }`}
              >
                Baterías
              </Text>
              {hasBattery && (
                <Box className="absolute -top-1 -right-1">
                  <CheckCircle2 size={16} color="#16a34a" />
                </Box>
              )}
            </VStack>
          </PulsingNextStep>

          {/* Step 4: Estructura */}
          <PulsingNextStep
            active={isStep3Next}
            onPress={() => onAddStructure(item._id)}
            disabled={!hasSolarModule}
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl p-4 ${
              hasStructure ? "bg-success-50" : "bg-white"
            } ${!hasSolarModule ? "opacity-50" : ""}`}
          >
            <VStack space="xs" className="items-center">
              <Box
                className={`rounded-full p-3 ${
                  hasStructure ? "bg-success-100" : "bg-background-50"
                }`}
              >
                <HammerIcon
                  size={24}
                  color={hasStructure ? "#16a34a" : "#64748b"}
                />
              </Box>
              <Text
                size="xs"
                className={`text-center font-bold ${
                  hasStructure ? "text-success-700" : "text-typography-500"
                }`}
              >
                Estructura
              </Text>
              {hasStructure && (
                <Box className="absolute -top-1 -right-1">
                  <CheckCircle2 size={16} color="#16a34a" />
                </Box>
              )}
            </VStack>
          </PulsingNextStep>

          {/* Step 5: Cableado */}
          <PulsingNextStep
            active={isStep4Next}
            onPress={() => onAddWiring(item._id)}
            disabled={!hasSolarModule}
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl p-4 ${
              hasWiring ? "bg-success-50" : "bg-white"
            } ${!hasSolarModule ? "opacity-50" : ""}`}
          >
            <VStack space="xs" className="items-center">
              <Box
                className={`rounded-full p-3 ${
                  hasWiring ? "bg-success-100" : "bg-background-50"
                }`}
              >
                <Cable size={24} color={hasWiring ? "#16a34a" : "#64748b"} />
              </Box>
              <Text
                size="xs"
                className={`text-center font-bold ${
                  hasWiring ? "text-success-700" : "text-typography-500"
                }`}
              >
                Cableado
              </Text>
              {hasWiring && (
                <Box className="absolute -top-1 -right-1">
                  <CheckCircle2 size={16} color="#16a34a" />
                </Box>
              )}
            </VStack>
          </PulsingNextStep>

          {/* Step 6: Protecciones */}
          <PulsingNextStep
            active={isStep5Next}
            onPress={() => onAddProtection(item._id)}
            disabled={!hasSolarModule}
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl p-4 ${
              hasProtection ? "bg-success-50" : "bg-white"
            } ${!hasSolarModule ? "opacity-50" : ""}`}
          >
            <VStack space="xs" className="items-center">
              <Box
                className={`rounded-full p-3 ${
                  hasProtection ? "bg-success-100" : "bg-background-50"
                }`}
              >
                <Shield
                  size={24}
                  color={hasProtection ? "#16a34a" : "#64748b"}
                />
              </Box>
              <Text
                size="xs"
                className={`text-center font-bold ${
                  hasProtection ? "text-success-700" : "text-typography-500"
                }`}
              >
                Protecciones
              </Text>
              {hasProtection && (
                <Box className="absolute -top-1 -right-1">
                  <CheckCircle2 size={16} color="#16a34a" />
                </Box>
              )}
            </VStack>
          </PulsingNextStep>

          {/* Step 7: Instalación */}
          <PulsingNextStep
            active={isInstallationNext}
            onPress={() => onAddInstallation(item._id)}
            disabled={!hasSolarModule}
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl p-4 ${
              item.laborCost ? "bg-success-50" : "bg-white"
            } ${!hasSolarModule ? "opacity-50" : ""}`}
          >
            <VStack space="xs" className="items-center">
              <Box
                className={`rounded-full p-3 ${
                  item.laborCost ? "bg-success-100" : "bg-background-50"
                }`}
              >
                <CalendarDays
                  size={24}
                  color={item.laborCost ? "#16a34a" : "#64748b"}
                />
              </Box>
              <Text
                size="xs"
                className={`text-center font-bold ${
                  item.laborCost ? "text-success-700" : "text-typography-500"
                }`}
              >
                Instalación
              </Text>
              {item.laborCost > 0 && (
                <Box className="absolute -top-1 -right-1">
                  <CheckCircle2 size={16} color="#16a34a" />
                </Box>
              )}
            </VStack>
          </PulsingNextStep>

          {/* Step 8: Financiación */}
          <Pressable
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl border border-outline-100 bg-white p-4 opacity-50`}
          >
            <VStack space="xs" className="items-center">
              <Box className="rounded-full bg-background-50 p-3">
                <CircleDollarSign size={24} color="#64748b" />
              </Box>
              <Text
                size="xs"
                className="text-center font-bold text-typography-500"
              >
                Financiación
              </Text>
            </VStack>
          </Pressable>
        </Box>
      </VStack>
    </Card>
  );
};
