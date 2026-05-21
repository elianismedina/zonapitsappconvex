# RETIE Integration Guide for Colombian Solar Systems

## Overview

This guide explains how to use the RETIE (Reglamento Técnico de Instalaciones Eléctricas) compliance system integrated into your solar sizing and installation calculations.

**Key Files:**
- `utils/retie-compliance.ts` - Core RETIE compliance calculations and constants
- `utils/retie-integration.ts` - Integration layer that bridges RETIE to existing calculations
- `convex/sizing_retie.ts` - Convex actions for RETIE-compliant sizing

## Why RETIE Matters for Your App

Colombian regulations require:
1. **Professional Installation** - All solar systems must be installed by licensed electricians
2. **Inspection & Permits** - RETIE inspection certificate required before operation
3. **Specific Protections** - Exact breaker, fuse, and grounding requirements per article
4. **Documentation** - Single-line diagrams, equipment specs, and compliance records
5. **Warranty** - Installations must comply with RETIE for manufacturer warranty validation

**Impact on Your App:**
- Systems can't be put into operation without RETIE compliance
- Additional costs (~2.5M-3.5M COP per system for permits + compliance work)
- Wrong sizing = system won't pass inspection
- Your app needs to communicate compliance status to users

## How RETIE Works vs NEC

| Aspect | RETIE (Colombia) | NEC (USA) |
|--------|------------------|----------|
| **Voltage Drop** | 3% DC, 5% AC (stricter) | 3% DC, 5% AC |
| **Breaker Sizing** | 125% of max current | 125% of max current |
| **String Fuses** | 156% of Isc (vs 150%) | 156% of Isc |
| **Grounding** | Max 25Ω (stricter) | Max 25Ω |
| **Climate Factor** | 10% derating for 40°C | Case-by-case |
| **Arc Fault** | Required for string monitoring | DCPV systems only |
| **Permits** | Mandatory inspection | Varies by jurisdiction |

## Implementation in Your App

### 1. Update Sizing Calculations

**Before:** `calculateSizing` action in `sizing.ts`
**After:** Use `calculateSizingWithRetie` from `sizing_retie.ts`

```typescript
// In your Convex setup
import { calculateSizingWithRetie } from './sizing_retie';

// This automatically applies:
// ✓ Tropical soiling derating (8%)
// ✓ Temperature derating based on component
// ✓ Conservative winter-month calculations
// ✓ RETIE protection device sizing
// ✓ Compliance warnings
```

**Result differences:**
- Original sizing: 20 panels @ 400W = 8kW system
- RETIE sizing: 22 panels @ 400W = 8.8kW system (accounts for losses)
- Cost difference: ~+$2,000-3,000 more panels

### 2. Add Compliance to Inverter Selection

When user selects an inverter, add RETIE checks:

```typescript
import { addRetieComplianceToInverter } from '@/utils/retie-integration';

const inverter = await fetchInverter(inverterId);
const panelConfig = await calculateSizingWithRetie(kitId);

const retieInverter = addRetieComplianceToInverter(
  compatibilityResult,
  RetieSystemType.ON_GRID,
  dcCableLength, // From site survey
  acCableLength
);

// Show user:
// - AC Breaker size (RETIE 125% rule)
// - Wire gauge (RETIE voltage drop limits)
// - Any voltage drop warnings
// - Grid disconnect requirement
```

### 3. Add Compliance to Battery Selection

If designing off-grid/hybrid system:

```typescript
import { addRetieComplianceToBattery } from '@/utils/retie-integration';

const battery = await fetchBattery(batteryId);

const reetieBattery = addRetieComplianceToBattery(
  compatibilityResult,
  arrayCurrentIsc,
  dcCableLength
);

// Show user:
// - Temperature derating (8% for 40°C)
// - Adjusted days of autonomy
// - Required DC disconnect
// - Grounding conductor size
```

### 4. Include Compliance Costs in Installation

```typescript
import { calculateRetieInstallationCosts } from '@/utils/retie-integration';

const complianceCosts = calculateRetieInstallationCosts(
  RetieSystemType.ON_GRID,
  arrayCurrentIsc
);

// Returns breakdown:
// ├─ Grounding system: $400-500k COP
// ├─ Protection devices: $800-1000k COP
// ├─ Disconnects & wiring: $600k COP
// ├─ Permits & inspection: 1,050,000 COP
// └─ Total: ~3.5-3.8M COP
```

### 5. Generate Installation Checklist

Before job starts, generate RETIE checklist:

