import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAudioPlayer } from 'expo-audio';

const ANIMATION_SOURCE = require('@/assets/lotties/ZonaPitsLottie.json');
const SOUND_SOURCE = require('@/assets/sounds/LamborginiSound.m4a');

type AnimatedSplashScreenProps = {
  onAnimationFinish: () => void;
  onReady?: () => void;
};

export const AnimatedSplashScreen = ({
  onAnimationFinish,
  onReady,
}: AnimatedSplashScreenProps) => {
  const player = useAudioPlayer(SOUND_SOURCE);
  // Timeout to force animation finish after 5 seconds (5000ms)
  const SPLASH_TIMEOUT_MS = 5000;
  // Track if we've already finished to prevent duplicate calls
  const [hasFinished, setHasFinished] = React.useState(false);

  const handleAnimationFinish = React.useCallback(() => {
    if (!hasFinished) {
      setHasFinished(true);
      onAnimationFinish();
    }
  }, [hasFinished, onAnimationFinish]);

  useEffect(() => {
    // Notify parent that the component is mounted and ready to be shown
    // This is where we would hide the native splash screen
    if (onReady) {
      onReady();
    }

    // Play sound with error handling
    try {
      player.play();
    } catch (error) {
      console.warn('Failed to play splash sound:', error);
      // Don't block animation if sound fails
    }

    // Set timeout to force splash screen to finish after SPLASH_TIMEOUT_MS
    const timeoutId = setTimeout(() => {
      console.warn('Splash screen timed out, forcing finish');
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
        onError={(error) => {
          console.error('Lottie animation error:', error);
          handleAnimationFinish();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff', // Match your splash background color
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999, // Ensure it sits on top
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
