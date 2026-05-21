/**
 * RETIE Installation Checklist Component
 * 
 * Comprehensive checklist for installers to verify RETIE compliance
 * during and after solar system installation
 */

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable } from 'react-native';

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  checked: boolean;
  critical: boolean; // Must be done before operation
}

interface RetieInstallationChecklistProps {
  systemType: 'on_grid' | 'off_grid' | 'hybrid';
  onChecklistChange?: (checklist: ChecklistItem[]) => void;
}

const defaultChecklist = {
  on_grid: [
    // DC Side
    { id: 'dc-disconnect', category: 'DC Side', title: 'DC Array Disconnect installed', critical: true, checked: false },
    { id: 'dc-breaker', category: 'DC Side', title: 'DC Array Breaker (125% rule) installed', description: 'Per RETIE 16.2', critical: true, checked: false },
    { id: 'string-fuses', category: 'DC Side', title: 'String Fuses (156% rule) installed per string', description: 'Per RETIE 16.3', critical: true, checked: false },
    { id: 'dc-surge', category: 'DC Side', title: 'DC Surge Protector (Type 2) installed', description: 'Per RETIE 42.3', critical: true, checked: false },
    { id: 'dc-voltage-check', category: 'DC Side', title: 'DC maximum voltage ≤ system limit verified', critical: true, checked: false },
    { id: 'dc-voltage-drop', category: 'DC Side', title: 'DC cable voltage drop ≤ 3% verified', description: 'Per RETIE 41.2', critical: true, checked: false },
    { id: 'dc-terminals', category: 'DC Side', title: 'All DC terminals properly rated for voltage/current', critical: true, checked: false },

    // AC Side
    { id: 'ac-breaker', category: 'AC Side', title: 'AC Output Breaker (125% rule) installed', description: 'Per RETIE 16.2', critical: true, checked: false },
    { id: 'ac-surge', category: 'AC Side', title: 'AC Surge Protector (Type 2) installed', description: 'Per RETIE 42.3', critical: true, checked: false },
    { id: 'ac-voltage-drop', category: 'AC Side', title: 'AC cable voltage drop ≤ 3% verified', description: 'Per RETIE 41.2', critical: true, checked: false },
    { id: 'ac-terminals', category: 'AC Side', title: 'All AC terminals properly rated', critical: true, checked: false },
    { id: 'ac-disconnect', category: 'AC Side', title: 'AC Main Disconnect switch installed', critical: true, checked: false },

    // Grid Interconnection
    { id: 'grid-disconnect', category: 'Grid Interconnection', title: 'Grid Interconnect Disconnect installed', description: 'Per RETIE 42.1.2 (Required by utility)', critical: true, checked: false },
    { id: 'anti-islanding', category: 'Grid Interconnection', title: 'Anti-islanding protection verified', critical: true, checked: false },
    { id: 'utility-approval', category: 'Grid Interconnection', title: 'Utility company approval obtained', critical: true, checked: false },

    // Grounding
    { id: 'ground-rods', category: 'Grounding (RETIE 27)', title: 'Ground rods installed (minimum 2 × 2.4m copper)', critical: true, checked: false },
    { id: 'ground-resistance', category: 'Grounding (RETIE 27)', title: 'Ground resistance measured and < 25Ω', description: 'Use megohmmeter; must pass test', critical: true, checked: false },
    { id: 'ground-conductor', category: 'Grounding (RETIE 27)', title: 'Grounding conductor (#6 AWG minimum) properly installed', critical: true, checked: false },
    { id: 'bonding', category: 'Grounding (RETIE 27)', title: 'All metal frames bonded to ground bus', description: 'Frames, conduits, inverter chassis', critical: true, checked: false },
    { id: 'continuity-test', category: 'Grounding (RETIE 27)', title: 'Continuity test passed (< 0.1Ω between bonding points)', critical: true, checked: false },

    // Testing
    { id: 'insulation-test', category: 'Testing', title: 'Insulation resistance test (DC conductors > 1MΩ)', critical: true, checked: false },
    { id: 'breaker-test', category: 'Testing', title: 'Breaker/disconnect functionality tested', critical: true, checked: false },

    // Labeling & Documentation
    { id: 'component-labels', category: 'Documentation', title: 'All components labeled per RETIE 42.4', critical: false, checked: false },
    { id: 'disconnect-labels', category: 'Documentation', title: 'Main disconnect labeled with voltage, current, date', critical: false, checked: false },
    { id: 'single-line', category: 'Documentation', title: 'Single-line electrical diagram completed', critical: false, checked: false },
    { id: 'equipment-specs', category: 'Documentation', title: 'Equipment specifications recorded', critical: false, checked: false },
    { id: 'warranty', category: 'Documentation', title: 'Warranty documentation attached to system', critical: false, checked: false },
  ],
  hybrid: [
    // All on-grid items plus:
    { id: 'battery-disconnect', category: 'Battery (Hybrid)', title: 'DC Battery Disconnect installed', description: 'Between battery and inverter', critical: true, checked: false },
    { id: 'battery-protection', category: 'Battery (Hybrid)', title: 'Battery charge/discharge current protection rated', critical: true, checked: false },
    { id: 'battery-grounding', category: 'Battery (Hybrid)', title: 'Battery system grounding verified', critical: true, checked: false },
    { id: 'ats', category: 'Battery (Hybrid)', title: 'Automatic Transfer Switch (ATS) installed', critical: true, checked: false },
    { id: 'grid-battery-logic', category: 'Battery (Hybrid)', title: 'Grid-battery selector logic verified', critical: true, checked: false },
  ],
  off_grid: [
    { id: 'battery-disconnect', category: 'Battery (Off-Grid)', title: 'DC Battery Disconnect installed', critical: true, checked: false },
    { id: 'battery-breaker', category: 'Battery (Off-Grid)', title: 'Battery charge/discharge breaker installed', critical: true, checked: false },
    { id: 'dc-ac-converter', category: 'Inverter/Charger', title: 'DC-AC Inverter surge protection installed', critical: true, checked: false },
    { id: 'arc-fault', category: 'Safety', title: 'DC Arc Fault Detection (AFCI) installed', description: 'For string monitoring', critical: true, checked: false },
  ],
};