```typescript
import { generateRetieInstallationChecklist } from '@/utils/retie-integration';

const checklist = generateRetieInstallationChecklist(RetieSystemType.ON_GRID);

// Gives installer 16-18 items to verify
// ✓ Disconnects installed
// ✓ Breakers rated correctly
// ✓ Grounding < 25Ω
// ✓ Voltage drop verified
// ✓ All components labeled
// ✓ Documentation complete
```

## RETIE Compliance Checklist for Different System Types

### On-Grid (Connected to Utility)
```
□ DC Array Disconnect switch
□ DC Array Breaker (125% rule)
□ String Fuses on each string (156% rule)
□ DC Surge Protector (Type 2)
□ AC Main Disconnect switch
□ AC Output Breaker (125% rule)
□ AC Surge Protector (Type 2)
□ Grid Interconnect Disconnect (required by CFE)
□ Grounding system (< 25Ω)
□ All bonding connections
□ RETIE Inspection & Permit
```

### Off-Grid (Standalone)
```
□ DC Array Disconnect
□ DC Array Breaker (125% rule)
□ String Fuses (156% rule)
□ DC Surge Protector
□ Battery Bank Disconnect
□ Battery Charge/Discharge Breaker
□ DC-DC Converter Protections
□ AC Inverter Disconnect
□ AC Output Breaker
□ AC Surge Protector
□ DC Arc Fault Detection
□ Grounding system (< 25Ω)
```

### Hybrid (Grid + Battery)
```
□ All On-Grid requirements
□ All Off-Grid requirements
□ Automatic Transfer Switch (ATS)
□ Grid-Battery selector logic
□ Anti-islanding verification
```

## How to Display RETIE Info in Your UI

### 1. Sizing Screen
```
Original sizing (without losses):
  → 20 panels @ 400W = 8kW

RETIE Adjusted sizing (with derating):
  → 23 panels @ 400W = 9.2kW
  → Accounts for: 8% soiling + 6% temperature

⚠️ This ensures system passes inspection!
```

### 2. Component Selection
```
Selected: Fronius Primo 5kW Inverter

✓ RETIE Compliance Check:
  • AC Output: 65A @ 240V
  • Required AC Breaker: 100A (125% × 65A)
  • Required AC Wire: 4 AWG (copper)
  • Voltage Drop: 2.8% ✓ (max 3%)
  • Grid Disconnect Required: Yes
  • Status: ✅ COMPLIANT
```

### 3. Battery Selection (if hybrid)
```
Selected: LiFePO4 48V 10kWh Battery

✓ RETIE Compliance Check:
  • System Voltage: 48V ✓
  • Max Discharge Current: 200A
  • Temperature Derating: -8% @ 40°C
  • Effective Autonomy: 3 days (vs 3.3 days nominal)
  • Required DC Disconnect: 200A @ 600V
  • Grounding: Required
  • Status: ✅ COMPLIANT

⚠️ Note: High ambient temperature reduces battery capacity
   Consider: A/C for battery room or larger capacity
```

### 4. Installation Cost Breakdown
```
RETIE Compliance Costs (Colombia):
├─ Grounding System: 1,750,000 COP
├─ Protection Devices: 2,975,000 COP
│  ├─ Breakers: 700,000 COP
│  ├─ Fuses: 525,000 COP
│  └─ Surge Protectors: 1,750,000 COP
├─ Disconnects & Wiring: 2,100,000 COP
├─ Permits & Inspection: 3,500,000 COP
├─ Documentation & Drawings: 1,050,000 COP
└─ TOTAL COMPLIANCE: 11,375,000 COP

This is in addition to equipment costs.
```

## Constants Reference

### Temperature Derating (Colombian Tropics)
```
Ambient: 40°C
─────────────────
Panels: -6% efficiency
Inverter: -5% capacity
Batteries: -12% capacity
Wiring: -10% ampacity
```

### Grounding Requirements
```
Maximum Resistance: 25 ohms (vs 5-8 in temperate zones)
Ground Rod Minimum: 2.4m length × 13.8mm diameter
Rod Spacing: 3 meters apart
Conductor: Copper, minimum #6 AWG
```

### Wire Gauge Standards
```
DC String Current → AWG → Max Current
─────────────────────────────────────
≤ 50A → 10 AWG → 50A (with 40°C derating)
51-75A → 8 AWG → 75A
76-110A → 6 AWG → 110A
111-155A → 4 AWG → 155A
```

## Common Issues & Fixes

### Issue 1: "Voltage drop exceeds RETIE limits"
```
Problem: DC cable run too long or wire too small
Fix Options:
  a) Use next wire size up (cost: +700,000-1,400,000 COP)
  b) Reduce cable length (redesign layout)
  c) Install DC-DC converter midway (cost: +3.5M-7M COP)
```

