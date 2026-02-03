import React, { useState, useRef } from "react";
import { StyleSheet, View, Dimensions, Keyboard, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { Plus, Minus } from "lucide-react-native";
import {
  Box,
  Button,
  ButtonText,
  Input,
  InputField,
  Text,
  VStack,
  Heading,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Toast,
  ToastTitle,
  useToast,
} from "@/components/ui";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function SearchScreen() {
  const [kitName, setKitName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const createKit = useMutation(api.kits.createKit);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const toast = useToast();

  const handlePlaceSelect = (data: any, details: any = null) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      const address = data.description;
      
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setSelectedLocation({
        address,
        latitude: lat,
        longitude: lng,
      });
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current && region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };

  const handleCreateKit = async () => {
    if (!selectedLocation || !kitName.trim()) {
       toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast action="error" variant="outline" nativeID={id}>
              <ToastTitle>Please select a location and enter a name.</ToastTitle>
            </Toast>
          );
        },
      });
      return;
    }

    try {
      await createKit({
        name: kitName,
        address: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        status: "draft",
      });

      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast action="success" variant="outline" nativeID={id}>
              <ToastTitle>Kit created successfully!</ToastTitle>
            </Toast>
          );
        },
      });

      // Reset form or navigate
      setKitName("");
      setSelectedLocation(null);
      Keyboard.dismiss();
      
      // Optional: Navigate to kit details or list
      // router.push("/(auth)/(tabs)/kits"); 
    } catch (error) {
      console.error("Error creating kit:", error);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast action="error" variant="outline" nativeID={id}>
              <ToastTitle>Failed to create kit.</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <VStack style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for an address"
          onPress={handlePlaceSelect}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: "en",
          }}
          fetchDetails={true}
          styles={{
            container: {
              flex: 0,
              width: "100%",
              zIndex: 1,
            },
            listView: {
              backgroundColor: "white",
              zIndex: 1000, 
              position: 'absolute',
              top: 45,
              width: "100%",
            },
            textInput: {
              height: 44,
              borderRadius: 8,
              paddingHorizontal: 10,
              backgroundColor: "#f0f0f0",
              fontSize: 16,
            }
          }}
          enablePoweredByContainer={false}
        />
      </VStack>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={selectedLocation.address}
          />
        )}
      </MapView>
      
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Plus size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Minus size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Box className="bg-white p-4 rounded-t-3xl shadow-lg">
            <Heading size="md" className="mb-4">Create New Solar Kit</Heading>
            <VStack space="md">
            <FormControl>
                <FormControlLabel>
                <FormControlLabelText>Kit Name</FormControlLabelText>
                </FormControlLabel>
                <Input>
                <InputField 
                    placeholder="e.g. My Cabin Solar" 
                    value={kitName}
                    onChangeText={setKitName}
                />
                </Input>
            </FormControl>
            
            <View>
                <Text className="text-gray-500 text-sm mb-1">Location:</Text>
                <Text numberOfLines={1} className="font-medium">
                    {selectedLocation ? selectedLocation.address : "No location selected"}
                </Text>
            </View>

            <Button onPress={handleCreateKit} isDisabled={!selectedLocation || !kitName}>
                <ButtonText>Create Kit</ButtonText>
            </Button>
            </VStack>
        </Box>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    position: "absolute",
    top: 50, // Adjust based on safe area
    left: 16,
    right: 16,
    zIndex: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  zoomControls: {
    position: "absolute",
    top: 120, // Below the search bar
    right: 16,
    flexDirection: "column",
    gap: 10,
    zIndex: 10,
  },
  zoomButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
