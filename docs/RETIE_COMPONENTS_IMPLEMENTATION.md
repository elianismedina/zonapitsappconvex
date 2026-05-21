# RETIE UI Components - Implementation Guide

## Quick Start

All Phase 1 components are ready to use. Here's how to integrate them:

## 1. RetieComplianceBadge - Status Indicator

### Basic Usage
```typescript
import RetieComplianceBadge from '@/components/RetieComplianceBadge';

// Show compliant status
<RetieComplianceBadge status="compliant" />
// ✅ RETIE Compliant

// Show warnings
<RetieComplianceBadge status="warnings" count={2} />
// ⚠️ 2 issues

// Non-compliant
<RetieComplianceBadge status="non-compliant" />
// ❌ Non-Compliant
```

### Advanced Usage
```typescript
<RetieComplianceBadge 
  status="warnings" 
  count={compliance.issues.length}
  size="md"
  showLabel={true}
  detailed={true}
/>
```

### Props
- `status: 'compliant' | 'warnings' | 'non-compliant' | 'pending'` ✓
- `count?: number` - number of issues
- `size?: 'sm' | 'md' | 'lg'` - badge size
- `showLabel?: boolean` - show/hide label
- `detailed?: boolean` - show detailed description

---

## 2. RetieInfoCard - Environmental Information

### Basic Usage
```typescript
import RetieInfoCard from '@/components/RetieInfoCard';

<RetieInfoCard />
// Shows default Colombian tropical factors
```

### With Custom Data
```typescript
<RetieInfoCard 
  factors={{
    ambientTemperature: 40,
    relativeHumidity: 0.80,
    soilingFactor: 0.92,
    panelDerating: 0.94,
    batteryDerating: 0.88,
    totalDerating: 0.86,
  }}
/>
```

### Compact Version
```typescript
<RetieInfoCard 
  compact={true}
  showTechnicalDetails={false}
/>
// Quick explanation without technical details
```

### Props
- `factors?: EnvironmentalFactors` - custom factors from sizing
- `compact?: boolean` - minimal view
- `showTechnicalDetails?: boolean` - show technical breakdown

---

## 3. RetieInstallationChecklist - Verification Checklist

### Basic Usage
```typescript
import RetieInstallationChecklist from '@/components/RetieInstallationChecklist';

<RetieInstallationChecklist 
  systemType="on_grid"
  onChecklistChange={(checklist) => {
    // Save checklist state
    console.log('Checklist updated:', checklist);
  }}
/>
```

### Supported System Types
- `'on_grid'` - Grid-connected systems
- `'off_grid'` - Standalone battery systems
- `'hybrid'` - Grid + Battery systems

### Features
- ✓ Expandable/collapsible categories
- ✓ Progress tracking (percentage)
- ✓ Critical items highlighted
- ✓ Checkbox state management
- ✓ Prevents operation until critical items done

### Props
- `systemType: 'on_grid' | 'off_grid' | 'hybrid'` ✓
- `onChecklistChange?: (checklist: ChecklistItem[]) => void`

---

## 4. RetieCostBreakdown - Cost Breakdown

### Full Breakdown
```typescript
import RetieCostBreakdown from '@/components/RetieCostBreakdown';

<RetieCostBreakdown 
  equipmentCost={15900}
  laborCost={6000}
  retieCostBreakdown={{
    groundingSystem: 1750000,
    protectionDevices: 2975000,
    disconnects: 700000,
    permitsAndInspection: 3500000,
    documentation: 1050000,
  }}
  currency="COP"
/>
```

### RETIE-Only Breakdown
```typescript
<RetieCostBreakdown 
  equipmentCost={0}
  laborCost={0}
  retieCostBreakdown={{...}}
  onlyShowRetie={true}
/>
// Shows just RETIE compliance costs
```

### Usage with Colombian Pesos (Default)
```typescript
<RetieCostBreakdown 
  equipmentCost={55000000}
  laborCost={21000000}
  retieCostBreakdown={{
    groundingSystem: 1750000,
    protectionDevices: 2975000,
    disconnects: 700000,
    permitsAndInspection: 3500000,
    documentation: 1050000,
  }}
  // currency="COP" is default
/>
```

### Props
- `equipmentCost: number` ✓
- `laborCost: number` ✓
- `retieCostBreakdown?: {...}` - custom costs
- `currency?: 'COP'` - Colombian pesos (default and recommended)
- `onlyShowRetie?: boolean` - show only RETIE section

