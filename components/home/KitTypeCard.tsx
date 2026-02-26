import {
  Box,
  Card,
  Image as GUIImage,
  HStack,
  Heading,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { ChevronRight } from "lucide-react-native";
import React from "react";

interface KitTypeCardProps {
  id: string;
  title: string;
  description: string;
  image: any;
  color: string;
  bgColor: string;
  onPress: (id: string) => void;
}

export const KitTypeCard = ({
  id,
  title,
  description,
  image,
  color,
  bgColor,
  onPress,
}: KitTypeCardProps) => {
  return (
    <Pressable onPress={() => onPress(id)} className="active:opacity-80">
      <Card variant="outline" className="p-4 border-outline-200">
        <HStack space="lg" className="items-center">
          <Box className={`rounded-xl ${bgColor} p-1`}>
            <GUIImage
              source={image}
              alt={title}
              className="w-16 h-16"
              contentFit="contain"
            />
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
