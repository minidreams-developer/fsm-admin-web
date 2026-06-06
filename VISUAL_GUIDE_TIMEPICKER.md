# Visual Guide: TimePickerDropdown Component

## 🎨 Component Layout

### Default State (No Time Selected)
```
┌─────────────────────────────────────────────────────┐
│ Appointment Time                                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Hour    :    Minute    :    Period                 │
│  [-- ▼]  :    [-- ▼]   :    [-- ▼]                 │
│                                                      │
│  Select from dropdowns (always 12-hour format)      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### With Time Selected (02:30 PM)
```
┌─────────────────────────────────────────────────────┐
│ Appointment Time                                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Hour    :    Minute    :    Period          ✕     │
│  [02 ▼]  :    [30 ▼]   :    [PM ▼]                │
│                                                      │
│  Select from dropdowns (always 12-hour format)      │
│                                                      │
└─────────────────────────────────────────────────────┘
  ↑                                                   ↑
  Label                                        Clear button
```

---

## 🔽 Dropdown States

### Hour Dropdown
```
Click to open:
┌─────────────┐
│ Hour        │
├─────────────┤
│ 01  ←─────────── (Morning)
│ 02
│ 03
│ 04
│ 05
│ 06
│ 07
│ 08
│ 09
│ 10
│ 11
│ 12  ←─────────── (Noon/Midnight)
└─────────────┘

Selected: [02 ▼]
```

### Minute Dropdown
```
Click to open:
┌─────────────┐
│ Minute      │
├─────────────┤
│ 00  ←─────────── (Whole hour)
│ 15  ←─────────── (Quarter hour)
│ 30  ←─────────── (Half hour)
│ 45  ←─────────── (Three quarters)
└─────────────┘

Selected: [30 ▼]
```

### Period Dropdown
```
Click to open:
┌─────────────┐
│ Period      │
├─────────────┤
│ AM  ←─────────── (Morning: 12:00 AM - 11:59 AM)
│ PM  ←─────────── (Evening: 12:00 PM - 11:59 PM)
└─────────────┘

Selected: [PM ▼]
```

---

## ⏰ Time Examples

### Morning Times
```
9:00 AM:
  Hour: [09 ▼]
  Minute: [00 ▼]
  Period: [AM ▼]
  Display: "09:00 AM"
  Stored: "09:00"

10:30 AM:
  Hour: [10 ▼]
  Minute: [30 ▼]
  Period: [AM ▼]
  Display: "10:30 AM"
  Stored: "10:30"
```

### Afternoon Times
```
2:30 PM:
  Hour: [02 ▼]
  Minute: [30 ▼]
  Period: [PM ▼]
  Display: "02:30 PM"
  Stored: "14:30"

3:45 PM:
  Hour: [03 ▼]
  Minute: [45 ▼]
  Period: [PM ▼]
  Display: "03:45 PM"
  Stored: "15:45"
```

### Edge Cases
```
12:00 AM (Midnight):
  Hour: [12 ▼]
  Minute: [00 ▼]
  Period: [AM ▼]
  Display: "12:00 AM"
  Stored: "00:00"

12:00 PM (Noon):
  Hour: [12 ▼]
  Minute: [00 ▼]
  Period: [PM ▼]
  Display: "12:00 PM"
  Stored: "12:00"

11:59 PM:
  Hour: [11 ▼]
  Minute: [45 ▼]  ← (45 is closest to 59)
  Period: [PM ▼]
  Display: "11:45 PM"
  Stored: "23:45"
```

---

## 🔄 User Interaction Flow

### Step 1: Initial State
```
User opens form
         ↓
   ┌─────────────┐
   │ [-- : -- : --] │  ← Empty dropdowns
   └─────────────┘
```

### Step 2: Select Hour
```
User clicks hour dropdown [-- ▼]
         ↓
   ┌──────────────┐
   │ 01           │  ← Dropdown opens
   │ 02  ← User   │
   │ 03  selects  │
   │ 04           │
   │ ...          │
   └──────────────┘
         ↓
   ┌─────────────┐
   │ [02 : -- : --] │  ← Hour selected
   └─────────────┘
```

### Step 3: Select Minute
```
User clicks minute dropdown [-- ▼]
         ↓
   ┌──────────────┐
   │ 00           │
   │ 15           │
   │ 30  ← User   │  ← Dropdown opens
   │ 45  selects  │
   └──────────────┘
         ↓
   ┌─────────────┐
   │ [02 : 30 : --] │  ← Minute selected
   └─────────────┘
