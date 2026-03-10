import { AddressSearch } from "@/components/location/AddressSearch";
import { KitCreationForm } from "@/components/location/KitCreationForm";
import { ZoomControls } from "@/components/location/ZoomControls";
import { useToastNotify } from "@/components/hooks/useToastNotify";
import { api } from "@/convex/_generated/api";
import { useKeyboardOffset } from "@/hooks/use-keyboard-offset";
import { useMutation } from "convex/react";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function SearchScreen() {
  const { kitType } = useLocalSearchParams<{ kitType: string }>();
  const createKit = useMutation(api.kits.createKit);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const notify = useToastNotify();
  const keyboardOffset = useKeyboardOffset();

  const [kitName, setKitName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const [shakeAddress, setShakeAddress] = useState(0);
  const [shakeName, setShakeName] = useState(0);

  const [region, setRegion] = useState<Region>({
    latitude: 4.651795, // Default to Bogotá, Colombia
    longitude: -74.09462,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Effect for fetching user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        notify({
          title: "Permiso de ubicación denegado",
          description:
            "No podemos centrar el mapa en tu ubicación actual sin permiso.",
          action: "error",
        });
        return;
      }

      try {
        // First try to get last known position for immediate snap
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          const lastRegion = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(lastRegion);
          mapRef.current?.animateToRegion(lastRegion, 500);
        }

        // Then get fresh position with balanced accuracy (much faster than High)
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      } catch (error) {
        console.error("Error fetching location:", error);
        notify({
          title: "Error al obtener ubicación",
          description: "No se pudo obtener tu ubicación actual.",
          action: "error",
        });
      }
    })();
  }, [notify]);

  const handlePlaceSelect = useCallback((data: any, details: any = null) => {
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
  }, []);

  const handleUseCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        notify({
          title: "Permiso denegado",
          description: "Necesitamos permiso para usar tu ubicación.",
          action: "error",
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const address =
          `${place.street || ""} ${place.name || ""}, ${place.city || ""}, ${place.region || ""}`.trim();

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };

        setSelectedLocation({
          address: address || "Ubicación actual",
          latitude,
          longitude,
        });
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error("Error using current location:", error);
      notify({
        title: "Error",
        description: "No se pudo determinar la dirección.",
        action: "error",
      });
    }
  };

  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      if (mapRef.current && region) {
        const multiplier = direction === "in" ? 0.5 : 2;
        const newRegion = {
          ...region,
          latitudeDelta: region.latitudeDelta * multiplier,
          longitudeDelta: region.longitudeDelta * multiplier,
        };
        setRegion(newRegion);
        mapRef.current.animateToRegion(newRegion, 500);
      }
    },
    [region],
  );

  const handleCreateKit = async () => {
    let hasError = false;

    if (!selectedLocation) {
      setShakeAddress((prev) => prev + 1);
      hasError = true;
    }

    if (!kitName.trim()) {
      setShakeName((prev) => prev + 1);
      hasError = true;
    }

    if (hasError) {
      notify({
        title: "Por favor, selecciona una ubicación y escribe un nombre.",
        action: "error",
        variant: "outline",
      });
      return;
    }

    try {
      const newKitId = await createKit({
        name: kitName,
        address: selectedLocation!.address,
        latitude: selectedLocation!.latitude,
        longitude: selectedLocation!.longitude,
        type: kitType as "off-grid" | "on-grid" | "hybrid" | undefined,
        status: "draft",
      });

      notify({
        title: "¡Kit creado exitosamente!",
        action: "success",
        variant: "outline",
      });

      setKitName("");
      setSelectedLocation(null);
      Keyboard.dismiss();

      router.push({
        pathname: "/(auth)/(tabs)/billupload",
        params: { kitId: newKitId },
      });
    } catch (error) {
      console.error("Error creating kit:", error);
      notify({
        title: "Fallo al crear kit.",
        action: "error",
        variant: "outline",
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          zoomEnabled={true}
          scrollEnabled={true}
          showsUserLocation={true}
          showsMyLocationButton={true}
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

        <AddressSearch
          apiKey={GOOGLE_MAPS_API_KEY}
          onPlaceSelect={handlePlaceSelect}
          shakeSignal={shakeAddress}
        />

        <ZoomControls
          onZoomIn={() => handleZoom("in")}
          onZoomOut={() => handleZoom("out")}
          onLocate={handleUseCurrentLocation}
        />

        <KitCreationForm
          kitType={kitType}
          kitName={kitName}
          setKitName={setKitName}
          selectedLocation={selectedLocation}
          onConfirm={handleCreateKit}
          onCancel={() => {
            setSelectedLocation(null);
            setKitName("");
            Keyboard.dismiss();
          }}
          keyboardOffset={keyboardOffset}
          shakeSignal={shakeName}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

