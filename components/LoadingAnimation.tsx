import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LOADING_SOURCE = require("@/assets/lotties/Loading.json");

type LoadingAnimationProps = {
  text?: string;
  size?: number;
};

export const LoadingAnimation = ({
  text,
  size = 200,
}: LoadingAnimationProps) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={LOADING_SOURCE}
        autoPlay
        loop
        resizeMode="contain"
        style={[styles.lottie, { width: size, height: size }]}
      />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  lottie: {
    // Size is dynamic
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#11181C",
    fontWeight: "500",
  },
});
