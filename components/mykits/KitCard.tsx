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
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Edit,
  FileText,
  Hammer as HammerIcon,
  Sun,
  Trash,
  Zap,
} from "lucide-react-native";
import React, { useEffect } from "react";
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

interface KitCardProps {
  item: any;
  components: any[] | undefined;
  onEdit: (item: any) => void;
  onDelete: (id: Id<"kits">) => void;
  onSizing: (item: any) => void;
  onAddInverter: (id: Id<"kits">) => void;
}

export const KitCard = ({
  item,
  components,
  onEdit,
  onDelete,
  onSizing,
  onAddInverter,
}: KitCardProps) => {
  const hasSolarModule = components
    ? components.some((comp) => comp.type === "solar_module")
    : false;
  const hasInverter = components
    ? components.some((comp) => comp.type === "inverter")
    : false;

  // Determine which step should pulse
  const isStep0Next =
    !hasSolarModule && !(item.billStorageId && !item.monthlyConsumptionKwh);
  const isStep1Next = hasSolarModule && !hasInverter;

  return (
    <Card size="md" variant="elevated" className="mb-4 overflow-hidden p-0">
      <Box className="relative">
        <Image
          source={kitImage}
          style={{ width: "100%", height: 200 }}
          contentFit="cover"
          transition={300}
        />
        <HStack space="sm" className="absolute top-3 right-3 z-10">
          <Button
            size="xs"
            variant="solid"
            action="secondary"
            className="rounded-full bg-white/80"
            onPress={() => onEdit(item)}
          >
            <ButtonIcon as={Edit} className="text-secondary-600" />
          </Button>
          <Button
            size="xs"
            variant="solid"
            action="negative"
            className="rounded-full bg-white/80"
            onPress={() => onDelete(item._id)}
          >
            <ButtonIcon as={Trash} className="text-negative-600" />
          </Button>
        </HStack>

        <Box className="absolute inset-0 items-center justify-center bg-black/30">
          <Heading size="lg" className="px-4 text-center font-bold text-white">
            {item.name}
          </Heading>
        </Box>
      </Box>

      <VStack space="md" className="p-4">
        <VStack space="xs">
          {item.capacity && (
            <HStack space="md">
              <Text size="sm" className="w-24 font-bold">
                Capacidad:
              </Text>
              <Text size="sm">{item.capacity} kWp</Text>
            </HStack>
          )}
        </VStack>

        {/* Display kit components */}
        {components?.map((component: any) => (
          <Box key={component._id} className="mt-2">
            <KitComponentCard
              type={component.type}
              brand={component.details?.brand}
              model={component.details?.model}
              quantity={component.quantity}
              pmax={component.details?.pmax}
              price={component.details?.price}
              power={component.details?.power}
              capacity={component.details?.capacity}
              imageUrl={component.details?.imageUrl}
            />
          </Box>
        ))}

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
          <Pressable
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl border border-outline-100 bg-white p-4 opacity-50`}
          >
            <VStack space="xs" className="items-center">
              <Box className="rounded-full bg-background-50 p-3">
                <Battery size={24} color="#64748b" />
              </Box>
              <Text
                size="xs"
                className="text-center font-bold text-typography-500"
              >
                Baterías
              </Text>
            </VStack>
          </Pressable>

          {/* Step 4: Estructura */}
          <Pressable
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl border border-outline-100 bg-white p-4 opacity-50`}
          >
            <VStack space="xs" className="items-center">
              <Box className="rounded-full bg-background-50 p-3">
                <HammerIcon size={24} color="#64748b" />
              </Box>
              <Text
                size="xs"
                className="text-center font-bold text-typography-500"
              >
                Estructura
              </Text>
            </VStack>
          </Pressable>

          {/* Step 5: Instalación */}
          <Pressable
            className={`mb-4 aspect-square w-[48%] items-center justify-center rounded-2xl border border-outline-100 bg-white p-4 opacity-50`}
          >
            <VStack space="xs" className="items-center">
              <Box className="rounded-full bg-background-50 p-3">
                <CalendarDays size={24} color="#64748b" />
              </Box>
              <Text
                size="xs"
                className="text-center font-bold text-typography-500"
              >
                Instalación
              </Text>
            </VStack>
          </Pressable>

          {/* Step 6: Financiación */}
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
