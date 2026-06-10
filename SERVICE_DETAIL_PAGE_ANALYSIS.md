# SERVICE DETAIL PAGE ANALYSIS
## Route: `/service/TASK-1781087838868-2?from=workorder`

---

## 📋 PAGE OVERVIEW

**Purpose**: Display comprehensive details of a service task/appointment with full documentation and PDF export capability.

**Route Pattern**: `/service/:id?from=workorder`
- Handles both **Tasks** (from WorkOrders) and **Service Appointments**
- Distinguishes by ID prefix: `TASK-*` = Task from work order, otherwise = Service Appointment

**Key Feature**: Dual-mode rendering based on source (Task vs Appointment)

---

## 🏗️ PAGE STRUCTURE

### 1. **Header Section**
```
┌─────────────────────────────────────────────────────┐
│  [← Back] Service Details | ID: TASK-xxxx          │
│                                [Download PDF] [Edit]│
└─────────────────────────────────────────────────────┘
```
- Back button navigation
- Service ID display
- Download PDF button
- Edit button (appointment-only)

---

## 📊 CONTENT SECTIONS (For Tasks from WorkOrders)

### 2. **Main Header Card**
- **Service Avatar**: Profile photo (if available) or initial letter in circle
- **Title**: Service subject (e.g., "Pest Control Service")
- **Status Badge**: Visual indicator + color coding
  - Completed → Green
  - Scheduled → Blue
  - Cancelled → Red
  - Default → Gray

### 3. **Key Information Grid** (Appointments only)
- Unit Price
- Unit Type
- Unit Count

---

## 👥 CUSTOMER INFORMATION SECTION
```
┌─ Customer Information ─────────────────────────────┐
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ Customer     │  │ Phone        │              │
│  │ Lakshmi Stores  │ 9876543240  │              │
│  └──────────────┘  └──────────────┘              │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │ Email (full width)                         │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ Site Address │  │ Billing Addr │              │
│  │ Market Road  │  │ Market Road  │              │
│  └──────────────┘  └──────────────┘              │
└────────────────────────────────────────────────────┘
```
**Fields**:
- Customer Name
- Phone Number (with phone icon)
- Email (with mail icon)
- Site Address (with location pin)
- Billing Address (with location pin)

**Source**: WorkOrder data (fallback to defaults if missing)

---

## 🕐 VISIT TIMES SECTION
```
┌─ Visit Times ──────────────────────────────────────┐
│                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │ 🟢 Check-in Time   │  │ 🔴 Check-out Time  │ │
│  │ 08:45 AM           │  │ 11:30 AM           │ │
│  └─────────────────────┘  └─────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```
**Features**:
- Green icon for check-in
- Red icon for check-out
- Times from LinkedAppointment or defaults

---

## 🧪 CHEMICALS USED SECTION
```
┌─ Chemicals Used ───────────────────────────────────┐
│  Name              │ Quantity                      │
├────────────────────┼──────────────────────────────┤
│  Rin               │ 100ml                        │
│  Cypermethrin 10%  │ 250ml                        │
│  Gel Bait          │ 2 tubes                      │
└────────────────────┴──────────────────────────────┘
```
**Features**:
- Sortable table format
- Hover effects on rows
- Dynamically populated

---

## 📝 OBSERVATION SECTION
```
┌─ Observation ──────────────────────────────────────┐
│                                                    │
│  Heavy cockroach activity observed near kitchen  │
│  storage and drain areas. Bait stations placed   │
│  at four corners. Customer advised to keep food  │
│  items sealed. Follow-up recommended in 15 days. │
│                                                    │
└────────────────────────────────────────────────────┘
```
**Features**:
- Pre-wrapped text display
- Light gray background
- Full width

---

## 📊 ODOMETER READINGS SECTION
```
┌─ Odometer Readings ────────────────────────────────┐
│                                                    │
│  Date: 2026-02-01 | Vehicle: Van-01              │
│  From: 12,450 km → To: 12,485 km [Distance: 35km]│
│                                                    │
│  ┌──────────────────┐  ┌──────────────────┐      │
│  │ From Odometer    │  │ To Odometer      │      │
│  │  [Image]         │  │  [Image]         │      │
│  │ 12,450 km        │  │ 12,485 km        │      │
│  └──────────────────┘  └──────────────────┘      │
│                                                    │
└────────────────────────────────────────────────────┘
```
**Features**:
- Date and vehicle info
- Kilometer readings (From/To)
- Distance calculation
- Odometer images (before/after)
- Hover overlay showing km values

