import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import {
  Box,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Pressable,
} from "@/components/ui";
import { Zap, Sun, RefreshCw, ChevronRight } from "lucide-react-native";

export default function FeedScreen() {
  const router = useRouter();

  const kitTypes = [
    {
      id: "on-grid",
      title: "On-Grid (Conectado a la Red)",
      description: "Es el más común en zonas urbanas. Tu casa consume la energía de los paneles y, si te sobra, la \"inyectas\" a la red pública. Si no hay sol, la red te suministra energía automáticamente. No usa baterías y requiere visto bueno del operador de red.",
      icon: Zap,
      color: "#EAB308", // yellow-500
      bgColor: "bg-yellow-50",
    },
    {
      id: "off-grid",
      title: "Off-Grid (Autónomo)",
      description: "Ideal para fincas, casas de campo o zonas donde la red eléctrica no llega. Aquí eres totalmente independiente. Usa baterías.",
      icon: Sun,
      color: "#F97316", // orange-500
      bgColor: "bg-orange-50",
    },
    {
      id: "hybrid",
      title: "Híbrido",
      description: "Es lo mejor de ambos mundos. Estás conectado a la red, pero también tienes baterías.",
      icon: RefreshCw,
      color: "#3B82F6", // blue-500
      bgColor: "bg-blue-50",
    },
  ];

  const handleSelectType = (type: string) => {
    router.push({
      pathname: "/(auth)/(tabs)/search",
      params: { kitType: type },
    });
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Box className="mb-4">
            <Heading size="xl" className="text-typography-900">
              Selecciona tu tipo de Kit
            </Heading>
            <Text size="md" className="text-typography-500 mt-2">
              Elige la configuración que mejor se adapte a tus necesidades energéticas.
            </Text>
          </Box>

          {kitTypes.map((kit) => (
            <Pressable
              key={kit.id}
              onPress={() => handleSelectType(kit.id)}
              className="active:opacity-80"
            >
              <Card variant="outline" className="p-4 border-outline-200">
                <HStack space="lg" className="items-center">
                  <Box className={`p-3 rounded-full ${kit.bgColor}`}>
                    <kit.icon size={32} color={kit.color} />
                  </Box>
                  <VStack className="flex-1">
                    <Heading size="md" className="text-typography-900">
                      {kit.title}
                    </Heading>
                    <Text size="sm" className="text-typography-500 mt-1">
                      {kit.description}
                    </Text>
                  </VStack>
                  <ChevronRight size={20} color="#9CA3AF" />
                </HStack>
              </Card>
            </Pressable>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}