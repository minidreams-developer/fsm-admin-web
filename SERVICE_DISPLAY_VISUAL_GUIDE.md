# Service Display - Visual Guide

## Overview
This guide shows how services are now displayed in the ProjectsPage work order table.

## Service Display Examples

### Example 1: Single Service Work Order
```
Work Order ID: WO-1001
Customer: Praveen Kumar
Location: 12 MG Road, Kochi
Status: Ongoing

Services Column Display:
┌─────────────────────────────────────────┐
│ ┌─────────────┐                         │
│ │      [1]    │ Service                 │
│ └─────────────┘                         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📦 Cockroach Control                │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Data Source**: `serviceType: "Cockroach Control (AMC - 4/Year)"`
**Display**: Service name extracted and cleaned

---

### Example 2: Two Services Work Order
```
Work Order ID: WO-1005
Customer: Hotel Grand
Location: Beach Road, Calicut
Status: Ongoing

Services Column Display:
┌─────────────────────────────────────────┐
│ ┌─────────────┐                         │
│ │      [2]    │ Services                │
│ └─────────────┘                         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📦 Bed Bug Treatment                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📦 Cockroach Control                │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Data Source**: 
- `serviceTypes: ["Bed Bug Treatment (AMC - Monthly)", "Cockroach Control (AMC - Monthly)"]`
- OR multiple service entries in work order

**Display**: Both services shown with icons

---

### Example 3: Three or More Services Work Order
```
Work Order ID: WO-2050
Customer: Resort Complex
Location: Munnar Hills
Status: Upcoming

Services Column Display:
┌─────────────────────────────────────────┐
│ ┌─────────────┐                         │
│ │      [3]    │ Services                │
│ └─────────────┘                         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📦 Bed Bug Treatment                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📦 Cockroach Control                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ +1 more                                 │
│                                         │
└─────────────────────────────────────────┘
```

**Data Source**: `serviceTypes: ["Bed Bug Treatment", "Cockroach Control", "Mosquito Control", ...]`

**Display**: First 2 services shown, "+1 more" indicator

---

### Example 4: No Services (Edge Case)
```
Work Order ID: WO-2060
Customer: Pending Customer
Location: TBD
Status: Authorization Pending

Services Column Display:
┌─────────────────────────────────────────┐
│ ┌─────────────┐                         │
│ │      [0]    │ Services                │
│ └─────────────┘                         │
│                                         │
│ (No service boxes shown)                │
│                                         │
└─────────────────────────────────────────┘
```

**Data Source**: `serviceType: "" or serviceTypes: []`

**Display**: Count shown but no service names

---

## Service Name Cleaning Examples

Service names are automatically cleaned by extracting the part before the parentheses:

| Original | Display |
|----------|---------|
| `Cockroach Control (AMC - 4/Year)` | `Cockroach Control` |
| `Termite Control (One-Time)` | `Termite Control` |
| `Rat Control (AMC - Bi-Monthly)` | `Rat Control` |
| `Mosquito Fogging (One-Time)` | `Mosquito Fogging` |
| `Bed Bug Treatment (AMC - Monthly)` | `Bed Bug Treatment` |
| `Fly Control (AMC - Monthly)` | `Fly Control` |
| `Rodent Control (One-Time)` | `Rodent Control` |
| `Mosquito Control (AMC - Monthly)` | `Mosquito Control` |
| `Office Pest Control (AMC - Quarterly)` | `Office Pest Control` |

---

## Full Table Row Context

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Work Order ID  │  Customer          │  Services              │  Start Date  │ Status    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ WO-1001        │ Praveen Kumar      │ [1]  Services          │  Jan 10, 2026│ Ongoing   │
│                │ 12 MG Road, Kochi  │ 📦 Cockroach Control   │              │           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ WO-1005        │ Hotel Grand        │ [2]  Services          │  Jan 15, 2026│ Ongoing   │
│                │ Beach Road, Calicut│ 📦 Bed Bug Treatment   │              │           │
│                │                    │ 📦 Cockroach Control   │              │           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ WO-2050        │ Resort Complex     │ [3]  Services          │  Apr 12, 2026│ Upcoming  │
│                │ Munnar Hills       │ 📦 Bed Bug Treatment   │              │           │
│                │                    │ 📦 Cockroach Control   │              │           │
│                │                    │ +1 more                │              │           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Styling Details

### Visual Components

**Count Badge**
- Circular background with `bg-primary/10` (light blue)
- Primary text color
- Font weight: bold
- Size: Small (5x5 height/width)

**Service Name Box**
- Background: `bg-primary/5` (very light blue)
- Text: `text-primary` (blue)
- Padding: Small (px-2 py-1)
- Border radius: Rounded corners
- Text truncation: whitespace-nowrap + truncate (handles long names)

**Overflow Indicator**
- Text: `text-muted-foreground` (gray)
- Size: Small (text-xs)
- Format: "+N more"

---

## Interactivity

### Click Behavior
- Entire table row is clickable
- Clicking anywhere in the Services cell navigates to work order details
- Cursor shows pointer icon on hover

### Hover Effects
- Table row gets subtle background highlight
- Services cell maintains clickable styling
- No visual change to service boxes on hover

---

## Responsive Behavior

### Desktop (1024px+)
- Full table layout
- Service names display normally
- "+N more" text shows clearly

### Tablet (768px - 1023px)
- Table slightly compressed
- Service names may truncate if very long
- "+N more" still visible

### Mobile (< 768px)
- Single column layout or scroll
- Service names truncate with ellipsis
- Package icons still visible

---

## Data Flow Diagram

```
Work Order Data
    ↓
serviceType: "Cockroach Control (AMC - Monthly)" or
serviceTypes: ["Service 1", "Service 2", ...]
    ↓
Extract Services Array
    ├─ If serviceTypes exists and has items → use it
    ├─ Else if serviceType exists → wrap in array
    └─ Else → empty array
    ↓
Count Services (for badge)
    ↓
Extract Service Names (remove frequency info)
    ├─ Use regex: /^([^(]+)/
    ├─ Extract: Everything before first "("
    └─ Trim whitespace
    ↓
Display Logic
    ├─ Show count badge
    ├─ Show first 2 service names (if count > 0)
    ├─ Show "+N more" (if count > 2)
    └─ Add package icon for each service
    ↓
Rendered Services Column
```

---

## Comparison: Before vs After

### Before (Services Column)
```
┌─────────────────────────┐
│ [2]      Services       │
│                         │
│ (Nothing else shown)    │
│                         │
│ User must click         │
│ to see what services    │
└─────────────────────────┘
```

### After (Services Column)
```
┌──────────────────────────────────┐
│ [2]      Services                │
│                                  │
│ 📦 Cockroach Control             │
│ 📦 Termite Control               │
│                                  │
│ User can see services            │
│ at-a-glance                      │
└──────────────────────────────────┘
```

---

## Key Improvements

✓ **Better Visibility** - Service names visible without clicking
✓ **Cleaner Display** - Frequency info removed for readability
✓ **Visual Hierarchy** - Icons and colors guide the eye
✓ **Scalability** - Handles 1, 2, or many services gracefully
✓ **Consistent Design** - Uses existing app color scheme
✓ **No Performance Impact** - Simple string extraction

---

## Notes for Users

- Services are displayed in the order they appear in the work order
- Service names are automatically cleaned (frequency info removed)
- Long service names are truncated with ellipsis
- Click anywhere on the row to see full work order details
- The count always reflects the actual number of services (even if not all names shown)
