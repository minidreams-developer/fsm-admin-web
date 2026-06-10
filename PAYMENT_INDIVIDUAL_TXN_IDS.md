# Payment Modal - Individual Transaction IDs for Each Service

## Feature Overview

✅ **New Feature**: When you select multiple services, you now get **individual transaction ID input fields for EACH service**.

## What Changed

### Before
```
Services: Select up to 3 services
Transaction ID: [One field for all]
```

### After
```
Services: Select up to 3 services
         ✓ 2 services selected

Transaction IDs for Selected Services:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Pest Control — Completed
[TXN-001_____________________]

📦 Cleaning — Completed
[TXN-002_____________________]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Method: Cash
Overall Transaction ID: [Optional]
Amount: ₹ 10,000
Date: 2026-06-10
Collected By: Arun - Sales Executive
```

## How It Works

### Step 1: Open Payment Update Modal
```
Click "Update Payments" on PaymentsPage
    ↓
Modal opens
```

### Step 2: Select Services
```
Services dropdown
Click dropdown
Check: ☑ Pest Control — Completed
Check: ☑ Cleaning — Completed
Close dropdown
    ↓
Shows: "✓ 2 services selected"
```

### Step 3: Enter Individual Transaction IDs
```
"Transaction IDs for Selected Services" section appears
    ↓
First field:
Label: 📦 Pest Control — Completed
Input: [Enter transaction ID]
Example: TXN-20260610-001
    ↓
Second field:
Label: 📦 Cleaning — Completed
Input: [Enter transaction ID]
Example: TXN-20260610-002
```

### Step 4: Fill Other Fields
```
Payment Method: Select "UPI"
Overall Transaction ID: [Optional - leave empty or fill]
Amount: 10000
Date: 2026-06-10
Collected By: Arun - Sales Executive
```

### Step 5: Submit
```
Click "Update Payment"
    ↓
Validates all fields
    ↓
Saves payment with:
  - Pest Control linked to TXN-20260610-001
  - Cleaning linked to TXN-20260610-002
    ↓
Success: "Payment updated! 2 services linked"
```

## Key Features

| Feature | Details |
|---------|---------|
| **Multi-Select** | Select 1 or more services |
| **Dynamic Fields** | Transaction ID field appears for EACH selected service |
| **Individual Entry** | Each service gets its own transaction ID input |
| **Service Name** | Shows service name (e.g., "📦 Pest Control — Completed") |
| **Optional Overall TXN** | "Overall Transaction ID" field is optional for entire payment |
| **Clear Labels** | Shows "Transaction IDs for Selected Services" header |
| **Visual Grouping** | Services grouped in primary/5 background with border |

## Use Cases

### Scenario 1: Single Service
```
Select 1 service: Pest Control
Enter: TXN-001
Result: Payment linked to Pest Control with TXN-001
```

### Scenario 2: Two Services (Two Different TXN IDs)
```
Select: Pest Control, Cleaning
Pest Control TXN ID: TXN-001
Cleaning TXN ID: TXN-002
Result: 
  - Pest Control linked to TXN-001
  - Cleaning linked to TXN-002
```

### Scenario 3: Three Services (Same TXN ID for All)
```
Select: Pest Control, Cleaning, Fumigation
Pest Control TXN ID: TXN-003
Cleaning TXN ID: TXN-003
Fumigation TXN ID: TXN-003
Result: All three services linked to TXN-003
```

### Scenario 4: No Services Selected
```
Leave services empty
Fill only Payment Method, Amount, Date, Collected By
Result: Payment recorded without service linking
```

## Form Fields

### Services Selection
- **Type**: Multi-select dropdown
- **Options**: List of all available services
- **Display**: "✓ X service(s) selected" when items selected
- **Required**: No (optional)

### Transaction IDs Section (Appears when services selected)
- **Header**: "Transaction IDs for Selected Services"
- **Display**: One input field per selected service
- **Label**: "📦 Service Name — Status"
- **Type**: Text input
- **Placeholder**: "Enter transaction ID for [Service Name]"
- **Required**: No
- **Quantity**: Matches number of selected services

### Overall Transaction ID
- **Label**: "Overall Transaction ID (Optional)"
- **Type**: Text input
- **Placeholder**: "e.g. TXN-12345678 or UPI reference (optional)"
- **Required**: No
- **Purpose**: For entire payment (if different from individual service TXN IDs)

### Payment Method
- **Type**: Dropdown select
- **Options**: Cash, UPI, Check, Bank Transfer
- **Required**: Yes

### Amount
- **Type**: Number input
- **Unit**: Rupees (₹)
- **Step**: 0.01
- **Required**: Yes

### Date
- **Type**: Date input
- **Format**: YYYY-MM-DD
- **Default**: Today
- **Required**: Yes

### Collected By
- **Type**: Dropdown select
- **Options**: Employee list (Name — Role)
- **Required**: Yes

## Data Structure

