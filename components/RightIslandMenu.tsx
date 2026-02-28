import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInRight,
  FadeOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export interface RightMenuOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface RightIslandMenuProps {
  options: RightMenuOption[];
  onOptionPress: (option: RightMenuOption) => void;
  width?: number;
  enableHaptics?: boolean;
}

export default function RightIslandMenu({
  options,
  onOptionPress,
  width = 140,
  enableHaptics = true,
}: RightIslandMenuProps) {
  const [expanded, setExpanded] = useState(false);

  // Base width for the toggle button when closed
  const CLOSED_WIDTH = 56;

  const animatedWidth = useSharedValue(CLOSED_WIDTH);

  const toggleMenu = () => {
    if (enableHaptics && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const nextState = !expanded;
    setExpanded(nextState);
    animatedWidth.value = withSpring(nextState ? width : CLOSED_WIDTH, {
      damping: 20,
      stiffness: 200,
    });
  };

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: animatedWidth.value,
    };
  });

  const handlePress = (option: RightMenuOption) => {
    if (enableHaptics && Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    onOptionPress(option);
  };

  return (
    <Animated.View
      style={[
        menuAnimatedStyle,
        {
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 8,
          zIndex: 50, // Ensures it floats above other content
        },
      ]}
      className="absolute right-4 top-1/3 bg-slate-900/95 rounded-[28px] overflow-hidden border border-white/20"
    >
      <TouchableOpacity
        className="items-center justify-center h-14 w-full"
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <Ionicons
          name={expanded ? "close-outline" : "menu-outline"}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {expanded && (
        <View className="pb-2 border-t border-white/10 mt-1">
          {options.map((option, index) => (
            <Animated.View
              entering={FadeInRight.delay(index * 50)}
              exiting={FadeOutRight.duration(200)}
              key={option.id}
            >
              <TouchableOpacity
                className="flex-row items-center py-3 px-4 active:bg-white/10"
                onPress={() => handlePress(option)}
                activeOpacity={0.7}
              >
                <Ionicons name={option.icon} size={22} color="#fff" />
                <Text
                  className="text-white ml-3 text-base font-medium"
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}