```

### Step 4: Select Period
```
User clicks period dropdown [-- ▼]
         ↓
   ┌──────────────┐
   │ AM           │
   │ PM  ← User   │  ← Dropdown opens
   │     selects  │
   └──────────────┘
         ↓
   ┌─────────────┐
   │ [02 : 30 : PM] ✓  ← Complete! Clear button appears
   │             ✕   │
   └─────────────┘
```

### Step 5: Done
```
Time saved: "14:30" (24-hour format)
Display: "02:30 PM" (12-hour format)

User can now:
  - Submit form
  - Clear and reselect (click ✕)
  - Move to next field
```

---

## 📱 Mobile View

### Desktop/Tablet
```
Wide screen - inline dropdowns:
┌────────────────────────────────────────┐
│ Appointment Time                        │
├────────────────────────────────────────┤
│ Hour [02 ▼] : Minute [30 ▼] : [PM ▼] │
└────────────────────────────────────────┘
```

### Mobile Phone
```
Narrow screen - stacked or flexible:
┌──────────────────────────────┐
│ Appointment Time              │
├──────────────────────────────┤
│ [02 ▼]  [30 ▼]  [PM ▼]      │
│                               │
│ (Dropdowns adjust to fit)    │
└──────────────────────────────┘
```

---

## 🎯 Use Cases & Layouts

### Case 1: CreateLeadPage - Next Follow Up Time
```
┌─────────────────────────────────────┐
│ CREATE LEAD                          │
├─────────────────────────────────────┤
│                                      │
│ Customer Name                        │
│ [_____________________________]      │
│                                      │
│ Next Follow Up Date                  │
│ [mm/dd/yyyy]                        │
│                                      │
│ Next Follow Up Time                  │
│ [02 ▼] : [30 ▼] : [PM ▼]          │
│ Select from dropdowns (12-hour)    │
│                                      │
│ Notes                                │
│ [_____________________________]      │
│                                      │
│ [Save Lead] [Cancel]                │
└─────────────────────────────────────┘
```

### Case 2: ServicesPage - Appointment Time
```
┌─────────────────────────────────────┐
│ NEW SERVICE APPOINTMENT              │
├─────────────────────────────────────┤
│                                      │
│ Service Date                         │
│ [mm/dd/yyyy]                        │
│                                      │
│ Time                                 │
│ [09 ▼] : [00 ▼] : [AM ▼]          │
│ Select from dropdowns (12-hour)    │
│                                      │
│ Employee                             │
│ [Select employee ▼]                 │
│                                      │
│ [Schedule] [Cancel]                  │
└─────────────────────────────────────┘
```

### Case 3: CreateWorkOrderPage - Schedule Table
```
┌─────────────────────────────────────────────┐
│ Service Appointments Schedule                │
├──────────────┬────────────────┬─────────────┤
│ From Time    │ To Time        │ Action      │
├──────────────┼────────────────┼─────────────┤
│ [09 ▼]       │ [10 ▼]         │             │
│ : [00 ▼]     │ : [30 ▼]       │             │
│ : [AM ▼]     │ : [AM ▼]       │ [Delete]    │
├──────────────┼────────────────┼─────────────┤
│ [02 ▼]       │ [03 ▼]         │             │
│ : [30 ▼]     │ : [45 ▼]       │             │
│ : [PM ▼]     │ : [PM ▼]       │ [Delete]    │
├──────────────┼────────────────┼─────────────┤
│ [+ Add Schedule]                            │
└─────────────────────────────────────────────┘
```

---

## 🧠 Data Transformation

### From User Selection to Storage
```
User sees & selects:
  Display: "02:30 PM"
  
Component processes:
  1. Captures hour: "02"
  2. Captures minute: "30"
  3. Captures period: "PM"
  4. Checks period = PM and hour ≠ 12
  5. Adds 12 to hour: 02 + 12 = 14
  6. Formats: "14:30"
  
Store/Send:
  Database: "14:30" ✓
  API: { time: "14:30" } ✓
  
Re-display:
  From storage: "14:30"
  Component converts: 14:30 → 02:30 PM
  User sees: "02:30 PM" ✓
```

---

## 🔐 Edge Case Handling

### Midnight (12:00 AM - 12:59 AM)
```
User selects:
  Hour: 12
  Period: AM

Component conversion:
  12 AM + 0 hours = 00:XX (24-hour)
  
