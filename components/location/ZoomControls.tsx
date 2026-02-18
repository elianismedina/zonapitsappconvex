import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls = ({ onZoomIn, onZoomOut }: ZoomControlsProps) => {
  return (
    <View style={styles.zoomControls}>
      <TouchableOpacity style={styles.zoomButton} onPress={onZoomIn}>
        <Plus size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.zoomButton} onPress={onZoomOut}>
        <Minus size={24} color="#000" />
      </TouchableOpacity>
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
});
