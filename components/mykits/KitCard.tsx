import { KitComponentCard } from "@/components/KitComponentCard";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Id } from "@/convex/_generated/dataModel";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Edit, Trash } from "lucide-react-native";
import React from "react";

const kitImage = require("@/assets/images/kitImage.webp");

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

  return (
    <Card size="md" variant="elevated" className="mb-4 p-0 overflow-hidden">
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
            className="bg-white/80 rounded-full"
            onPress={() => onEdit(item)}
          >
            <ButtonIcon as={Edit} className="text-secondary-600" />
          </Button>
          <Button
            size="xs"
            variant="solid"
            action="negative"
            className="bg-white/80 rounded-full"
            onPress={() => onDelete(item._id)}
          >
            <ButtonIcon as={Trash} className="text-negative-600" />
          </Button>
        </HStack>

        <Box className="absolute inset-0 items-center justify-center bg-black/30">
          <Heading size="lg" className="text-white text-center px-4 font-bold">
            {item.name}
          </Heading>
        </Box>
      </Box>

      <VStack space="md" className="p-4">
        <VStack space="xs">
          {item.capacity && (
            <HStack space="md">
              <Text size="sm" className="font-bold w-24">
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

        {hasSolarModule && (
          <Button className="mt-4" onPress={() => onAddInverter(item._id)}>
            <ButtonText>Añadir inversor</ButtonText>
          </Button>
        )}

        {/* If we have data, show the sizing button. If not, show the upload button. */}
        {item.monthlyConsumptionKwh ? (
          <Button
            className="mt-4"
            onPress={() => onSizing(item)}
            variant="solid"
            action="primary"
          >
            <ButtonText>Dimensionar Kit</ButtonText>
          </Button>
        ) : item.billStorageId ? (
          <Button className="mt-4" isDisabled={true}>
            <ButtonText>Procesando Factura...</ButtonText>
          </Button>
        ) : (
          <Link
            href={{
              pathname: "/(auth)/(tabs)/billupload",
              params: { kitId: item._id },
            }}
            asChild
          >
            <Button className="mt-4" variant="outline" action="primary">
              <ButtonText>Subir Factura para Dimensionar</ButtonText>
            </Button>
          </Link>
        )}
      </VStack>
    </Card>
  );
};
