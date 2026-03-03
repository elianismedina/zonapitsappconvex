import { useAudioPlayer } from "expo-audio";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const ANIMATION_SOURCE = require("@/assets/lotties/ZonaPitsLottie.json");
const SOUND_SOURCE = require("@/assets/sounds/LamborginiSound.m4a");

type AnimatedSplashScreenProps = {
  onAnimationFinish: () => void;
  onReady?: () => void;
};

export const AnimatedSplashScreen = ({
  onAnimationFinish,
  onReady,
}: AnimatedSplashScreenProps) => {
  const player = useAudioPlayer(SOUND_SOURCE);
  // Increase timeout to 8 seconds since the animation itself is 5 seconds long (150 frames @ 30fps)
  const SPLASH_TIMEOUT_MS = 8000;
  // Track if we've already finished to prevent duplicate calls
  const [hasFinished, setHasFinished] = useState(false);

  const handleAnimationFinish = useCallback(() => {
    if (!hasFinished) {
      setHasFinished(true);
      onAnimationFinish();
    }
  }, [hasFinished, onAnimationFinish]);

  useEffect(() => {
    // Notify parent that the component is mounted and ready to be shown
    if (onReady) {
      onReady();
    }

    // Play sound with error handling
    try {
      player.play();
    } catch (error) {
      console.warn("Failed to play splash sound:", error);
    }

    // Set timeout to force splash screen to finish after SPLASH_TIMEOUT_MS
    const timeoutId = setTimeout(() => {
      console.warn("Splash screen timed out, forcing finish");
      handleAnimationFinish();
    }, SPLASH_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [player, onReady, handleAnimationFinish]);

  return (
    <View style={styles.container}>
      <LottieView
        source={ANIMATION_SOURCE}
        autoPlay
        loop={false}
        resizeMode="contain"
        style={styles.lottie}
        onAnimationFinish={handleAnimationFinish}
        onAnimationFailure={(error: any) => {
          console.error("Lottie animation error:", error);
          handleAnimationFinish();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
});
