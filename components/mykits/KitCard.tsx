import { KitComponentCard } from "@/components/KitComponentCard";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Id } from "@/convex/_generated/dataModel";
import { Edit, Trash } from "lucide-react-native";
import React from "react";

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
    <Card size="md" variant="elevated" className="mb-4 p-4">
      <VStack space="md">
        <HStack className="justify-between items-center">
          <HStack space="sm" className="items-center flex-1">
            <Heading size="md" className="flex-shrink-0">
              {item.name}
            </Heading>
          </HStack>
          <HStack space="sm">
            <Button
              size="xs"
              variant="outline"
              action="secondary"
              onPress={() => onEdit(item)}
            >
              <ButtonIcon as={Edit} />
            </Button>
            <Button
              size="xs"
              variant="outline"
              action="negative"
              onPress={() => onDelete(item._id)}
            >
              <ButtonIcon as={Trash} />
            </Button>
          </HStack>
        </HStack>

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

        {(!components || components.length === 0) && !item.billStorageId && (
          <Text size="xs" className="text-typography-400 italic mt-2">
            Sin componentes añadidos aún.
          </Text>
        )}

        {hasSolarModule && (
          <Button className="mt-4" onPress={() => onAddInverter(item._id)}>
            <ButtonText>Añadir inversor</ButtonText>
          </Button>
        )}

        {item.billStorageId && (
          <Button
            className="mt-4"
            onPress={() => onSizing(item)}
            isDisabled={!item.monthlyConsumptionKwh}
          >
            <ButtonText>Dimensionar Kit</ButtonText>
          </Button>
        )}
      </VStack>
    </Card>
  );
};
