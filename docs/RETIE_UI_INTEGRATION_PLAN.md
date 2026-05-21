# RETIE UI Integration Plan

## Overview
This document outlines the UI components and screens needed to fully integrate RETIE compliance throughout the app user journey.

## Integration Points

### 1. **Home/My Kits Screen** - Show RETIE Compliance Status
**Location**: `app/(auth)/(tabs)/mykits.tsx` → `components/mykits/KitCard.tsx`

**Add to KitCard:**
```
┌─────────────────────────────────┐
│ System Overview                  │
├─────────────────────────────────┤
│ 🏠 10kW Solar System             │
│ 📍 Bogotá, Colombia              │
├─────────────────────────────────┤
│ ✅ RETIE Compliant               │ ← NEW: Compliance badge
│ • DC Voltage: 480V ✓             │
│ • Breaker: 60A (125% rule) ✓     │
│ • Grounding: 15Ω < 25Ω ✓         │ ← NEW: Compliance details
├─────────────────────────────────┤
│ Cost: $45,000,000 COP           │
│ + RETIE Compliance: $3,325,000  │ ← NEW: Compliance cost
└─────────────────────────────────┘
```

### 2. **Sizing Results Screen** - Show RETIE Adjustments
**Location**: NEW - `app/(auth)/sizing-results.tsx`

**Show Original vs RETIE:**
```
Sizing Calculation Results

Original Sizing (Nominal):
  → 20 panels @ 400W = 8kW

⚠️ Colombian Tropical Conditions:
  → 8% soiling factor
  → 6% temperature derating (-6% @ 40°C)
  → Total derating: 14%

✅ RETIE Adjusted Sizing:
  → 23 panels @ 400W = 9.2kW
  → Ensures system passes inspection

Environmental factors considered:
  ├─ Ambient temperature: 40°C
  ├─ Relative humidity: 80%
  ├─ Altitude: 2,600m (Bogotá)
  └─ Tropical soiling: High
```

### 3. **Component Selection** - Add RETIE Compliance Checks
**Location**: `app/(auth)/inverter-selection/[kitId].tsx` etc.

**Add to Component Cards:**
```
┌─────────────────────────────────┐
│ Fronius Primo 5kW Inverter      │
├─────────────────────────────────┤
│ Specs:                           │
│ • Power: 5kW                     │
│ • Voltage: 240V AC               │
│ • Price: $3,200                  │
├─────────────────────────────────┤
│ ✅ RETIE Status                  │ ← NEW: Compliance check
│ ✅ Compatible with 23 panels     │
│ ⚠️ Requires AC Breaker: 100A     │
│    (125% of 65A output)          │
│ ⚠️ Wire gauge: 4 AWG (copper)    │
│ ⚠️ Voltage drop: 2.8% ✓          │
│ ⚠️ Grid disconnect required      │
│                                  │
│ Compliance issues: None          │
└─────────────────────────────────┘
```

### 4. **Cost Breakdown** - Include RETIE Costs
**Location**: `components/mykits/KitCard.tsx` → Expand pricing section

```
Project Cost Breakdown

Equipment Costs:
  ├─ Solar Panels (23 × 400W): $28,650,000
  ├─ Inverter: $11,200,000
  ├─ Battery (if hybrid): $15,750,000
  └─ Subtotal: $55,600,000

Installation Labor: $21,000,000

RETIE Compliance Costs: $4,200,000 ← NEW
  ├─ Grounding system: $1,750,000
  ├─ Protection devices: $1,190,000
  │  (breakers, fuses, surge protectors)
  ├─ Disconnects & wiring: $700,000
  └─ Permits & inspection: $525,000

Total Project Cost: $80,800,000
```

### 5. **Installer Checklist** - RETIE Verification
**Location**: NEW - `components/RetieInstallationChecklist.tsx`

```
RETIE Installation Verification Checklist

System: Solar 8kW On-Grid (Bogotá)
Date: May 21, 2026
Installer: [Name]

DC Side:
☐ Array disconnect installed
☐ Array breaker: 60A (per RETIE 125% rule)
☐ String fuses: 15A each (per RETIE 156% rule)
☐ DC surge protector (Type 2) installed
☐ DC voltage ≤ 480V ✓
☐ Voltage drop on DC cables ≤ 3% verified
☐ All DC terminals properly rated

AC Side:
☐ AC output breaker: 100A installed
☐ AC surge protector (Type 2) installed
☐ AC voltage drop ≤ 3% verified
☐ All AC terminals properly rated
☐ Grid interconnect disconnect installed (RETIE 42.1.2)

Grounding (RETIE 27):
☐ Ground resistance measured: _____ Ω (must be < 25Ω)
☐ Ground rods installed (minimum 2)
☐ Grounding conductor: #6 AWG copper
☐ All bonding connections verified
☐ Continuity test passed (< 0.1Ω)

Documentation:
☐ Single-line diagram completed
☐ Equipment specifications recorded
☐ Warranty documentation attached
☐ Customer training completed
☐ RETIE inspection permit displayed

Warnings/Notes:
[Text field for any deviations]

Inspector Signature: ________________ Date: _______
```

