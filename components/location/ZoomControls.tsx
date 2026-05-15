import { MapPin, Minus, Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, Pressable, View } from "react-native";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

export const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onLocate,
}: ZoomControlsProps) => {
  return (
    <View style={styles.zoomControls}>
      <Pressable
        style={({ pressed }) => [
          styles.zoomButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={onLocate}
      >
        <MapPin size={24} color="#0066FF" />
      </Pressable>
      <View style={styles.separator} />
      <Pressable
        style={({ pressed }) => [
          styles.zoomButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={onZoomIn}
      >
        <Plus size={24} color="#000" />
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.zoomButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={onZoomOut}
      >
        <Minus size={24} color="#000" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  zoomControls: {
    position: "absolute",
    top: 120, // Below the search bar
    right: 16,
    flexDirection: "column",
    gap: 10,
    zIndex: 10,
  },
  zoomButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 4,
  },
});
