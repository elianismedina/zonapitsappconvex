import RightIslandMenu from "@/components/RightIslandMenu";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Alert, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const CreateTabIcon = ({
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 12,
      stiffness: 200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      className="rounded-lg p-1.5"
      style={[{ backgroundColor: Colors.itemBackground }, animatedStyle]}
    >
      <Ionicons name="receipt" size={size} color={color} />
    </Animated.View>
  );
};

const TabIcon = ({
  name,
  nameFocused,
  focused,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  nameFocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 12,
      stiffness: 200,
    });
    translateY.value = withSpring(focused ? -4 : 0, {
      damping: 12,
      stiffness: 200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  return (
    <Animated.View className="p-0.5" style={[animatedStyle]}>
      <Ionicons name={focused ? nameFocused : name} size={size} color={color} />
    </Animated.View>
  );
};

const Layout = () => {
  const handleOptionPress = (option: any) => {
    Alert.alert(option.label, `Selected: ${option.id}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#000",
          headerTitle: "EfiKit Solar",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="home-outline"
                nameFocused="home"
                focused={focused}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="location"
          options={{
            title: "Ubicación",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="location-outline"
                nameFocused="location"
                focused={focused}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="billupload"
          options={{
            title: "Factura",
            tabBarIcon: ({ color, size, focused }) => (
              <CreateTabIcon color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="mykits"
          options={{
            title: "Mis Kits",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="flash-outline"
                nameFocused="flash"
                focused={focused}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Ajustes",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="settings-outline"
                nameFocused="settings"
                focused={focused}
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
      <RightIslandMenu
        options={[
          { id: "1", icon: "headset-outline", label: "Soporte" },
          { id: "2", icon: "bookmark-outline", label: "Favoritos" },
          { id: "3", icon: "bar-chart-outline", label: "Proyección" },
          { id: "4", icon: "calculator-outline", label: "Calculadora" },
        ]}
        onOptionPress={handleOptionPress}
        width={160}
        enableHaptics={true}
      />
    </View>
  );
};

export default Layout;
