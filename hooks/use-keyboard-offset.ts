import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform } from "react-native";

export const useKeyboardOffset = () => {
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      Animated.spring(keyboardOffset, {
        toValue: e.endCoordinates.height - (Platform.OS === "ios" ? 80 : 0),
        useNativeDriver: false,
      }).start();
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      Animated.spring(keyboardOffset, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardOffset]);

  return keyboardOffset;
};
