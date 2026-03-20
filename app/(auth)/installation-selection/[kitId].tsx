import { LoadingAnimation } from "@/components/LoadingAnimation";
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  calculateLaborCost,
  estimateLaborParams,
  InstallationDifficulty,
  SystemType,
} from "@/utils/installation-calculations";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronDown, DollarSign, Hammer, Users } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function InstallationSelectionScreen() {
  const router = useRouter();
  const { kitId } = useLocalSearchParams<{ kitId: Id<"kits"> }>();

  const kit = useQuery(api.kits.getKitById, { id: kitId });
  const components = useQuery(api.kit_components.getKitComponents, { kitId });
  const updateKit = useMutation(api.kits.updateKit);
  const addInstallation = useMutation(api.kit_components.addInstallation);

  const [difficulty, setDifficulty] = useState<InstallationDifficulty>(InstallationDifficulty.RESIDENTIAL_SLOPED);
  const [systemType, setSystemType] = useState<SystemType>(SystemType.ON_GRID);
  const [numInstallers, setNumInstallers] = useState("2");
  const [hoursPerInstaller, setHoursPerInstaller] = useState("40");
  const [hourlyRate, setHourlyRate] = useState("25000");
  const [installationCostPerPanel, setInstallationCostPerPanel] = useState("50000");
  const [extraCosts, setExtraCosts] = useState("500000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const solarModuleComponent = components?.find((c) => c.type === "solar_module");
  const panelCount = solarModuleComponent?.quantity || 1; // Default to 1 if not found for calculation

  // Initial estimate based on kit data
  useEffect(() => {
    if (kit && components) {
      const initialDifficulty = kit.roofType === "thermoacoustic" || kit.roofType === "zinc" 
        ? InstallationDifficulty.INDUSTRIAL 
        : InstallationDifficulty.RESIDENTIAL_SLOPED;
      
      const initialSystemType = kit.type === "off-grid" ? SystemType.OFF_GRID 
        : kit.type === "hybrid" ? SystemType.HYBRID 
        : SystemType.ON_GRID;

      setDifficulty(initialDifficulty);
      setSystemType(initialSystemType);
    }
  }, [kit, components]);

  // Update estimates when difficulty or systemType change
  useEffect(() => {
    if (components) {
      const estimates = estimateLaborParams({
        difficulty,
        systemType,
        numPanels: panelCount,
      });

      setNumInstallers(estimates.numInstallers.toString());
      setHoursPerInstaller(estimates.hoursPerInstaller.toFixed(1));
      setHourlyRate(estimates.hourlyRate.toString());
      setInstallationCostPerPanel(estimates.installationCostPerPanel.toString());
      setExtraCosts(estimates.extraCosts.toString());
    }
  }, [difficulty, systemType, components, panelCount]);

  const totalLaborCost = useMemo(() => {
    return calculateLaborCost({
      numInstallers: Number(numInstallers) || 0,
      hoursPerInstaller: Number(hoursPerInstaller) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      numPanels: panelCount,
      installationCostPerPanel: Number(installationCostPerPanel) || 0,
      extraCosts: Number(extraCosts) || 0,
    });
  }, [numInstallers, hoursPerInstaller, hourlyRate, panelCount, installationCostPerPanel, extraCosts]);

  const handleConfirm = async () => {
    if (!kitId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addInstallation({
        kitId: kitId,
        numInstallers: Number(numInstallers),
        hoursPerInstaller: Number(hoursPerInstaller),
        hourlyRate: Number(hourlyRate),
        numPanels: panelCount,
        installationCostPerPanel: Number(installationCostPerPanel),
        extraCosts: Number(extraCosts),
        difficulty,
        systemType,
        totalCost: totalLaborCost,
      });

      await updateKit({
        id: kitId,
        status: "completed",
      });

      Alert.alert(
        "¡Instalación configurada!",
        "La mano de obra ha sido calculada y añadida al presupuesto del kit.",
        [
          {
            text: "Finalizar",
            onPress: () => router.replace("/(auth)/(tabs)/mykits"),
          },
        ],
      );
    } catch (error) {
      console.error("Error updating kit labor:", error);
      Alert.alert("Error", "No se pudo guardar la configuración de instalación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!kit || components === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <LoadingAnimation size={140} text="Cargando configuración..." />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: "Mano de Obra",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <VStack space="md">
            <Heading size="sm" className="text-typography-900 px-1">
              Factores de Instalación
            </Heading>
            
            <VStack space="xs">
              <Text size="xs" className="text-typography-500 font-bold uppercase px-1">
                Dificultad de la Instalación
              </Text>
              <Select
                selectedValue={difficulty}
                onValueChange={(value) => setDifficulty(value as InstallationDifficulty)}
              >
                <SelectTrigger variant="outline" size="xl" className="h-14">
                  <SelectInput placeholder="Selecciona dificultad" />
                  <SelectIcon className="mr-3" as={ChevronDown} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="Industrial / Cubierta Plana" value={InstallationDifficulty.INDUSTRIAL} />
                    <SelectItem label="Residencial Plana" value={InstallationDifficulty.RESIDENTIAL_FLAT} />
                    <SelectItem label="Residencial Inclinada" value={InstallationDifficulty.RESIDENTIAL_SLOPED} />
                    <SelectItem label="Montaña / Acceso Difícil" value={InstallationDifficulty.MOUNTAIN} />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>

            <VStack space="xs">
              <Text size="xs" className="text-typography-500 font-bold uppercase px-1">
                Tipo de Sistema
              </Text>
              <Select
                selectedValue={systemType}
                onValueChange={(value) => setSystemType(value as SystemType)}
              >
                <SelectTrigger variant="outline" size="xl" className="h-14">
                  <SelectInput placeholder="Selecciona tipo de sistema" />
                  <SelectIcon className="mr-3" as={ChevronDown} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="On-Grid (Conectado)" value={SystemType.ON_GRID} />
                    <SelectItem label="Off-Grid (Autónomo)" value={SystemType.OFF_GRID} />
                    <SelectItem label="Híbrido" value={SystemType.HYBRID} />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          </VStack>

          <VStack space="md">
            <Heading size="sm" className="text-typography-900 px-1">
              Personal y Tiempos
            </Heading>
            
            <HStack space="md">
              <VStack className="flex-1" space="xs">
                <Text size="xs" className="text-typography-500 font-bold uppercase px-1">
                  Instaladores
                </Text>
                <Input size="xl" className="h-14">
                  <InputField
                    className="py-1"
                    keyboardType="numeric"
                    value={numInstallers}
                    onChangeText={setNumInstallers}
                  />
                </Input>
              </VStack>
              <VStack className="flex-1" space="xs">
                <Text size="xs" className="text-typography-500 font-bold uppercase px-1">
                  Horas c/u
                </Text>
                <Input size="xl" className="h-14">
                  <InputField
                    className="py-1"
                    keyboardType="numeric"
                    value={hoursPerInstaller}
                    onChangeText={setHoursPerInstaller}
                  />
                </Input>
              </VStack>
            </HStack>

            <VStack space="xs">
              <Text size="xs" className="text-typography-500 font-bold uppercase px-1">
                Tarifa por Hora (COP)
              </Text>
              <Input size="xl" className="h-14">
                <InputField
                  className="py-1"
                  keyboardType="numeric"
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                />
              </Input>
            </VStack>
          </VStack>

          <VStack space="md">
            <Heading size="sm" className="text-typography-900 px-1">
              Materiales e Instalación
            </Heading>
            
            <VStack space="xs">
              <Text size="xs" className="text-typography-500 font-bold uppercase px-1">
                Costo Instalación por Panel ({panelCount} paneles)
              </Text>
              <Input size="xl" className="h-14">
                <InputField
                  className="py-1"
                  keyboardType="numeric"
                  value={installationCostPerPanel}
                  onChangeText={setInstallationCostPerPanel}
                />
              </Input>
            </VStack>

            <VStack space="xs">
              <Text size="xs" className="text-typography-500 font-bold uppercase px-1">
                Costos Extra (Permisos, transporte, etc.)
              </Text>
              <Input size="xl" className="h-14">
                <InputField
                  className="py-1"
                  keyboardType="numeric"
                  value={extraCosts}
                  onChangeText={setExtraCosts}
                />
              </Input>
            </VStack>
          </VStack>

          <Box className="rounded-xl bg-background-50 p-6 border border-outline-100">
            <Heading size="md" className="mb-4 text-center">Resumen del Cálculo</Heading>
            
            <VStack space="md">
              <HStack className="justify-between items-center">
                <HStack space="sm" className="items-center">
                  <Users size={16} color="#64748b" />
                  <Text size="sm">Costo del Personal</Text>
                </HStack>
                <Text size="sm" className="font-bold">
                  $ {Math.round(Number(numInstallers) * Number(hoursPerInstaller) * Number(hourlyRate)).toLocaleString('es-CO')}
                </Text>
              </HStack>

              <HStack className="justify-between items-center">
                <HStack space="sm" className="items-center">
                  < Hammer size={16} color="#64748b" />
                  <Text size="sm">Instalación de Paneles</Text>
                </HStack>
                <Text size="sm" className="font-bold">
                  $ {Math.round(panelCount * Number(installationCostPerPanel)).toLocaleString('es-CO')}
                </Text>
              </HStack>

              <HStack className="justify-between items-center">
                <HStack space="sm" className="items-center">
                  <DollarSign size={16} color="#64748b" />
                  <Text size="sm">Costos Adicionales</Text>
                </HStack>
                <Text size="sm" className="font-bold">
                  $ {Math.round(Number(extraCosts) || 0).toLocaleString('es-CO')}
                </Text>
              </HStack>

              <Box className="h-px bg-outline-200 my-2" />

              <HStack className="justify-between items-center">
                <Text size="lg" className="font-bold text-typography-900">Total Mano de Obra</Text>
                <Text size="xl" className="font-bold text-success-700">
                  $ {totalLaborCost.toLocaleString('es-CO')}
                </Text>
              </HStack>
            </VStack>
          </Box>

        </VStack>
      </ScrollView>

      <Box className="border-t border-outline-100 bg-white p-4 pb-8">
        <Button
          size="lg"
          className="w-full bg-primary-500"
          isDisabled={isSubmitting}
          onPress={handleConfirm}
        >
          <ButtonText>
            {isSubmitting ? "Guardando..." : "Confirmar y Finalizar Kit"}
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