---

## Integration Scenarios

### Scenario 1: Add Compliance Badge to KitCard

**File**: `components/mykits/KitCard.tsx`

```typescript
import RetieComplianceBadge from '@/components/RetieComplianceBadge';

export interface KitCardProps {
  kit: Doc<'kits'>;
  retieCompliance?: {
    status: 'compliant' | 'warnings' | 'non-compliant';
    issues: string[];
    complianceCost: number;
  };
}

export function KitCard({ kit, retieCompliance }: KitCardProps) {
  return (
    <Card>
      {/* Existing kit info */}
      
      {/* NEW: Add RETIE badge */}
      {retieCompliance && (
        <VStack className="mt-4 gap-2 p-3 bg-amber-50 rounded-lg">
          <RetieComplianceBadge 
            status={retieCompliance.status}
            count={retieCompliance.issues.length}
          />
          
          {/* Show any issues */}
          {retieCompliance.issues.map((issue, i) => (
            <Text key={i} className="text-sm text-amber-700">
              • {issue}
            </Text>
          ))}
          
          {/* Show cost */}
          <Text className="text-xs text-gray-600 mt-2">
            RETIE Compliance: +${retieCompliance.complianceCost}
          </Text>
        </VStack>
      )}
    </Card>
  );
}

// Usage in mykits screen:
// <KitCard 
//   kit={kit} 
//   retieCompliance={{
//     status: 'compliant',
//     issues: [],
//     complianceCost: 950,
//   }}
// />
```

---

### Scenario 2: Create Sizing Results Screen

**File**: `app/(auth)/sizing-results.tsx` (NEW)

```typescript
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import RetieInfoCard from '@/components/RetieInfoCard';
import RetieCostBreakdown from '@/components/RetieCostBreakdown';
import { ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';

export default function SizingResults() {
  const { kitId } = useLocalSearchParams();
  const sizing = useQuery(api.sizing.calculateSizingWithRetie, { kitId });
  
  if (!sizing) return <LoadingAnimation />;
  
  return (
    <ScrollView className="flex-1 bg-white">
      <VStack className="p-4 gap-4">
        <Heading size="lg">Sizing Calculation Results</Heading>
        
        {/* Show original vs RETIE comparison */}
        <ComparisonCard 
          original={sizing.dailyDemandKwh}
          retie={{...sizing.retieEnvironmentalFactors}}
          panelsNeeded={{
            original: sizing.originalSizingOptions[0]?.panelsNeeded,
            retie: sizing.retieCompliantOptions[0]?.panelsNeeded,
          }}
        />
        
        {/* Environmental factors explanation */}
        <RetieInfoCard 
          factors={sizing.retieEnvironmentalFactors}
          showTechnicalDetails={true}
        />
        
        {/* Cost breakdown */}
        <RetieCostBreakdown 
          equipmentCost={calculateEquipmentCost(sizing)}
          laborCost={estimateLaborCost(sizing)}
          retieCostBreakdown={{
            groundingSystem: 1750000,
            protectionDevices: 2975000,
            disconnects: 700000,
            permitsAndInspection: 3500000,
            documentation: 1050000,
          }}
          currency="COP"
        />
        
        <Button action="primary" onPress={() => router.push('...')}>
          <ButtonText>Continue to Component Selection</ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}
```

---

### Scenario 3: Show Compliance in Component Selection

**File**: `app/(auth)/inverter-selection/[kitId].tsx`

```typescript
// Add to existing inverter card
const ComponentCard = ({ inverter, retieCompliance }) => {
  return (
    <Card>
      {/* Existing specs */}
      <Heading size="md">{inverter.brand} {inverter.model}</Heading>
      
      {/* NEW: Add RETIE compliance section */}
      {retieCompliance && (
        <VStack className="mt-4 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <HStack gap={1} alignItems="center">
            <RetieComplianceBadge 
              status={retieCompliance.status} 
              size="sm"
            />
          </HStack>
          
          <VStack gap={1} className="text-xs text-blue-900">
            <Text>Required AC Breaker: {retieCompliance.acBreaker.size}A</Text>
            <Text>Wire Gauge: {retieCompliance.acWireGauge.gauge}</Text>
            <Text>Voltage Drop: {retieCompliance.acWireGauge.voltageDropPercent.toFixed(1)}%</Text>
            
            {retieCompliance.gridInterconnectRequired && (
              <Text className="text-amber-700">⚠️ Grid disconnect required</Text>
            )}
          </VStack>
        </VStack>
      )}
    </Card>
  );
};
```

