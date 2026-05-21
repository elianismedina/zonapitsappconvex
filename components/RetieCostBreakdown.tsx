/**
 * RETIE Cost Breakdown Component
 * 
 * Displays detailed cost breakdown including RETIE compliance costs
 * Shows equipment, labor, and regulatory compliance expenses
 */

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable } from 'react-native';

interface CostItem {
  label: string;
  amount: number;
  description?: string;
  subcategories?: { label: string; amount: number }[];
}

interface RetieCostBreakdownProps {
  equipmentCost: number;
  laborCost: number;
  retieCostBreakdown?: {
    groundingSystem: number;
    protectionDevices: number;
    disconnects: number;
    permitsAndInspection: number;
    documentation: number;
  };
  currency?: string;
  onlyShowRetie?: boolean; // Only show RETIE costs
}

export function RetieCostBreakdown({
  equipmentCost,
  laborCost,
  retieCostBreakdown,
  currency = 'COP',
  onlyShowRetie = false,
}: RetieCostBreakdownProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    equipment: false,
    labor: false,
    retie: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const retieCosts = retieCostBreakdown || {
    groundingSystem: 500,
    protectionDevices: 850,
    disconnects: 200,
    permitsAndInspection: 1000,
    documentation: 300,
  };

  const retieTotal =
    retieCosts.groundingSystem +
    retieCosts.protectionDevices +
    retieCosts.disconnects +
    retieCosts.permitsAndInspection +
    retieCosts.documentation;

  const grandTotal = equipmentCost + laborCost + retieTotal;

  const formatCurrency = (amount: number) => {
    if (currency === 'COP') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const CostRow = ({ label, amount, description }: { label: string; amount: number; description?: string }) => (
    <VStack gap={0.5}>
      <HStack justify-content="space-between" alignItems="center">
        <Text className="text-sm text-gray-700">{label}</Text>
        <Text className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</Text>
      </HStack>
      {description && (
        <Text className="text-xs text-gray-500">{description}</Text>
      )}
    </VStack>
  );

  const Section = ({
    title,
    items,
    total,
    sectionKey,
    highlighted = false,
  }: {
    title: string;
    items: (CostItem | { label: string; amount: number })[];
    total: number;
    sectionKey: string;
    highlighted?: boolean;
  }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <Box
        className={`rounded-lg overflow-hidden border ${
          highlighted
            ? 'border-amber-300 bg-amber-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        {/* Section Header */}
        <Pressable onPress={() => toggleSection(sectionKey)}>
          <HStack
            className={`p-3 justify-between items-center ${
              highlighted ? 'bg-amber-100' : 'bg-gray-100'
            }`}
            pressable
          >
            <VStack flex={1} gap={0.5}>
              <Text
                className={`font-semibold ${
                  highlighted ? 'text-amber-900' : 'text-gray-900'
                }`}
              >
                {title}
              </Text>
              {highlighted && (
                <Text className="text-xs text-amber-700">
                  These costs ensure regulatory compliance for operation
                </Text>
              )}
            </VStack>
            <VStack alignItems="flex-end" gap={0.5}>
              <Text className={`text-sm font-bold ${
                highlighted ? 'text-amber-900' : 'text-gray-900'
              }`}>
                {formatCurrency(total)}
              </Text>
              {isExpanded ? (
                <ChevronUp size={18} color={highlighted ? '#b45309' : '#666'} />
              ) : (
                <ChevronDown size={18} color={highlighted ? '#b45309' : '#666'} />
              )}
            </VStack>
          </HStack>
        </Pressable>

        {/* Section Items */}
        {isExpanded && (
          <VStack gap={2} className="p-3 border-t border-gray-200">
            {items.map((item, idx) => (
              <div key={idx}>
                {('subcategories' in item) ? (
                  <VStack gap={1}>
                    <HStack justify-content="space-between">
                      <Text className="text-sm font-medium text-gray-800">
                        {item.label}
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </Text>
                    </HStack>
                    {item.subcategories && (
                      <VStack gap={0.5} className="ml-3 border-l-2 border-gray-300 pl-2">
                        {item.subcategories.map((sub, subIdx) => (
                          <HStack
                            key={subIdx}
                            justify-content="space-between"
                            alignItems="center"
                          >
                            <Text className="text-xs text-gray-600">
                              {sub.label}
                            </Text>
                            <Text className="text-xs text-gray-700">
                              {formatCurrency(sub.amount)}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                ) : (
                  <CostRow
                    label={item.label}
                    amount={item.amount}
                    description={('description' in item) ? item.description : undefined}
                  />
                )}
              </div>
            ))}
          </VStack>
        )}
      </Box>
    );
  };

  if (onlyShowRetie) {
    return (
      <Card className="p-4 gap-3">
        <HStack gap={2} alignItems="flex-start">
          <AlertCircle size={18} color="#f59e0b" />
          <VStack flex={1} gap={2}>
            <Heading size="md">RETIE Compliance Costs</Heading>
            <Text className="text-sm text-gray-600">
              These costs are required by Colombian regulations for system inspection 
              and operation approval.
            </Text>
          </VStack>
        </HStack>

        <Section
          title="RETIE Compliance Breakdown"
          items={[
            {
              label: 'Grounding System',
              amount: retieCosts.groundingSystem,
              description: '2 copper ground rods + conductor',
            },
            {
              label: 'Protection Devices',
              amount: retieCosts.protectionDevices,
              description: 'Breakers, fuses, surge protectors',
            },
            {
              label: 'Disconnects & Wiring',
              amount: retieCosts.disconnects,
              description: 'DC/AC disconnects, rated wiring',
            },
            {
              label: 'Permits & Inspection',
              amount: retieCosts.permitsAndInspection,
              description: 'RETIE inspection fee + license',
            },
            {
              label: 'Documentation',
              amount: retieCosts.documentation,
              description: 'Single-line diagrams, specifications',
            },
          ]}
          total={retieTotal}
          sectionKey="retie-only"
          highlighted={true}
        />

        <Box className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <HStack justify-content="space-between">
            <Text className="text-sm font-semibold text-blue-900">
              Total RETIE Compliance:
            </Text>
            <Text className="text-lg font-bold text-blue-900">
              {formatCurrency(retieTotal)}
            </Text>
          </HStack>
        </Box>
      </Card>
    );
  }

  // Full breakdown
  return (
    <Card className="p-4 gap-3">
      <Heading size="lg">Project Cost Breakdown</Heading>

      <VStack gap={2}>
        {/* Equipment Section */}
        <Section
          title="Equipment Costs"
          items={[
            {
              label: 'Solar Panels, Inverter, Batteries, etc.',
              amount: equipmentCost,
            },
          ]}
          total={equipmentCost}
          sectionKey="equipment"
        />

        {/* Labor Section */}
        <Section
          title="Installation Labor"
          items={[
            {
              label: 'Professional installation (4-5 days)',
              amount: laborCost,
            },
          ]}
          total={laborCost}
          sectionKey="labor"
        />

        {/* RETIE Compliance Section (highlighted) */}
        <Section
          title="RETIE Compliance (Colombian Regulations)"
          items={[
            {
              label: 'Grounding System',
              amount: retieCosts.groundingSystem,
              description: '2 copper rods (2.4m) + conductor installation',
            },
            {
              label: 'Protection Devices',
              amount: retieCosts.protectionDevices,
              description: 'DC/AC breakers, string fuses, surge protectors',
            },
            {
              label: 'Disconnects & Wiring',
              amount: retieCosts.disconnects,
              description: 'Manual disconnects, rated electrical wiring',
            },
            {
              label: 'Permits & Inspection',
              amount: retieCosts.permitsAndInspection,
              description: 'RETIE license (Licencia Eléctrica) + inspection visit',
            },
            {
              label: 'Documentation',
              amount: retieCosts.documentation,
              description: 'Single-line diagrams, equipment specs, warranty docs',
            },
          ]}
          total={retieTotal}
          sectionKey="retie"
          highlighted={true}
        />
      </VStack>

      {/* Grand Total */}
      <Box className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4">
        <VStack gap={1}>
          <Text className="text-sm font-semibold text-blue-100">Total Project Cost</Text>
          <Text className="text-3xl font-bold text-white">
            {formatCurrency(grandTotal)}
          </Text>
          <Text className="text-xs text-blue-100 mt-2">
            Includes all equipment, labor, and regulatory compliance
          </Text>
        </VStack>
      </Box>

      {/* Cost Breakdown Info */}
      <Box className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <VStack gap={1}>
          <HStack justify-content="space-between">
            <Text className="text-xs text-gray-600">Equipment:</Text>
            <Text className="text-xs font-medium text-gray-900">
              {Math.round((equipmentCost / grandTotal) * 100)}%
            </Text>
          </HStack>
          <HStack justify-content="space-between">
            <Text className="text-xs text-gray-600">Labor:</Text>
            <Text className="text-xs font-medium text-gray-900">
              {Math.round((laborCost / grandTotal) * 100)}%
            </Text>
          </HStack>
          <HStack justify-content="space-between">
            <Text className="text-xs text-gray-600">RETIE Compliance:</Text>
            <Text className="text-xs font-medium text-amber-900">
              {Math.round((retieTotal / grandTotal) * 100)}%
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Card>
  );
}

export default RetieCostBreakdown;