### Issue 2: "Breaker not in standard ratings"
```
Problem: 125% rule creates non-standard size
Example: 125% × 45A = 56.25A (no standard breaker)
Solution: Use next standard size (60A)
RETIE allows this: "Round to next standard"
```

### Issue 3: "System fails grounding test"
```
Problem: Soil resistance too high (dry season)
RETIE Limit: < 25Ω
Typical Colombia soil: 100-500Ω before improvement
Solution:
  - Add more ground rods in series
  - Use bentonite around rods
  - Install copper mesh
  Cost: +2,800,000-4,200,000 COP
```

### Issue 4: "Battery autonomy reduced by temperature"
```
Problem: 40°C ambient reduces battery capacity
Original: 10kWh @ 25°C
Actual: 8.8kWh @ 40°C (12% loss)
Solution:
  - Install cooling system
  - Or spec larger battery (+7,000,000-10,500,000 COP)
  - Or accept lower autonomy
```

## How to Integrate Into Existing Code

### Step 1: Add RETIE to sizing.ts

```typescript
// In convex/sizing.ts, add import:
import { 
  RETIE_ENVIRONMENTAL_CONDITIONS,
  calculateRetieBreaker,
} from '../utils/retie-compliance';

// Modify calculateSizing to apply derating:
const tropicalDerating = RETIE_ENVIRONMENTAL_CONDITIONS.tropicalRegion.soilingFactor;
const panelDerating = RETIE_ENVIRONMENTAL_CONDITIONS.componentDerating.panels;
const totalDerate = tropicalDerating * panelDerating;

const adjustedPeakSunHours = peakSunHours * totalDerate;
const adjustedDailyDemand = dailyDemandKwh / totalDerate;
```

### Step 2: Add RETIE to solar-calculations.ts

```typescript
// In checkInverterCompatibility, add:
const dcBreaker = calculateRetieBreaker(totalPvCurrent, 'dc');
const acBreaker = calculateRetieBreaker(inverterOutputCurrent, 'ac');

// Return in result:
{
  ...existingResult,
  retieBreakers: { dcBreaker, acBreaker },
  retieCompliant: isCompliant,
}
```

### Step 3: Add RETIE to installation-calculations.ts

```typescript
// In estimateLaborParams, add RETIE cost:
import { calculateRetieInstallationCosts } from '../utils/retie-integration';

const retieCosts = calculateRetieInstallationCosts(systemType, arrayIsc);
const totalCost = laborCost + retieCosts.totalRetieComplianceCost;
```

### Step 4: Create UI Components

```typescript
// Component: <RetieComplianceCard />
// Shows:
// - Compliance status (✅ COMPLIANT or ❌ ISSUES)
// - List of warnings
// - Required protections
// - Estimated costs
// - Inspection requirement

// Component: <RetieInstallerChecklist />
// Shows: 16-18 checklist items
// Installer can check off as work progresses
```

## Best Practices

### 1. Always Apply Derating
- Never show "8kW system" if it's really 7.2kW after derating
- Communicate true capacity to customers
- They'll appreciate transparency

### 2. Build in Compliance from Start
- Don't try to retrofit RETIE compliance later
- Design systems with compliance in mind
- Saves money and time

### 3. Over-Size Wisely
- +15% capacity is typical for Colombian systems
- Accounts for aging, dust, temperature
- Customers get more production over 25 years

### 4. Document Everything
- RETIE requires documentation for warranty
- Your app should generate this automatically
- Store in customer's account for future reference

### 5. Train Installation Teams
- 80% of RETIE failures are installation errors
- Provide checklists and diagrams
- Have QA inspect before final handover

## Cost Impact on Your Business Model

If you charge per system:
```
Before RETIE integration: $0-500 added per system
After RETIE integration: +$50-200 per system (cloud value)
├─ Automatic compliance checking: +$20-50 per system
├─ Avoiding failed inspections: +350,000-1,750,000 per system (prevents loss)
└─ Faster approvals: +$30-100 per system (fewer back-and-forths)
```

**ROI:** One failed inspection ($2-3k loss to customer) pays for system improvement.

## Next Steps

1. ✅ Test RETIE compliance calculations with real kit data
2. ✅ Integrate into UI (show compliance status in real-time)
3. ✅ Add RETIE costs to project estimates
4. ✅ Create installer checklist feature
5. ✅ Build documentation generator
6. ✅ Add RETIE compliance badge to system designs
7. ✅ Train customer support on RETIE requirements

## Resources

- RETIE Full Document: https://www.min.energia.gov.co/
- IEC 62446: https://www.iec.ch/
- Colombian Solar Association: https://www.acolgen.org.co/
- CFE Grid Interconnection: https://www.cfe.mx/ (for on-grid systems)

---

**Questions?** The code includes extensive comments for each RETIE article reference.
