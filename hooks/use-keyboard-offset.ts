import { useEffect } from "react";
import { Keyboard, Platform, type KeyboardEvent } from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";

export const useKeyboardOffset = () => {
  const keyboardOffset = useSharedValue(0);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      keyboardOffset.value = withSpring(
        e.endCoordinates.height - (Platform.OS === "ios" ? 80 : 0),
        {
          damping: 20,
          stiffness: 90,
        }
      );
    };

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const showSubscription = Keyboard.addListener(showEvent, onShow);

    return () => {
      showSubscription.remove();
    };
  }, [keyboardOffset]);

  useEffect(() => {
    const onHide = () => {
      keyboardOffset.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    };

    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const hideSubscription = Keyboard.addListener(hideEvent, onHide);

    return () => {
      hideSubscription.remove();
    };
  }, [keyboardOffset]);

  return keyboardOffset;
};
