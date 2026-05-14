import React from "react";
import { View, Text } from "react-native";

export function TestNativeWind() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500 p-4">
      <Text className="text-white text-2xl font-bold mb-4">
        NativeWind Test
      </Text>
      <View className="bg-red-500 p-4 rounded-lg">
        <Text className="text-white">If this has a red background, NativeWind is working!</Text>
      </View>
      <View style={{ marginTop: 20, backgroundColor: "green", padding: 20 }}>
        <Text style={{ color: "white" }}>This uses inline styles (should always work)</Text>
      </View>
    </View>
  );
}