# Payment Modal - Updated Visual Guide (Individual TXN IDs)

## Quick Summary

**You select 2 services → You get 2 transaction ID input fields** ✅

---

## Visual Comparison

### Before
```
Services: [Select services]
Payment Method: [Cash]
Transaction ID: [One field]
Amount: [____]
```

### After
```
Services: [✓ 2 services selected]

Transaction IDs for Selected Services:
📦 Pest Control
[TXN-001]

📦 Cleaning  
[TXN-002]

Payment Method: [Cash]
Overall Transaction ID: [Optional]
Amount: [____]
```

---

## Complete Form Layout

```
┌──────────────────────────────────────────┐
│  Update Payment                     [×]  │
│  WO-2009                                │
├──────────────────────────────────────────┤
│                                          │
│ Services                                 │
│ ┌────────────────────────────────────┐  │
│ │ ✓ 2 services selected        [↓]  │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ✓ 2 services selected                   │
│                                          │
│ ─────────────────────────────────────   │
│ Transaction IDs for Selected Services   │
│ ─────────────────────────────────────   │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 📦 Pest Control — Completed      │  │
│ │ [TXN-20260610-001______________] │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 📦 Cleaning — Completed          │  │
│ │ [TXN-20260610-002______________] │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Payment Method: [Cash ▼]                 │
│                                          │
│ Overall Transaction ID (Optional)       │
│ [TXN-PAYMENT-001_______________]        │
│                                          │
│ Amount (₹): [10000]                      │
│ Date: [2026-06-10]                       │
│ Collected By: [Arun - Sales Exec ▼]     │
│                                          │
│ [Cancel]  [Update Payment]               │
└──────────────────────────────────────────┘
```

---

## State Changes During User Interaction

### 1️⃣ Initial State
```
Services: "Select services (optional)"
         (No TXN ID section)
```

### 2️⃣ After Selecting 1 Service
```
Services: "✓ 1 service selected" ← PRIMARY BLUE
         
"✓ 1 service selected"  ← GREEN BADGE

Transaction IDs for Selected Services:
📦 Pest Control
[________________]  ← ONE INPUT FIELD APPEARS
```

### 3️⃣ After Selecting 2 Services
```
Services: "✓ 2 services selected"  ← PRIMARY BLUE

"✓ 2 services selected"  ← GREEN BADGE

Transaction IDs for Selected Services:
📦 Pest Control
[________________]  ← FIRST TXN ID FIELD

📦 Cleaning
[________________]  ← SECOND TXN ID FIELD APPEARS
```

### 4️⃣ After Selecting 3 Services
```
Services: "✓ 3 services selected"

"✓ 3 services selected"

Transaction IDs for Selected Services:
📦 Pest Control
[________________]

📦 Cleaning
[________________]

📦 Fumigation
[________________]  ← THIRD TXN ID FIELD APPEARS
```

### 5️⃣ Deselecting a Service
```
(If you uncheck Cleaning, it disappears)

Services: "✓ 2 services selected"

Transaction IDs for Selected Services:
📦 Pest Control
[TXN-001___________]  ← RETAINED

📦 Fumigation
[________________]  ← Cleaning field removed
```

---

## Step-by-Step Example

### Scenario: Record payment for Pest Control & Cleaning

