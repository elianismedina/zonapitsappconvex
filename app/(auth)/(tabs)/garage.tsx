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

export default function GarageScreen() {
  const kits = useQuery(api.kits.getKits, {});
  const router = useRouter();

  if (kits === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Heading size="xl" className="mb-4">Mis Kits Solares</Heading>
      
      {kits.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <VStack space="lg" className="items-center">
            <Text size="lg" className="text-center">No tienes kits registrados.</Text>
            <Button 
                size="md" 
                variant="solid" 
                action="primary"
                onPress={() => router.push("/(auth)/(tabs)/search")}
            >
                <ButtonText>Crear un Kit</ButtonText>
            </Button>
          </VStack>
        </View>
      ) : (
        <FlatList
          data={kits}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card size="md" variant="elevated" className="mb-4 p-4">
              <VStack space="md">
                <Heading size="md">{item.name}</Heading>
                <VStack space="xs">
                    <HStack space="md" className="items-center">
                        <Text className="font-bold w-24">Dirección:</Text>
                        <Text className="flex-1">{item.address}</Text>
                    </HStack>
                    <HStack space="md">
                        <Text className="font-bold w-24">Estado:</Text>
                        <Text className="capitalize">{item.status}</Text>
                    </HStack>
                    {item.capacity && (
                      <HStack space="md">
                          <Text className="font-bold w-24">Capacidad:</Text>
                          <Text>{item.capacity} kWp</Text>
                      </HStack>
                    )}
                </VStack>
              </VStack>
            </Card>
          )}
        />
      )}
    </View>
  );
}