### 6. **Compliance Badge Component** - Reusable Status Indicator
**Location**: NEW - `components/ui/RetieComplianceBadge.tsx`

```typescript
// Usage:
<RetieComplianceBadge status="compliant" />
// Shows: ✅ RETIE COMPLIANT (green)

<RetieComplianceBadge status="warnings" count={2} />
// Shows: ⚠️ 2 WARNINGS (yellow)

<RetieComplianceBadge status="non-compliant" />
// Shows: ❌ NON-COMPLIANT (red)
```

### 7. **RETIE Info Card** - Environmental & Compliance Info
**Location**: NEW - `components/RetieInfoCard.tsx`

```
Colombian Tropical Climate Factors

🌍 Location: Bogotá, Colombia (2,600m)
🌡️ Ambient Temp: 40°C peak
💧 Humidity: 80% average
☀️ UV Exposure: High year-round

System Derating Applied:
  ├─ Soiling (dust/humidity): -8%
  ├─ Temperature @ 40°C: -6%
  ├─ Panel aging factor: -2% (year 1)
  └─ Total applied: ~15%

This is why your system is 23 panels
instead of 20 - it ensures reliable
production year-round!

Learn more about RETIE requirements →
```

### 8. **System Summary Screen** - Show All RETIE Data
**Location**: NEW - `app/(auth)/kit-summary/[kitId].tsx`

```
📊 Complete System Summary

Configuration:
  ├─ Panels: 23 × Trina 400W = 9.2kW
  ├─ Inverter: Fronius Primo 5kW
  ├─ Batteries: LiFePO4 48V 10kWh (hybrid)
  └─ Location: Bogotá, Colombia

Protection Devices (RETIE):
  ├─ DC Breaker: 60A @ 600V
  ├─ String Fuses: 15A (×4 strings)
  ├─ AC Breaker: 100A @ 240V
  ├─ Surge Protectors: 2 (DC + AC Type 2)
  └─ Grid Disconnect: Required

Grounding System (RETIE):
  ├─ Ground rods: 2 × 2.4m copper
  ├─ Grounding conductor: #6 AWG
  ├─ Target resistance: < 25Ω
  └─ Status: [Pending installation]

Environmental Factors:
  ├─ Temperature derating: -6%
  ├─ Soiling derating: -8%
  ├─ Winter capacity: 7.2kW min
  └─ Summer capacity: 9.2kW max

Cost Summary:
  ├─ Equipment: $15,900
  ├─ Labor: $6,000
  ├─ RETIE compliance: $1,200
  └─ Total: $23,100
```

---

## Component Creation Priority

### **Phase 1** (Critical Path - Foundation)
- [ ] `RetieComplianceBadge` - Status indicator
- [ ] `RetieInfoCard` - Environmental info display
- [ ] Update `KitCard.tsx` - Add compliance badge + cost breakdown
- [ ] Create sizing-results screen - Show RETIE adjustments

### **Phase 2** (Component Details)
- [ ] Update inverter-selection screen - Add compliance warnings
- [ ] Update battery-selection screen - Add temperature derating
- [ ] Update panel-selection screen - Show RETIE-adjusted sizing
- [ ] Create system-summary screen - Complete RETIE overview

### **Phase 3** (Installer Tools)
- [ ] `RetieInstallationChecklist` - Verification checklist
- [ ] Create installer-checklist screen
- [ ] Add PDF export for checklist
- [ ] Add photo upload for verification

### **Phase 4** (Advanced)
- [ ] RETIE compliance report PDF generation
- [ ] Warning notification system
- [ ] Compliance monitoring dashboard
- [ ] Integration with permitting system

---

## Data Flow Integration