**Current Data**: Dummy data (one static reading)

---

## 📸 BEFORE & AFTER WORKING PLACE SECTION
```
┌─ Before & After Working Place ─────────────────────┐
│                                                    │
│  ┌─ Before Work (Orange)  ┬─ After Work (Green) ┐│
│  │      [Image]            │      [Image]       ││
│  │  Hover: "Before Work"   │  Hover: "After Work"││
│  └────────────────────────┴────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```
**Features**:
- Side-by-side comparison layout
- Color-coded indicators (orange/green)
- Hover overlay with text
- Responsive grid

---

## 💰 PAYMENT DETAILS SECTION
```
┌─ Payment Paid Details ─────────────────────────────┐
│                                                    │
│  Total Service Charge                  ₹ 850     │
│  (Includes all applied treatments and taxes)      │
│                                                    │
│  Received Amount        [Scan & Pay]   ₹ 700     │
│                                                    │
│  ┌──────────────────────────────────────────────┐│
│  │ Pending Balance                        ₹ 150 ││
│  └──────────────────────────────────────────────┘│
│                                                    │
└────────────────────────────────────────────────────┘
```
**Fields**:
- Total Service Charge (primary amount)
- Received Amount (with payment mode badge)
- Pending Balance (highlighted in red)

**Data Source**: Calculated from LinkedAppointment.payment

---

## ✍️ CUSTOMER SIGNATURE SECTION
```
┌─ Customer Signature ───────────────────────────────┐
│                                                    │
│  Customer signature confirming service completion │
│  and satisfaction.                                 │
│                                                    │
│  ┌──────────────────────────────────────────────┐│
│  │           ✏️ Pen Icon                        ││
│  │       No signature available                 ││
│  │  Signature will appear here once customer   ││
│  │              signs                           ││
│  └──────────────────────────────────────────────┘│
│                                                    │
└────────────────────────────────────────────────────┘
```
**Current State**: Static placeholder (no actual signature functionality)

---

## 🔄 DATA FLOW

### Task Identification
```
URL: /service/TASK-1781087838868-2
↓
Checks if ID starts with "TASK-"
↓
YES → Load as Task
↓
getTask(id) from TasksStore
↓
Get WorkOrder via task.workOrderId
↓
Find linked ServiceAppointment
↓
Merge data from all sources
```

### Linked Appointment Resolution
```
Task (from WorkOrder)
    ↓
    Fetch WorkOrder
    ↓
    Find ServiceAppointment where:
    appointmentData.workOrderId === task.workOrderId
    ↓
    Merge times, payment, description
```

### Field Data Consolidation
```
getTaskFieldData(task, workOrder, linkedAppointment)
    ↓
    Returns unified object with:
    - Customer info (from WorkOrder)
    - Times (from Appointment)
    - Payment (from Appointment)
    - Description (from Appointment or Task)
```

---

## 🎨 FEATURES & FUNCTIONALITY

### 1. **PDF Download**
- Converts page content to PDF
- Hides buttons during capture
- Multi-page support for long content
- Auto-generates filename with date
- Uses `html2canvas` + `jsPDF`

```
Flow:
User clicks "Download PDF"
    ↓
Hide all buttons/interactive elements
    ↓
Capture page as canvas (2x scale for quality)
    ↓
Convert to PNG
    ↓
Create A4 PDF pages
    ↓
Add pagination if needed
    ↓
Download with filename: Service_TASK-xxx_2026-02-10.pdf
```

### 2. **Edit Modal** (Appointments only)
- Opens ServiceFormModal in edit mode
- Not available for Tasks (from WorkOrders)

### 3. **Back Navigation**
- `navigate(-1)` browser back
- Preserves previous page state

### 4. **Image Hover Effects**
- Overlay appears on hover
- Shows context (km value, "Before Work", etc.)
- Black semi-transparent background

---

## 🔀 CONDITIONAL RENDERING

### Task (from WorkOrder) - Shows:
✅ Customer Information
✅ Visit Times (Check-in/out)
✅ Chemicals Used
✅ Observation
✅ Odometer Readings
✅ Before & After Images
✅ Payment Details
✅ Customer Signature
❌ Edit button
❌ Service Description