---

### Scenario 4: Installer Screen with Checklist

**File**: `app/(auth)/(installer)/verification.tsx` (NEW)

```typescript
import RetieInstallationChecklist from '@/components/RetieInstallationChecklist';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { useState } from 'react';

export default function InstallerVerification() {
  const { kitId } = useLocalSearchParams();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const router = useRouter();
  
  const handleComplete = async () => {
    // Save checklist to Convex
    await saveSizingCompletion({ kitId, checklist });
    
    // Generate PDF certificate
    const pdf = generateComplianceCertificate(checklist);
    
    router.push(`/certificate/${kitId}`);
  };
  
  return (
    <ScrollView className="flex-1 bg-white">
      <VStack className="p-4 gap-4">
        <Heading size="lg">Installation Verification</Heading>
        
        <RetieInstallationChecklist 
          systemType="on_grid"
          onChecklistChange={setChecklist}
        />
        
        <Button 
          action="primary" 
          onPress={handleComplete}
          disabled={checklist.some(c => c.critical && !c.checked)}
        >
          <ButtonText>Complete Installation</ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}
```

---

## Data Requirements

### For RetieComplianceBadge
```typescript
{
  status: 'compliant' | 'warnings' | 'non-compliant';
  issues?: string[]; // List of issues
  count?: number;    // Number of issues
}
```

### For RetieInfoCard
```typescript
{
  ambientTemperature: 40,
  relativeHumidity: 0.80,
  soilingFactor: 0.92,
  panelDerating: 0.94,
  batteryDerating: 0.88,
  totalDerating: 0.86,
}
```

### For RetieInstallationChecklist
```typescript
{
  systemType: 'on_grid' | 'off_grid' | 'hybrid';
  // Component manages internal state
}
```

### For RetieCostBreakdown
```typescript
{
  equipmentCost: number;
  laborCost: number;
  retieCostBreakdown: {
    groundingSystem: number;    // in COP
    protectionDevices: number;  // in COP
    disconnects: number;        // in COP
    permitsAndInspection: number; // in COP
    documentation: number;      // in COP
  };
  currency?: string; // defaults to 'COP'
}
```

---

## Styling Notes

All components use:
- ✅ Gluestack UI components (Box, Card, VStack, HStack, Text, Heading)
- ✅ NativeWind classes (className="...")
- ✅ Consistent spacing and sizing
- ✅ Color scheme matching app theme
- ✅ Responsive sizing

### Color Scheme Used
- Green (#22c55e) - Compliant/Success
- Amber (#f59e0b) - Warnings/Attention
- Red (#ef4444) - Non-compliant/Errors
- Blue (#3b82f6) - Information
- Gray (#6b7280) - Neutral

---

## Testing Checklist

Before using in production:

- [ ] Badge displays correctly in all 4 states
- [ ] Info card shows derating percentages correctly
- [ ] Checklist checkboxes toggle state
- [ ] Checklist progress bar updates
- [ ] Critical items prevent completion
- [ ] Cost breakdown totals calculate correctly
- [ ] Currency formatting works (COP)
- [ ] All components are responsive
- [ ] Text is readable on mobile
- [ ] Components follow gluestack UI patterns

---

## Common Issues & Solutions

### Issue: TypeScript errors with props
**Solution**: Import component types from component file
```typescript
import type { RetieComplianceBadgeProps } from '@/components/RetieComplianceBadge';
```

### Issue: Components not appearing styled
**Solution**: Ensure NativeWind is working in your setup
```bash
npm run build:nativewind
```

### Issue: Checkbox not clickable in checklist
**Solution**: Wrap the entire HStack in Pressable
```typescript
<Pressable onPress={() => handleCheckItem(item.id)}>
  <HStack>
    <Checkbox ... />
    <Text>...</Text>
  </HStack>
</Pressable>
```

---

## Next Phase Components

After integration, Phase 2 will involve:
- System summary screen combining all RETIE data
- PDF export functionality
- Installer sign-off form
- Photo verification upload
- Compliance monitoring dashboard
