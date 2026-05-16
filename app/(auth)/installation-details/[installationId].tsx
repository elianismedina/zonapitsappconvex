import {
  Box,
  Card,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Briefcase, Clock, Info, Users, Wrench } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function InstallationDetailsScreen() {
  const { installationId } = useLocalSearchParams<{
    installationId: Id<"installations">;
  }>();
  const installation = useQuery(api.installations.getInstallationById, {
    id: installationId,
  });

  if (installation === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (installation === null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text>No se encontró el servicio de instalación.</Text>
      </Box>
    );
  }

  const laborCost =
    installation.numInstallers *
    installation.hoursPerInstaller *
    installation.hourlyRate;
  const panelCost =
    installation.numPanels * installation.installationCostPerPanel;

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Detalles de Instalación",
          headerShown: true,
          headerBackTitle: "Volver",
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Box className="items-center border-b border-outline-100 bg-background-50 p-6">
          <Box className="rounded-full bg-cyan-100 p-6">
            <Briefcase size={48} color="#0E7490" />
          </Box>
        </Box>

        <VStack space="xl" className="p-4">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-950">
              Mano de Obra / Instalación
            </Heading>
            {installation.systemType && (
              <Heading size="lg" className="font-medium text-cyan-700 italic">
                {installation.systemType}
              </Heading>
            )}
            <Text size="xl" className="mt-2 font-bold text-success-700">
              $ {fmt(installation.totalCost)}
            </Text>
          </VStack>

          <Card variant="outline" className="p-4">
            <VStack space="md">
              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-cyan-100 p-2">
                  <Users size={20} color="#0E7490" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Instaladores
                  </Text>
                  <Text size="md" className="font-bold">
                    {installation.numInstallers}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-blue-100 p-2">
                  <Clock size={20} color="#3B82F6" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Horas por Instalador
                  </Text>
                  <Text size="md" className="font-bold">
                    {installation.hoursPerInstaller} h
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center" space="md">
                <Box className="rounded-full bg-orange-100 p-2">
                  <Wrench size={20} color="#F97316" />
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Tarifa por Hora
                  </Text>
                  <Text size="md" className="font-bold">
                    $ {fmt(installation.hourlyRate)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          <VStack space="md">
            <Heading size="md" className="flex-row items-center">
              <Info size={20} className="mr-2 inline" /> Desglose de Costos
            </Heading>
            <VStack className="overflow-hidden rounded-lg border border-outline-100 bg-background-50">
              <SpecRow
                label="Mano de obra"
                value={`$ ${fmt(laborCost)}`}
                isOdd
              />
              <SpecRow
                label="Paneles instalados"
                value={`${installation.numPanels}`}
              />
              <SpecRow
                label="Costo por panel"
                value={`$ ${fmt(installation.installationCostPerPanel)}`}
                isOdd
              />
              <SpecRow
                label="Subtotal paneles"
                value={`$ ${fmt(panelCost)}`}
              />
              <SpecRow
                label="Costos adicionales"
                value={`$ ${fmt(installation.extraCosts)}`}
                isOdd
              />
              {installation.difficulty && (
                <SpecRow
                  label="Dificultad"
                  value={installation.difficulty}
                />
              )}
              {installation.systemType && (
                <SpecRow
                  label="Tipo de sistema"
                  value={installation.systemType}
                  isOdd={!installation.difficulty}
                />
              )}
            </VStack>
          </VStack>

          <Card variant="outline" className="bg-success-50 p-4">
            <HStack className="items-center justify-between">
              <Text size="md" className="font-bold text-success-800">
                Costo Total
              </Text>
              <Text size="xl" className="font-bold text-success-700">
                $ {fmt(installation.totalCost)}
              </Text>
            </HStack>
          </Card>
        </VStack>
      </ScrollView>
    </Box>
  );
}

function SpecRow({
  label,
  value,
  isOdd,
}: {
  label: string;
  value: string;
  isOdd?: boolean;
}) {
  return (
    <HStack
      className={`justify-between p-3 ${isOdd ? "bg-background-100" : ""}`}
    >
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
      <Text size="sm" className="font-bold">
        {value}
      </Text>
    </HStack>
  );
}