### Form Data
```typescript
type PaymentFormData = {
  paymentMethod: "Cash" | "UPI" | "Check" | "Bank Transfer";
  amount: string;                    // Amount in rupees
  date: string;                      // YYYY-MM-DD
  paidBy: string;                    // Employee name
  transactionId?: string;            // Overall TXN ID
  serviceIds?: string[];             // Selected service IDs
  serviceTransactionIds?: Record<string, string>; // TXN ID per service
}
```

### State
```typescript
const [serviceTransactionIds, setServiceTransactionIds] = useState<Record<string, string>>({
  "service-id-1": "TXN-001",
  "service-id-2": "TXN-002",
  "service-id-3": "TXN-003",
});
```

### Saved Data
```typescript
updateWorkOrder(workOrder.id, {
  paidAmount: `₹ ${totalPaid.toLocaleString()}`,
  transactionId: data.transactionId || undefined,
  serviceTransactionIds: {
    "service-id-1": "TXN-001",
    "service-id-2": "TXN-002",
  },
});
```

## UI Layout

### Mobile (Stacked)
```
Services
[✓ 2 services selected ↓]

✓ 2 services selected

Transaction IDs for Selected Services
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Pest Control
[TXN-001___]

📦 Cleaning
[TXN-002___]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Method
[Cash ▼]

Overall Transaction ID (Optional)
[_____________]

Amount
[10000___]

Date
[2026-06-10]

Collected By
[Arun - Sales...]
```

### Desktop (Full Width)
```
┌─────────────────────────────────────────────┐
│ Services                                    │
│ ┌────────────────────────────────────────┐ │
│ │ ✓ 2 services selected            [↓] │ │
│ └────────────────────────────────────────┘ │
│ ✓ 2 services selected                      │
│                                             │
│ Transaction IDs for Selected Services       │
│ ┌────────────────────────────────────────┐ │
│ │ 📦 Pest Control — Completed         │ │
│ │ [TXN-20260610-001_________________] │ │
│ │                                      │ │
│ │ 📦 Cleaning — Completed            │ │
│ │ [TXN-20260610-002_________________] │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ Payment Method:   [Cash ▼]                  │
│ Overall TXN ID:   [_________________]       │
│ Amount (₹):       [10000]                   │
│ Date:             [2026-06-10]              │
│ Collected By:     [Arun - Sales Exec ▼]    │
└─────────────────────────────────────────────┘
```

## Examples

### Example 1: Single Service
```
Service Selected: Pest Control
TXN ID: UPI-123456
Amount: ₹5,000

Result:
✓ Payment of ₹5,000 recorded
✓ Linked to Pest Control with TXN ID: UPI-123456
```

### Example 2: Two Services with Different TXN IDs
```
Services Selected:
  1. Pest Control — Completed
  2. Cleaning — Completed

TXN IDs:
  1. TXN-20260610-001
  2. TXN-20260610-002

Amount: ₹10,000

Result:
✓ Payment of ₹10,000 recorded
✓ Pest Control linked to TXN-20260610-001
✓ Cleaning linked to TXN-20260610-002
```

### Example 3: Three Services with Same TXN ID
```
Services Selected:
  1. Pest Control
  2. Cleaning
  3. Fumigation

TXN IDs:
  1. TXN-BULK-001
  2. TXN-BULK-001
  3. TXN-BULK-001

Amount: ₹15,000

Result:
✓ Payment of ₹15,000 recorded
✓ All 3 services linked to TXN-BULK-001
✓ Bulk payment successfully recorded
```

## Success Messages

| Scenario | Message |
|----------|---------|
| 0 services | "Payment updated!" |
| 1 service | "Payment updated! 1 service linked" |
| 2 services | "Payment updated! 2 services linked" |
| 3+ services | "Payment updated! 3 services linked" |

## Component Code

### File
`src/components/PaymentUpdateModal.tsx`

### Key Changes
1. Added `serviceTransactionIds` state to track TXN ID for each service
2. Added schema field: `serviceTransactionIds: z.record(z.string())`
3. Dynamic rendering of transaction ID inputs based on selected services
4. Each service gets its own input field with service name label

## Testing

### Test Case 1: No Services
```
1. Leave services empty
2. Fill other fields
3. Click "Update Payment"
✓ Payment recorded without service linking
```

### Test Case 2: Single Service
```
1. Select 1 service
2. Enter TXN ID for that service
3. Fill other fields
4. Click "Update Payment"
✓ Payment linked to 1 service
```

### Test Case 3: Multiple Services
```
1. Select 3 services
2. Enter different TXN ID for each
3. Fill other fields
4. Click "Update Payment"
✓ Each service linked to its own TXN ID
```

### Test Case 4: Skip Service TXN IDs
```
1. Select 2 services
2. Leave TXN ID fields empty
3. Fill other required fields
4. Click "Update Payment"
✓ Payment still records
✓ No TXN IDs stored for services
```

## Status

✅ **Complete**  
✅ **Tested**  
✅ **No Errors**  
✅ **Ready to Use**  

---

**File**: `src/components/PaymentUpdateModal.tsx`  
**Date**: June 10, 2026  
**Version**: 2.0 (Individual Transaction IDs per Service)
