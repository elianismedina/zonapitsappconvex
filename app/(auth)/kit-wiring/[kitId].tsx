import {
  Box,
  Card,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Cable } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView } from "react-native";

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function KitWiringScreen() {
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();
  const { push } = useRouter();
  const components = useQuery(api.kit_components.getKitComponents, { kitId });

  const wiringComponents = components?.filter((c) => c.type === "wiring");

  const total = wiringComponents?.reduce((acc, comp) => {
    const pricePerMeter = (comp.details as any)?.pricePerMeter ?? 0;
    return acc + pricePerMeter * comp.quantity;
  }, 0);

  if (components === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (!wiringComponents || wiringComponents.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No hay cableado agregado a este kit.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Cableado del Kit",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <VStack space="md" className="p-4">
          {wiringComponents.map((comp) => {
            const details = comp.details as any;
            if (!details) return null;
            const subtotal = details.pricePerMeter * comp.quantity;

            return (
              <Pressable
                key={comp._id}
                onPress={() =>
                  push({
                    pathname: "/(auth)/wiring-details/[wiringId]",
                    params: { wiringId: comp.wiringId as string },
                  })
                }
                className="active:opacity-80"
              >
                <Card variant="elevated" className="overflow-hidden p-0 shadow-soft-1">
                  <HStack className="items-stretch">
                    <Box className="h-24 w-24 items-center justify-center border-r border-outline-50 bg-background-50">
                      {details.imageUrl ? (
                        <Image
                          source={{ uri: details.imageUrl }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="contain"
                        />
                      ) : (
                        <Box className="rounded-full bg-white p-3 shadow-sm">
                          <Cable size={20} color="#F97316" />
                        </Box>
                      )}
                    </Box>

                    <VStack className="flex-1 justify-center p-3" space="xs">
                      <Text className="font-bold text-typography-900">
                        {details.name}
                      </Text>
                      <Text size="xs" className="text-typography-500">
                        {details.type}
                      </Text>
                      {details.brand && (
                        <Text size="xs" className="text-typography-400">
                          {details.brand}
                        </Text>
                      )}
                      <HStack className="mt-1 items-center justify-between">
                        <Text size="xs" className="text-typography-500">
                          {comp.quantity} m × $ {fmt(details.pricePerMeter)}/m
                        </Text>
                        <Text size="sm" className="font-bold text-success-700">
                          $ {fmt(subtotal)}
                        </Text>
                      </HStack>
                    </VStack>

                    <Box className="items-center justify-center pr-3">
                      <ChevronRight size={16} color="#94a3b8" />
                    </Box>
                  </HStack>
                </Card>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>

      <Box className="absolute bottom-0 left-0 right-0 border-t border-outline-100 bg-white p-4 pb-8">
        <HStack className="items-center justify-between">
          <VStack space="xs">
            <Text size="sm" className="text-typography-500">
              Total cableado ({wiringComponents.length}{" "}
              {wiringComponents.length === 1 ? "tipo" : "tipos"})
            </Text>
            <Text size="xs" className="text-typography-400">
              {wiringComponents.reduce((acc, c) => acc + c.quantity, 0)} metros
              en total
            </Text>
          </VStack>
          <Text size="xl" className="font-bold text-success-700">
            $ {fmt(total ?? 0)}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
