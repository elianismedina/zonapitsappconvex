import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  Input,
  InputField,
  Text,
  Toast,
  ToastTitle,
  VStack,
  useToast,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import { Keyboard, StyleSheet, TouchableOpacity, View, Platform, TouchableWithoutFeedback, Animated } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function SearchScreen() {
  const { kitType } = useLocalSearchParams<{ kitType: string }>();
  const [kitName, setKitName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 4.651795,
    longitude: -74.09462,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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
  }, []);

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
              <ToastTitle>
                Por favor, selecciona una ubicación y escribe un nombre.
              </ToastTitle>
            </Toast>
          );
        },
      });
      return;
    }

    try {
      const newKitId = await createKit({
        name: kitName,
        address: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        type: kitType as "off-grid" | "on-grid" | "hybrid" | undefined,
        status: "draft",
      });

      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast action="success" variant="outline" nativeID={id}>
              <ToastTitle>¡Kit creado exitosamente!</ToastTitle>
            </Toast>
          );
        },
      });

      // Reset form
      setKitName("");
      setSelectedLocation(null);
      Keyboard.dismiss();

      // Navigate to bill upload screen (create tab)
      router.push({
        pathname: "/(auth)/(tabs)/create",
        params: { kitId: newKitId }
      });
    } catch (error) {
      console.error("Error creating kit:", error);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast action="error" variant="outline" nativeID={id}>
              <ToastTitle>Fallo al crear kit.</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <VStack style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Buscar una dirección"
            onPress={handlePlaceSelect}
            query={{
              key: GOOGLE_MAPS_API_KEY,
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

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
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

        <Animated.View
          style={[
            styles.formContainer,
            { bottom: keyboardOffset }
          ]}
        >
          <Box className="bg-white p-4 rounded-t-3xl shadow-lg">
            <Heading size="md" className="mb-4">
              Crear Nuevo Kit Solar {kitType ? `(${kitType})` : ""}
            </Heading>
            <VStack space="md">
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>Nombre del Kit</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    placeholder="Ej. Kit Solar Cabaña"
                    value={kitName}
                    onChangeText={setKitName}
                  />
                </Input>
              </FormControl>

              <View>
                <Text className="text-gray-500 text-sm mb-1">Ubicación:</Text>
                <Text numberOfLines={1} className="font-medium">
                  {selectedLocation
                    ? selectedLocation.address
                    : "Ninguna ubicación seleccionada"}
                </Text>
              </View>

              <Button
                onPress={handleCreateKit}
                isDisabled={!selectedLocation || !kitName}
              >
                <ButtonText>Crear Kit</ButtonText>
              </Button>
            </VStack>
          </Box>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
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