```
calculateSizingWithRetie (Convex)
    ↓
    ├─ Returns: original + RETIE sizing options
    ├─ Returns: environmental derating factors
    ├─ Returns: required protection devices
    └─ Returns: compliance cost breakdown
    ↓
Home Screen
    ├─ Display RETIE badge on kit card
    ├─ Show compliance cost in total
    └─ Show RETIE warnings/issues
    ↓
Component Selection
    ├─ Check compatibility with RETIE constraints
    ├─ Show required breaker/wire sizes
    ├─ Display voltage drop verification
    └─ Show installer recommendations
    ↓
Kit Summary
    ├─ Complete RETIE specification sheet
    ├─ Installation checklist
    ├─ Cost breakdown with RETIE
    └─ Export documentation
```

---

## Implementation Examples

### Example 1: Update KitCard with RETIE Badge
```typescript
// In components/mykits/KitCard.tsx

interface KitCardProps {
  kit: Doc<'kits'>;
  // Add new prop:
  retieCompliance?: {
    status: 'compliant' | 'warnings' | 'non-compliant';
    issues: string[];
    complianceCost: number;
  };
}

export function KitCard({ kit, retieCompliance, ...props }: KitCardProps) {
  return (
    <Card>
      {/* Existing card content */}
      
      {/* NEW: RETIE Compliance Section */}
      {retieCompliance && (
        <VStack className="mt-4 p-3 bg-amber-50 rounded-lg">
          <RetieComplianceBadge 
            status={retieCompliance.status}
            count={retieCompliance.issues.length}
          />
          {retieCompliance.issues.map((issue, i) => (
            <Text key={i} className="text-sm text-amber-700">
              • {issue}
            </Text>
          ))}
          <Text className="text-xs text-gray-600 mt-2">
            +${retieCompliance.complianceCost.toLocaleString()} for compliance
          </Text>
        </VStack>
      )}
      
      {/* Existing price display */}
    </Card>
  );
}
```

### Example 2: New Sizing Results Screen
```typescript
// New file: app/(auth)/sizing-results.tsx

export default function SizingResults() {
  const { kitId } = useLocalSearchParams();
  const sizing = useQuery(api.sizing.calculateSizingWithRetie, { kitId });
  
  if (!sizing) return <LoadingAnimation />;
  
  return (
    <ScrollView className="p-4">
      <Heading size="lg" className="mb-4">Sizing Results</Heading>
      
      {/* Original vs RETIE comparison */}
      <ComparisonCard
        original={sizing.dailyDemandKwh}
        retie={sizing.retieEnvironmentalFactors}
        modules={sizing.retieCompliantOptions}
      />
      
      {/* Environmental factors */}
      <EnvironmentalFactorsCard 
        factors={sizing.retieEnvironmentalFactors}
      />
      
      {/* Compliance info */}
      <RetieInfoCard />
      
      <Button action="primary" onPress={() => proceedToSelection()}>
        <ButtonText>Continue to Component Selection</ButtonText>
      </Button>
    </ScrollView>
  );
}
```

---

## Props/Data Structures Needed

### RetieComplianceInfo
```typescript
interface RetieComplianceInfo {
  status: 'compliant' | 'warnings' | 'non-compliant';
  issues: {
    type: 'voltage_drop' | 'breaker_size' | 'grounding' | 'temperature';
    message: string;
    severity: 'warning' | 'error';
  }[];
  recommendations: string[];
  protectionDevices: {
    dcBreaker: { size: number; rating: string };
    acBreaker: { size: number; rating: string };
    stringFuses: { size: number; rating: string; quantity: number };
    dcSurgeProtector: boolean;
    acSurgeProtector: boolean;
  };
  costBreakdown: {
    grounding: number;
    protectionDevices: number;
    disconnects: number;
    permits: number;
    total: number;
  };
}
```

---

## Next Steps

1. **Create base UI components** (Phase 1)
   - Start with `RetieComplianceBadge` - simplest, most reusable
   - Then `RetieInfoCard` - informational

2. **Update existing screens** (Phase 1)
   - Modify `KitCard.tsx` to show compliance status
   - Update sizing action to return RETIE data

3. **Create new screens** (Phase 2)
   - Sizing results screen
   - System summary screen

4. **Test integration** 
   - Verify RETIE calculations appear in UI
   - Check cost calculations
   - Test all component selection flows

5. **Add installer tools** (Phase 3)
   - Checklist component
   - Export functionality

---

## UI/UX Best Practices

- ✅ Use consistent icons (✅ compliant, ⚠️ warnings, ❌ non-compliant)
- ✅ Show why RETIE changes things (explain derating)
- ✅ Make compliance costs transparent
- ✅ Provide actionable recommendations
- ✅ Don't overwhelm non-technical users
- ✅ Keep technical details collapsible
- ✅ Use gluestack UI components consistently
- ✅ Color-code status (green/yellow/red)
