import { VStack } from "@/components/ui";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface AddressSearchProps {
  apiKey: string;
  onPlaceSelect: (data: any, details: any) => void;
  shakeSignal?: number;
}

export const AddressSearch = ({
  apiKey,
  onPlaceSelect,
  shakeSignal = 0,
}: AddressSearchProps) => {
  const shakeTranslateX = useSharedValue(0);

  useEffect(() => {
    if (shakeSignal > 0) {
      shakeTranslateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(withTiming(10, { duration: 50 }), 5, true),
        withTiming(0, { duration: 50 }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeSignal]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeTranslateX.value }],
    };
  });

  return (
    <Animated.View style={[styles.searchContainer, animatedStyle]}>
      <VStack style={styles.vStackContainer}>
        <GooglePlacesAutocomplete
          onPress={onPlaceSelect}
          placeholder="Buscar una dirección"
          query={{
            key: apiKey,
            language: "es",
          }}
          fetchDetails={true}
          debounce={250}
          minLength={2}
          styles={{
            container: {
              flex: 0,
              width: "100%",
              zIndex: 1,
            },
            textInputContainer: {
              backgroundColor: "#f8f8f8",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e5e5",
              height: 50,
              alignItems: "center",
            },
            textInput: {
              backgroundColor: "transparent",
              fontSize: 16,
              color: "#000",
              margin: 0,
              paddingHorizontal: 12,
              paddingVertical: 0,
              flex: 1, // Let it fill the container height centered
            },
            listView: {
              backgroundColor: "white",
              zIndex: 1000,
              position: "absolute",
              top: 55,
              width: "100%",
              borderRadius: 8,
              elevation: 4,
            },
          }}
          enablePoweredByContainer={false}
        />
      </VStack>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  vStackContainer: {
    width: "100%",
  },
});
