import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import * as SecureStore from "expo-secure-store";
import { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ONBOARDING_KEY = "hasSeenOnboarding";

export const setOnboardingSeen = async () => {
  await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
};

// Helper to reset onboarding (useful for testing)
export const resetOnboarding = async () => {
  await SecureStore.deleteItemAsync(ONBOARDING_KEY);
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return value === "true";
};

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Calcula tu ahorro solar",
    description: "Descubre cuánto puedes ahorrar instalando paneles solares con nuestros cálculos precisos y personalizados.",
  },
  {
    id: 2,
    title: "Gestiona tus instalaciones",
    description: "Registra y administra todos tus proyectos solares en un solo lugar, desde el diseño hasta la instalación.",
  },
  {
    id: 3,
    title: "Monitorea tu energía",
    description: "Seguimiento en tiempo real del rendimiento de tus paneles solares y optimización de tu consumo eléctrico.",
  },
  {
    id: 4,
    title: "Carga tus facturas",
    description: "Sube tus facturas de luz y deja que nuestra IA te ofrezca la mejor solución solar para tu hogar o negocio.",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % ONBOARDING_DATA.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };

  const handleGetStarted = async () => {
    await setOnboardingSeen();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {ONBOARDING_DATA.map((item) => (
          <View key={item.id} style={styles.slide}>
            <VStack space="2xl" className="flex-1 justify-center items-center px-8">
              <Text size="4xl" className="font-bold text-center text-typography-900">
                {item.title}
              </Text>
              <Text size="lg" className="text-center text-typography-600 leading-relaxed">
                {item.description}
              </Text>
            </VStack>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Start button */}
      <Box style={styles.buttonContainer}>
        <Button
          size="xl"
          className="w-full bg-primary-500"
          onPress={handleGetStarted}
        >
          <Text className="text-white font-bold text-lg">Empezar</Text>
        </Button>
      </Box>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4D4D4",
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: "#007AFF",
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 16,
  },
});