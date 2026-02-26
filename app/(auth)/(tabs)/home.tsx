import { KitTypeCard } from "@/components/home/KitTypeCard";
import { Box, Heading, Text, VStack } from "@/components/ui";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";

const ongridImg = require("@/assets/images/ongrid.png");

const KIT_TYPES = [
  {
    id: "on-grid",
    title: "On-Grid (Conectado a la Red)",
    description:
      'Es el más común en zonas urbanas. Tu casa consume la energía de los paneles y, si te sobra, la "inyectas" a la red pública. Si no hay sol, la red te suministra energía automáticamente. No usa baterías y requiere visto bueno del operador de red.',
    image: ongridImg,
    color: "#EAB308", // yellow-500
    bgColor: "bg-yellow-50",
  },
  {
    id: "off-grid",
    title: "Off-Grid (Autónomo)",
    description:
      "Ideal para fincas, casas de campo o zonas donde la red eléctrica no llega. Aquí eres totalmente independiente. Usa baterías.",
    image: ongridImg,
    color: "#F97316", // orange-500
    bgColor: "bg-orange-50",
  },
  {
    id: "hybrid",
    title: "Híbrido",
    description:
      "Es lo mejor de ambos mundos. Estás conectado a la red, pero también tienes baterías.",
    image: ongridImg,
    color: "#3B82F6", // blue-500
    bgColor: "bg-blue-50",
  },
];

export default function FeedScreen() {
  const router = useRouter();

  const handleSelectType = (type: string) => {
    router.push({
      pathname: "/(auth)/(tabs)/location",
      params: { kitType: type },
    });
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Box className="mb-4">
            <Heading size="xl" className="text-typography-900">
              Selecciona el tipo de proyecto
            </Heading>
            <Text size="md" className="text-typography-500 mt-2">
              Elige la configuración que mejor se adapte a tus necesidades
              energéticas.
            </Text>
          </Box>

          {KIT_TYPES.map((kit) => (
            <KitTypeCard key={kit.id} {...kit} onPress={handleSelectType} />
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}