export function RetieInstallationChecklist({
  systemType,
  onChecklistChange,
}: RetieInstallationChecklistProps) {
  const baseChecklist = defaultChecklist[systemType] || [];
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    baseChecklist.map(item => ({ ...item }))
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleCheckItem = (id: string) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    onChecklistChange?.(updated);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Group by category
  const grouped = checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categories = Object.keys(grouped);
  const totalItems = checklist.length;
  const completedItems = checklist.filter(item => item.checked).length;
  const completedPercentage = Math.round((completedItems / totalItems) * 100);

  const criticalItems = checklist.filter(item => item.critical);
  const criticalCompleted = criticalItems.filter(item => item.checked).length;
  const allCriticalComplete = criticalCompleted === criticalItems.length;

  return (
    <Card className="p-4 gap-4">
      <VStack gap={3}>
        {/* Header */}
        <VStack gap={2}>
          <Heading size="lg">RETIE Installation Checklist</Heading>
          <Text className="text-sm text-gray-600">
            System Type: <Text className="font-semibold capitalize">{systemType.replace('_', ' ')}</Text>
          </Text>
        </VStack>

        {/* Progress */}
        <Box className="bg-blue-50 rounded-lg p-3">
          <VStack gap={2}>
            <HStack justify-content="space-between">
              <Text className="text-sm font-semibold text-blue-900">Overall Progress</Text>
              <Text className="text-sm font-bold text-blue-900">{completedPercentage}%</Text>
            </HStack>
            
            {/* Progress bar */}
            <Box className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <Box
                style={{
                  width: `${completedPercentage}%`,
                  height: '100%',
                  backgroundColor: completedPercentage === 100 ? '#22c55e' : '#3b82f6',
                }}
              />
            </Box>

            <Text className="text-xs text-blue-800">
              {completedItems} of {totalItems} items complete
            </Text>
          </VStack>
        </Box>

        {/* Critical Items Status */}
        <Box 
          className={`rounded-lg p-3 ${
            allCriticalComplete ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <HStack gap={2} alignItems="center">
            {allCriticalComplete ? (
              <CheckCircle2 size={16} color="#22c55e" />
            ) : (
              <AlertCircle size={16} color="#f59e0b" />
            )}
            <VStack flex={1}>
              <Text className={`text-xs font-semibold ${
                allCriticalComplete ? 'text-green-900' : 'text-amber-900'
              }`}>
                {allCriticalComplete ? '✓ All Critical Items Complete' : `⚠️ Critical Items: ${criticalCompleted}/${criticalItems.length}`}
              </Text>
              <Text className="text-xs text-gray-600">
                System cannot operate until all critical items are complete
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Checklist Items */}
        <VStack gap={2}>
          {categories.map(category => (
            <Box key={category}>
              {/* Category Header */}
              <Pressable onPress={() => toggleCategory(category)}>
                <HStack
                  className="p-3 bg-gray-100 rounded-lg justify-between items-center"
                  pressable
                >
                  <HStack gap={2} alignItems="center" flex={1}>
                    <Text className="font-semibold text-gray-900">{category}</Text>
                    <Text className="text-xs text-gray-600">
                      ({grouped[category].filter(i => i.checked).length}/{grouped[category].length})
                    </Text>
                  </HStack>
                  {expandedCategories[category] ? (
                    <ChevronUp size={18} color="#666" />
                  ) : (
                    <ChevronDown size={18} color="#666" />
                  )}
                </HStack>
              </Pressable>

              {/* Category Items */}
              {expandedCategories[category] && (
                <VStack gap={1} className="mt-1 ml-2 border-l-2 border-gray-300 pl-3">
                  {grouped[category].map(item => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleCheckItem(item.id)}
                      className="p-2 rounded hover:bg-gray-50"
                    >
                      <HStack gap={2} alignItems="flex-start">
                        <Checkbox
                          value={item.id}
                          isChecked={item.checked}
                          onChange={() => handleCheckItem(item.id)}
                          aria-label={item.title}
                        />
                        <VStack gap={0.5} flex={1}>
                          <HStack gap={1} alignItems="center">
                            <Text
                              className={`text-sm ${
                                item.checked
                                  ? 'text-gray-400 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </Text>
                            {item.critical && (
                              <Text className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                CRITICAL
                              </Text>
                            )}
                          </HStack>
                          {item.description && (
                            <Text className="text-xs text-gray-600">
                              {item.description}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              )}
            </Box>
          ))}
        </VStack>

        {/* Summary */}
        {completedPercentage === 100 && (
          <Box className="bg-green-50 rounded-lg p-3 border border-green-300">
            <Text className="text-sm font-semibold text-green-900 mb-1">
              ✅ Installation Complete
            </Text>
            <Text className="text-xs text-green-800">
              All RETIE compliance items have been verified. System is ready for 
              inspection and operation.
            </Text>
          </Box>
        )}
      </VStack>
    </Card>
  );
}

export default RetieInstallationChecklist;
