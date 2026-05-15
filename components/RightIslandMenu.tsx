import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, Text, Pressable, View } from "react-native";
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
  const CLOSED_WIDTH = 28;

  const translateX = useSharedValue(width - CLOSED_WIDTH);

  const toggleMenu = () => {
    if (enableHaptics && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const nextState = !expanded;
    setExpanded(nextState);
    translateX.value = withSpring(nextState ? 0 : width - CLOSED_WIDTH, {
      damping: 20,
      stiffness: 200,
    });
  };

  // Close the menu automatically when navigating back to the screen
  useFocusEffect(
    useCallback(() => {
      setExpanded(false);
      translateX.value = withSpring(width - CLOSED_WIDTH, {
        damping: 20,
        stiffness: 200,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width]),
  );

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
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
          width,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 8,
          zIndex: 50, // Ensures it floats above other content
        },
      ]}
      className="absolute right-0 top-1/3 bg-black rounded-l-2xl overflow-hidden"
    >
      <Pressable
        className="items-center justify-center h-16"
        style={{ width: CLOSED_WIDTH }}
        onPress={toggleMenu}
      >
        <Ionicons
          name={expanded ? "chevron-forward-outline" : "chevron-back-outline"}
          size={20}
          color="#fff"
        />
      </Pressable>

      {expanded && (
        <View className="pb-2 border-t border-white/10 mt-1">
          {options.map((option, index) => (
            <Animated.View
              entering={FadeInRight.delay(index * 50)}
              exiting={FadeOutRight.duration(200)}
              key={option.id}
            >
              <Pressable
                className="flex-row items-center py-3 px-4 active:bg-white/10"
                onPress={() => handlePress(option)}
              >
                <Ionicons name={option.icon} size={22} color="#fff" />
                <Text
                  className="text-white ml-3 text-base font-sora-medium"
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}
