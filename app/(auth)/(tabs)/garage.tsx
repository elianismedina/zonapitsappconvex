import React from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const vehiculos = useQuery(api.vehiculos.getVehiculos, {});
  const router = useRouter();

  if (vehiculos === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Heading size="xl" className="mb-4">Mi Garaje</Heading>
      
      {vehiculos.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <VStack space="lg" className="items-center">
            <Text size="lg" className="text-center">No tienes vehículos registrados.</Text>
            <Button 
                size="md" 
                variant="solid" 
                action="primary"
                onPress={() => router.push("/(auth)/(tabs)/create")}
            >
                <ButtonText>Registrar Vehículo</ButtonText>
            </Button>
          </VStack>
        </View>
      ) : (
        <FlatList
          data={vehiculos}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card size="md" variant="elevated" className="mb-4">
              <VStack space="md">
                <Heading size="md">{item.marca} {item.linea}</Heading>
                <VStack space="xs">
                    <HStack space="md">
                        <Text className="font-bold">Modelo:</Text>
                        <Text>{item.modelo}</Text>
                    </HStack>
                    <HStack space="md">
                        <Text className="font-bold">Año:</Text>
                        <Text>{item.year}</Text>
                    </HStack>
                    <HStack space="md">
                        <Text className="font-bold">Color:</Text>
                        <Text>{item.color}</Text>
                    </HStack>
                    <HStack space="md">
                        <Text className="font-bold">Combustible:</Text>
                        <Text>{item.combustible}</Text>
                    </HStack>
                     <HStack space="md">
                        <Text className="font-bold">Cilindrada:</Text>
                        <Text>{item.cilindrada}</Text>
                    </HStack>
                     <HStack space="md">
                        <Text className="font-bold">Transmisión:</Text>
                        <Text>{item.transmision}</Text>
                    </HStack>
                </VStack>
              </VStack>
            </Card>
          )}
        />
      )}
    </View>
  );
}