```
STEP 1: Open Modal
┌──────────────────────────┐
│ Update Payment      [×]  │
│ WO-2009                  │
├──────────────────────────┤
│ Services                 │
│ [Select services... ↓]  │
│                          │
│ Payment Method: [Cash▼]  │
│ ...                      │
└──────────────────────────┘

STEP 2: Click Services Dropdown
┌──────────────────────────┐
│ Services                 │
│ [Select... ↑]           │
│ ├─ ☐ Pest Control       │
│ ├─ ☐ Cleaning           │
│ ├─ ☐ Fumigation         │
│ └─ ☐ Water Tank...      │
└──────────────────────────┘

STEP 3: Check Pest Control
┌──────────────────────────┐
│ Services                 │
│ [✓ 1 service... ↓]      │
│ ├─ ☑ Pest Control       │
│ ├─ ☐ Cleaning           │
│ ├─ ☐ Fumigation         │
│ └─ ☐ Water Tank...      │
└──────────────────────────┘

Modal updates to show:
┌──────────────────────────┐
│ ✓ 1 service selected    │
│                          │
│ Transaction IDs for...  │
│ 📦 Pest Control         │
│ [________________]       │
└──────────────────────────┘

STEP 4: Check Cleaning
┌──────────────────────────┐
│ Services                 │
│ [✓ 2 services... ↓]     │
│ ├─ ☑ Pest Control       │
│ ├─ ☑ Cleaning           │
│ ├─ ☐ Fumigation         │
│ └─ ☐ Water Tank...      │
└──────────────────────────┘

Modal updates to show:
┌──────────────────────────┐
│ ✓ 2 services selected   │
│                          │
│ Transaction IDs for...  │
│ 📦 Pest Control         │
│ [________________]       │
│                          │
│ 📦 Cleaning             │
│ [________________]       │
└──────────────────────────┘

STEP 5: Click away to close dropdown
┌──────────────────────────┐
│ Services                 │
│ [✓ 2 services... ↓]     │
│                          │
│ ✓ 2 services selected   │
│                          │
│ Transaction IDs for...  │
│ 📦 Pest Control         │
│ [________________]       │
│                          │
│ 📦 Cleaning             │
│ [________________]       │
└──────────────────────────┘

STEP 6: Enter TXN IDs
📦 Pest Control
[TXN-PC-001____]

📦 Cleaning
[TXN-CL-002____]

STEP 7: Fill Other Fields
Payment Method: UPI
Overall TXN ID: (leave empty)
Amount: 10000
Date: 2026-06-10
Collected By: Arun - Sales Executive

STEP 8: Click "Update Payment"
Modal closes
Success: "Payment updated! 2 services linked"
```

---

## Color & Typography

| Element | Color | Style |
|---------|-------|-------|
| Selected count | Primary Blue (#942BF4) | Semibold |
| Badge | Primary/10 background | Primary text |
| Section header | Primary | Semibold |
| Service label | Card foreground | Semibold |
| Input field | Secondary | Normal |
| TXN ID field | Monospace (code font) | Normal |
| Icon | Text with service name | 📦 Emoji |

---

## Responsive Design

### Mobile (< 640px)
```
[Full width modal]
[One column layout]
Fields stack vertically
Buttons full width
```

### Tablet (640px - 1024px)
```
[Modal 90% width]
[Responsive grid]
TXN ID inputs stack
```

### Desktop (> 1024px)
```
[Modal max-w-md]
[All content visible]
TXN ID fields organized
```

---

## Data Flow

```
User selects 2 services
    ↓
serviceIds = ["service-1", "service-2"]
    ↓
Component renders 2 TXN ID input fields
    ↓
User enters TXN IDs
    ↓
serviceTransactionIds = {
  "service-1": "TXN-001",
  "service-2": "TXN-002"
}
    ↓
User clicks "Update Payment"
    ↓
Save to work order:
{
  paidAmount: "₹ 10,000",
  transactionId: "TXN-PAYMENT-001",
  serviceTransactionIds: {
    "service-1": "TXN-001",
    "service-2": "TXN-002"
  }
}
```

---

## Real-World Example

### Input
```
Services Selected:
  ☑ Pest Control (Service ID: PC-001)
  ☑ Cleaning (Service ID: CL-001)

TXN IDs Entered:
  PC-001: UPI-123456-HDFC
  CL-001: UPI-789012-ICICI

Payment Details:
  Amount: ₹12,500
  Date: 2026-06-10
  Method: UPI
  Collected By: Arun - Sales Executive
```

### Output Saved
```
Payment Record:
- Total Paid: ₹12,500
- Payment Method: UPI
- Payment Date: 2026-06-10
- Collected By: Arun - Sales Executive

Service Linkages:
- Pest Control: UPI-123456-HDFC
- Cleaning: UPI-789012-ICICI

Result: Two separate service payments tracked from one transaction
```

---

## Key Differences from Previous Version

| Feature | Before | After |
|---------|--------|-------|
| **Services** | Multi-select dropdown | Same multi-select ✓ |
| **TXN ID Fields** | 1 field for all services | 1 field per service ✓ |
| **Service Labels** | None | Shows service name ✓ |
| **Grouping** | N/A | Grouped in section ✓ |
| **Dynamic** | Fixed field | Appears for each service ✓ |
| **Flexibility** | Same TXN for all | Different TXN per service ✓ |

---

## Summary

✅ **Select services** → Multi-select dropdown  
✅ **Get TXN ID fields** → One field per service  
✅ **Enter individual IDs** → Each service gets its own TXN ID  
✅ **Save payment** → Linked to all selected services  

**Simple, intuitive, powerful!** 🚀
