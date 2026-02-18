import React from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { VStack } from "@/components/ui";
import { StyleSheet } from "react-native";

interface AddressSearchProps {
  apiKey: string;
  onPlaceSelect: (data: any, details: any) => void;
}

export const AddressSearch = ({ apiKey, onPlaceSelect }: AddressSearchProps) => {
  return (
    <VStack style={styles.searchContainer}>
      <GooglePlacesAutocomplete
        placeholder="Buscar una dirección"
        onPress={onPlaceSelect}
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
          listView: {
            backgroundColor: "white",
            zIndex: 1000,
            position: "absolute",
            top: 45,
            width: "100%",
          },
          textInput: {
            height: 44,
            borderRadius: 8,
            paddingHorizontal: 10,
            backgroundColor: "#f0f0f0",
            fontSize: 16,
          },
        }}
        enablePoweredByContainer={false}
      />
    </VStack>
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
});
