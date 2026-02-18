import React from "react";
import {
  Box,
  Card,
  Heading,
  HStack,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { ChevronRight, LucideIcon } from "lucide-react-native";

interface KitTypeCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onPress: (id: string) => void;
}

export const KitTypeCard = ({
  id,
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  onPress,
}: KitTypeCardProps) => {
  return (
    <Pressable
      onPress={() => onPress(id)}
      className="active:opacity-80"
    >
      <Card variant="outline" className="p-4 border-outline-200">
        <HStack space="lg" className="items-center">
          <Box className={`p-3 rounded-full ${bgColor}`}>
            <Icon size={32} color={color} />
          </Box>
          <VStack className="flex-1">
            <Heading size="md" className="text-typography-900">
              {title}
            </Heading>
            <Text size="sm" className="text-typography-500 mt-1">
              {description}
            </Text>
          </VStack>
          <ChevronRight size={20} color="#9CA3AF" />
        </HStack>
      </Card>
    </Pressable>
  );
};
