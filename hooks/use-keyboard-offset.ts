import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform } from "react-native";

export const useKeyboardOffset = () => {
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      Animated.spring(keyboardOffset, {
        toValue: e.endCoordinates.height - (Platform.OS === "ios" ? 80 : 0),
        useNativeDriver: false,
      }).start();
    };

    const onHide = () => {
      Animated.spring(keyboardOffset, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    };

    const showSubscription = Keyboard.addListener(showEvent, onShow);
    const hideSubscription = Keyboard.addListener(hideEvent, onHide);

    const cleanup = () => {
      showSubscription.remove();
      hideSubscription.remove();
    };

    return cleanup;
  }, []);

  return keyboardOffset;
};
