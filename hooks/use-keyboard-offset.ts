import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform, type KeyboardEvent } from "react-native";

const KEYBOARD_SHOW_EVENT = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
const KEYBOARD_HIDE_EVENT = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

export const useKeyboardOffset = () => {
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      Animated.spring(keyboardOffset, {
        toValue: e.endCoordinates.height - (Platform.OS === "ios" ? 80 : 0),
        useNativeDriver: false,
      }).start();
    };

    const eventName = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    Keyboard.addListener(eventName as any, onShow);
    return () => {
      Keyboard.removeListener(eventName as any, onShow);
    };
  }, [keyboardOffset]);

  useEffect(() => {
    const onHide = () => {
      Animated.spring(keyboardOffset, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    };

    const eventName = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    Keyboard.addListener(eventName as any, onHide);
    return () => {
      Keyboard.removeListener(eventName as any, onHide);
    };
  }, [keyboardOffset]);

  return keyboardOffset;
};