Stored as: "00:XX"
Example: 12:30 AM → "00:30"
```

### Noon (12:00 PM - 12:59 PM)
```
User selects:
  Hour: 12
  Period: PM

Component conversion:
  12 PM stays 12 (special case)
  
Stored as: "12:XX"
Example: 12:30 PM → "12:30"
```

### 1 PM to 11 PM
```
User selects:
  Hour: 05
  Period: PM

Component conversion:
  05 PM + 12 hours = 17:XX (24-hour)
  
Stored as: "17:XX"
Example: 5:30 PM → "17:30"
```

### 1 AM to 11 AM
```
User selects:
  Hour: 09
  Period: AM

Component conversion:
  09 AM stays 09 (already 24-hour)
  
Stored as: "09:XX"
Example: 9:30 AM → "09:30"
```

---

## 🎪 Accessible Keyboard Navigation

### Keyboard Shortcuts
```
Tab/Shift+Tab:
  Navigate between dropdowns
  [Hour] → [Minute] → [Period] → [Clear button]

Arrow Keys:
  Open dropdown with ▼
  Navigate options with ↑ ↓
  Select with Enter

Space:
  Toggle dropdown open/close
  Activate buttons

Escape:
  Close dropdown without selection
```

### Example Interaction
```
User presses Tab
  → Focus moves to Hour dropdown

User presses Space
  → Hour dropdown opens

User presses ↓ ↓
  → Selection moves down 2 options

User presses Enter
  → Hour selected, focus to Minute

User presses ↓ (twice for 30)
  → Minute dropdown opens and selects 30

User presses Tab
  → Focus to Period dropdown

User presses Space
  → Period dropdown opens

User presses ↓
  → Selects PM

User presses Enter
  → Time complete: 02:30 PM ✓
```

---

## 🌈 Styling & Theming

### Color Scheme
```
Default theme (bg-secondary):
┌─────────────────────────────┐
│ Appointment Time            │  ← label (muted-foreground)
├─────────────────────────────┤
│ [02 ▼] : [30 ▼] : [PM ▼]  │  ← dropdowns (bg-secondary)
│                             │
│ Helpful text (muted)        │  ← hint (muted-foreground)
└─────────────────────────────┘

Primary button (Done button):
  Background: bg-primary
  Text: text-primary-foreground
  Hover: bg-primary/90
```

### Custom Classes
```tsx
// Add custom styling
<TimePickerDropdown
  className="border-2 border-blue-500"
  // Applies to dropdown container
/>
```

---

## ✨ Special Features

### Clear Button (X)
```
Appears when: Time is selected
Function: Clears all dropdowns
Visual: X button on the right
Example:
  [02 : 30 : PM]  ✕
              ↑
         Click to clear
```

### Format Hint
```
Always shown: Below component
Text: "Select from dropdowns (always 12-hour format)"
Purpose: Remind user of format
Color: muted-foreground (gray/dim)
```

### Required Indicator
```
When required={true}:
  Appointment Time  *
                   ↑
               Red asterisk
Purpose: Show field is required
```

### Disabled State
```
When disabled={true}:
  All dropdowns: opacity-50
  Cursor: not-allowed
  Cannot interact with component
```

---

## 📊 State Management

### Component Internal State
```
const [selectedHour, setSelectedHour] = useState("09");
const [selectedMinute, setSelectedMinute] = useState("00");
const [selectedPeriod, setSelectedPeriod] = useState("AM");
```

### Parent Component State
```
const [appointmentTime, setAppointmentTime] = useState("");

// When user selects 02:30 PM:
setAppointmentTime("14:30");  // Stored as 24-hour
```

### Display vs Storage
```
Storage: "14:30" (24-hour)
Display: "02:30 PM" (12-hour)
Parent reads: "14:30"
Component shows: "02:30 PM"
```

---

## 🎬 Animation & Transitions

### Smooth Interactions
```
Dropdown opening:
  Smooth expand animation
  
Selection highlight:
  Slight background color change
  
Button hover:
  Color transition
  Subtle scale effect (optional)
  
Clear button:
  Fade in when time selected
  Fade out when time cleared
```

---

## Summary

The TimePickerDropdown component provides:
- ✅ Consistent 12-hour format on all systems
- ✅ Intuitive dropdown interface
- ✅ Smooth user experience
- ✅ Full keyboard accessibility
- ✅ Mobile responsiveness
- ✅ Theme support
- ✅ Edge case handling
- ✅ Clear visual feedback

