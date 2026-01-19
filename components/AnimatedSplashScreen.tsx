import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAudioPlayer } from 'expo-audio';

const ANIMATION_SOURCE = require('@/assets/lotties/ZonaPitsLottie.json');
const SOUND_SOURCE = require('@/assets/sounds/LamborginiSound.mp4');

type AnimatedSplashScreenProps = {
  onAnimationFinish: () => void;
  onReady?: () => void;
};

export const AnimatedSplashScreen = ({
  onAnimationFinish,
  onReady,
}: AnimatedSplashScreenProps) => {
  const player = useAudioPlayer(SOUND_SOURCE);

  useEffect(() => {
    // Notify parent that the component is mounted and ready to be shown
    // This is where we would hide the native splash screen
    if (onReady) {
      onReady();
    }
    
    // Play sound
    player.play();
    
    // Cleanup
    return () => {
      player.pause();
    };
  }, [player, onReady]);

  return (
    <View style={styles.container}>
      <LottieView
        source={ANIMATION_SOURCE}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={styles.lottie}
        onAnimationFinish={onAnimationFinish}
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
