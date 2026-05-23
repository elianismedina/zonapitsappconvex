/**
 * Componente Tarjeta Info RETIE
 *
 * Muestra información ambiental y de cumplimiento específica para sistemas colombianos
 * Muestra factores tropicales, derating y por qué importan los ajustes RETIE
 */

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
    AlertTriangle,
    CloudRain,
    Droplets,
    Info,
    Sun,
    Thermometer,
} from 'lucide-react-native';
import React from 'react';

interface EnvironmentalFactors {
  ambientTemperature: number;
  relativeHumidity: number;
  soilingFactor: number;
  panelDerating: number;
  batteryDerating: number;
  totalDerating: number;
}

interface RetieInfoCardProps {
  factors?: EnvironmentalFactors;
  compact?: boolean; // Show minimal version
  showTechnicalDetails?: boolean;
}

const defaultFactors: EnvironmentalFactors = {
  ambientTemperature: 40,
  relativeHumidity: 80,
  soilingFactor: 0.92,
  panelDerating: 0.94,
  batteryDerating: 0.88,
  totalDerating: 0.86,
};

export function RetieInfoCard({
  factors = defaultFactors,
  compact = false,
  showTechnicalDetails = true,
}: RetieInfoCardProps) {
  const totalDeratingPercent = Math.round((1 - factors.totalDerating) * 100);
  const panelDeratingPercent = Math.round((1 - factors.panelDerating) * 100);

  if (compact) {
    return (
      <Card className="p-3 bg-blue-50 border border-blue-200">
        <HStack className="gap-2">
          <Info size={16} color="#3b82f6" />
          <VStack className="flex-1 gap-1">
            <Text className="text-xs font-semibold text-blue-900">
              Ajuste Tropical Colombiano
            </Text>
            <Text className="text-xs text-blue-700">
              Tu sistema es {totalDeratingPercent}% más grande para compensar temperatura
              y suciedad—esto asegura rendimiento constante todo el año.
            </Text>
          </VStack>
        </HStack>
      </Card>
    );
  }

  return (
    <Card className="p-4 gap-4">
      <VStack gap={3}>
        {/* Header */}
        <HStack gap={2} alignItems="center">
          <Sun size={20} color="#ea580c" />
          <Heading size="md">Consideraciones Climáticas de Colombia</Heading>
        </HStack>

        {/* Environmental Conditions */}
        <Box className="bg-orange-50 rounded-lg p-3">
          <Text className="text-xs font-semibold text-orange-900 mb-2">
            CONDICIONES AMBIENTALES
          </Text>

          <VStack gap={2}>
            {/* Temperature */}
            <HStack gap={2} alignItems="flex-start">
              <Thermometer size={16} color="#f97316" className="mt-0.5" />
              <VStack gap={0.5} flex={1}>
                <Text className="text-xs font-medium text-gray-700">
                  Temperatura Ambiente
                </Text>
                <Text className="text-sm text-gray-900">
                  {factors.ambientTemperature}°C máxima
                </Text>
                <Text className="text-xs text-gray-600">
                  Típico para altiplanos colombianos; reduce eficiencia del panel en ~{panelDeratingPercent}%
                </Text>
              </VStack>
            </HStack>

            {/* Humidity */}
            <HStack gap={2} alignItems="flex-start">
              <Droplets size={16} color="#f97316" className="mt-0.5" />
              <VStack gap={0.5} flex={1}>
                <Text className="text-xs font-medium text-gray-700">
                  Humedad Relativa
                </Text>
                <Text className="text-sm text-gray-900">
                  {Math.round(factors.relativeHumidity * 100)}% promedio
                </Text>
                <Text className="text-xs text-gray-600">
                  Alta humedad aumenta suciedad y riesgo de corrosión
                </Text>
              </VStack>
            </HStack>

            {/* Soiling */}
            <HStack gap={2} alignItems="flex-start">
              <CloudRain size={16} color="#f97316" className="mt-0.5" />
              <VStack gap={0.5} flex={1}>
                <Text className="text-xs font-medium text-gray-700">
                  Factor de Suciedad Tropical
                </Text>
                <Text className="text-sm text-gray-900">
                  {Math.round((1 - factors.soilingFactor) * 100)}% pérdida de energía/año
                </Text>
                <Text className="text-xs text-gray-600">
                  Acumulación de polvo, polen y humedad en trópicos
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* System Derating Applied */}
        {showTechnicalDetails && (
          <Box className="bg-blue-50 rounded-lg p-3">
            <Text className="text-xs font-semibold text-blue-900 mb-2">
              DERATING APLICADO AL SISTEMA
            </Text>

            <VStack gap={2}>
              <HStack justify-content="space-between">
                <Text className="text-sm text-gray-700">Pérdida por suciedad:</Text>
                <Text className="text-sm font-medium text-gray-900">
                  -{Math.round((1 - factors.soilingFactor) * 100)}%
                </Text>
              </HStack>

              <HStack justify-content="space-between">
                <Text className="text-sm text-gray-700">Derating por temperatura (paneles):</Text>
                <Text className="text-sm font-medium text-gray-900">
                  -{panelDeratingPercent}%
                </Text>
              </HStack>

              <HStack justify-content="space-between">
                <Text className="text-sm text-gray-700">Batería @ 40°C:</Text>
                <Text className="text-sm font-medium text-gray-900">
                  -{Math.round((1 - factors.batteryDerating) * 100)}%
                </Text>
              </HStack>

              <Box className="border-t border-blue-200 pt-2 mt-1">
                <HStack justify-content="space-between">
                  <Text className="text-sm font-semibold text-blue-900">
                    Derating Total del Sistema:
                  </Text>
                  <Text className="text-sm font-semibold text-orange-600">
                    -{totalDeratingPercent}%
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Why This Matters */}
        <Box className="bg-green-50 rounded-lg p-3 border border-green-200">
          <HStack gap={2} alignItems="flex-start">
            <AlertTriangle size={16} color="#16a34a" className="mt-0.5" />
            <VStack gap={1} flex={1}>
              <Text className="text-xs font-semibold text-green-900">
                POR QUÉ IMPORTANTE
              </Text>
              <Text className="text-xs text-green-800">
                Estos ajustes aseguran que tu sistema esté dimensionado correctamente para
                cumplir tus necesidades energéticas incluso en condiciones extremas. Un sistema
                diseñado solo para condiciones ideales tendría bajo rendimiento durante calor
                extremo, temporadas secas o períodos de alto polvo.
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* RETIE Standard Note */}
        <Box className="bg-gray-50 rounded-lg p-3 border border-gray-300">
          <Text className="text-xs font-semibold text-gray-700 mb-1">
            CUMPLIMIENTO RETIE
          </Text>
          <Text className="text-xs text-gray-600">
            Estos cálculos siguen el RETIE (Reglamento Técnico de Instalaciones
            Eléctricas) Artículo 42 e incorporan estándares ambientales colombianos.
            Esto asegura que tu sistema cumpla requisitos técnicos para aprobación de
            inspección y validación de garantía.
          </Text>
        </Box>
      </VStack>
    </Card>
  );
}

export default RetieInfoCard;