### Appointment - Shows:
✅ Unit Price, Type, Count
✅ Service Description
❌ Customer Information
❌ Visit Times
❌ Chemicals
❌ Observation
❌ Odometer
❌ Images
❌ Payment
✅ Edit button

---

## 📱 RESPONSIVE LAYOUT

### Desktop (lg screens)
- 4-column grid for quick info
- 3-column customer info grid
- 2-column images side-by-side

### Tablet (md screens)
- 3-column grid
- 2-column grids
- Adjusted padding

### Mobile (sm screens)
- 2-column or 1-column stacking
- Full-width sections
- Reduced padding

---

## 🗄️ DATA SOURCES

| Field | Source | Priority |
|-------|--------|----------|
| Customer Name | WorkOrder | Primary |
| Phone | WorkOrder | Primary |
| Email | WorkOrder | Primary |
| Site Address | WorkOrder.siteAddress → WorkOrder.address | Primary |
| Check-in Time | ServiceAppointment.inTime | Primary |
| Check-out Time | ServiceAppointment.outTime | Primary |
| Payment Amount | ServiceAppointment.payment.amount | Primary |
| Description | ServiceAppointment.serviceDescription → Task.description | Primary |
| Chemicals | Dummy data | Static |
| Odometer | Dummy data | Static |
| Images | Dummy paths | Static |
| Signature | Not implemented | Placeholder |

---

## ⚠️ CURRENT LIMITATIONS

1. **Dummy Data**: Chemicals, Odometer, Images, Signature all use hardcoded/placeholder data
2. **No Signature Display**: Customer signature section shows placeholder only
3. **No Image Upload**: Before/After images are static
4. **No Odometer Form**: Can't add/edit odometer readings
5. **Single Odometer Entry**: Only shows first reading
6. **Edit Disabled for Tasks**: Can't edit service details from work order context

---

## 🎯 KEY IMPROVEMENTS POTENTIAL

### Phase 1 - Data Integration
- [ ] Replace dummy chemicals with actual service items
- [ ] Fetch real odometer readings
- [ ] Load actual before/after images
- [ ] Display customer signature if available

### Phase 2 - Interactivity
- [ ] Allow adding multiple odometer readings
- [ ] Enable image upload for before/after
- [ ] Implement customer signature capture
- [ ] Allow task editing from this page

### Phase 3 - Advanced Features
- [ ] Service duration calculation from times
- [ ] Material cost breakdown
- [ ] Follow-up scheduling
- [ ] Photo gallery with captions
- [ ] Document management (invoices, receipts)

---

## 📌 COMPONENT RELATIONSHIPS

```
ServiceDetailPage
  ├── useParams (get :id)
  ├── useNavigate (back button)
  ├── useServicesStore (get appointments)
  ├── useTasksStore (get tasks)
  ├── useProjectsStore (get workorders)
  │
  ├── ServiceFormModal (edit appointments)
  ├── StatusBadge (show status)
  │
  └── html2canvas + jsPDF (PDF export)
```

---

## 🔗 NAVIGATION CONTEXT

**from=workorder** query parameter indicates:
- Page opened from WorkOrder detail
- Should show Task-specific sections
- Back button navigates to WorkOrder page

---

## 💡 USAGE SCENARIOS

### Scenario 1: View Completed Service
```
Technician completes service task
    ↓
Navigates to /service/TASK-xxx?from=workorder
    ↓
Reviews all task details
    ↓
Downloads PDF as proof of completion
    ↓
Shares with customer
```

### Scenario 2: Audit Service Record
```
Manager opens /service/TASK-xxx
    ↓
Reviews customer info, times, chemicals used
    ↓
Checks payment status
    ↓
Verifies before/after photos (when available)
    ↓
Exports PDF for records
```

---

## 📋 SUMMARY

The **ServiceDetailPage** is a comprehensive service documentation viewer that:
- Displays task/appointment details in a professional format
- Merges data from multiple stores (Tasks, WorkOrders, Appointments)
- Provides PDF export for record-keeping
- Adapts layout based on task vs appointment type
- Uses placeholder sections for future feature integration
- Supports responsive viewing across devices

**Status**: Functional with placeholder sections ready for integration
