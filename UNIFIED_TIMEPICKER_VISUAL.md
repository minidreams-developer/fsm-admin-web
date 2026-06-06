# Unified Time Picker - Visual Guide

## 📱 Component Display

### Empty State
```
┌──────────────────────────────────────────────────┐
│ Next Follow Up Time                             │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ hh:mm AM/PM                              ⌚ │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Type (e.g., 2:30pm) or click to select        │
│                                                  │
└──────────────────────────────────────────────────┘
```

### With Time Selected
```
┌──────────────────────────────────────────────────┐
│ Next Follow Up Time                             │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ 09:30 AM                                ⌚ ✕ │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Type (e.g., 2:30pm) or click to select        │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Active/Focused State
```
┌──────────────────────────────────────────────────┐
│ Next Follow Up Time                             │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ 09:30 AM                                ⌚ ✕ ┃  │ ← Focus ring
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                  │
│ Type (e.g., 2:30pm) or click to select        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🎯 User Interactions

### Method 1: Type Time Directly

```
Step 1: User clicks field
┌────────────────────────────────────────┐
│ [hh:mm AM/PM                         ⌚] │ ← Focus
└────────────────────────────────────────┘

Step 2: User types
┌────────────────────────────────────────┐
│ [2:30pm                              ⌚] │ ← Input
└────────────────────────────────────────┘

Step 3: User presses Tab or blur
┌────────────────────────────────────────┐
│ [02:30 PM                            ⌚] │ ← Auto-formatted
└────────────────────────────────────────┘

Result: Stored as "14:30" ✓
```

### Method 2: Click to Pick

```
Step 1: User clicks field
┌────────────────────────────────────────┐
│ [hh:mm AM/PM                         ⌚] │
└────────────────────────────────────────┘
         ↓

Step 2: Picker popup appears
┌─────────────────────────────────────────────────┐
│           Time Picker                           │
├─────────────────────────────────────────────────┤
│                                                 │
│      ↑           ↑              ↑               │
│    [09]        [30]           [AM]             │
│  Hour  :      Min   :        Period            │
│      ↓           ↓              ↓               │
│                                                 │
│  [                  Done                    ]  │
│                                                 │
└─────────────────────────────────────────────────┘

Step 3: User adjusts spinners
         (click +/- buttons)

Step 4: User clicks Done
        ↓
        Popup closes
        ↓
┌────────────────────────────────────────┐
│ [02:30 PM                            ⌚] │ ← Updated
└────────────────────────────────────────┘

Result: Stored as "14:30" ✓
```

---

## 🔄 Spinner Popup Details

### Visual Layout
```
┌──────────────────────────────────────┐
│         Time Picker                  │
├──────────────────────────────────────┤
│                                      │
│     ↑        ↑           ↑           │
│   [09]     [30]        [AM]         │
│  Hour  :   Min   :    Period        │
│     ↓        ↓           ↓           │
│                                      │
│ [          Done                 ]   │
│                                      │
└──────────────────────────────────────┘
```

### Hour Spinner
```
       ↑ (increment)
┌─────────┐
│   09    │ ← Current value
└─────────┘
       ↓ (decrement)

Valid range: 1-12 (12-hour format)
Wraps around: 12 → 1, 0 → 12
```

### Minute Spinner
```
       ↑ (increment by 1)
┌─────────┐
│   30    │ ← Current value
└─────────┘
       ↓ (decrement by 1)

Valid range: 0-59
Wraps around: 59 → 0, -1 → 59
```

### Period Toggle
```
     ↑ (toggle)
┌─────────┐
│   AM    │ ← Current value
└─────────┘
     ↓ (toggle)

Options: AM, PM
Single click toggles between both
```

---

## 📐 Responsive Layouts

### Desktop (Wide)
```
┌─────────────────────────────────────────────────────────┐
│ Label                                                   │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐│
│ │ 09:30 AM                                           ⌚ ││
│ └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
  ↑ Full width available
```

### Tablet (Medium)
```
┌─────────────────────────────────────┐
│ Label                               │
├─────────────────────────────────────┤
│ ┌──────────────────────────────────┐│
│ │ 09:30 AM                       ⌚ ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
  ↑ Constrained width
```

### Mobile (Narrow)
```
┌──────────────────────┐
│ Label                │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │ 09:30 AM      ⌚ │ │
│ └──────────────────┘ │
└──────────────────────┘
  ↑ Full mobile width
```

---

## 🎨 Visual States

### 1. Default (Empty)
```
┌────────────────────────────────────────┐
│ [hh:mm AM/PM                         ⌚] │
└────────────────────────────────────────┘
  ↑ Gray background, placeholder text
```

### 2. Hover
```
┌────────────────────────────────────────┐
│ [hh:mm AM/PM                         ⌚] │ ← Border highlight
└────────────────────────────────────────┘
  ↑ Border color changes, slightly darker
```

### 3. Focus
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ [hh:mm AM/PM                       ⌚] ┃ ← Focus ring
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  ↑ Ring shadow around field
```

### 4. With Value
```
┌────────────────────────────────────────┐
│ [09:30 AM                            ⌚ ✕] │
└────────────────────────────────────────┘
  ↑ Value displayed, clear button visible
```

### 5. Disabled
```
┌────────────────────────────────────────┐
│ [09:30 AM                            ⌚] │ (faded)
└────────────────────────────────────────┘
  ↑ 50% opacity, cursor not-allowed
```

---

## 🎯 Input Acceptance

### Valid Inputs
```
User types:
✅ "2:30pm"       → Converts to "02:30 PM" ✓
✅ "02:30 PM"     → Accepted as-is ✓
✅ "14:30"        → Converts to "02:30 PM" ✓
✅ "230pm"        → Converts to "02:30 PM" ✓
✅ "9:45AM"       → Converts to "09:45 AM" ✓

All format to 12-hour display ✓
All store as 24-hour internally ✓
```

### Invalid Inputs
```
User types:
❌ "25:00"        → Invalid hour, rejected
❌ "12:70"        → Invalid minute, rejected
❌ "abcd"         → Not a time, rejected
❌ ""             → Empty allowed (cleared)
```

---

## 🕐 Time Examples

### Morning Times
```
Input: "8:00 AM"
Display: [08:00 AM ⌚]
Storage: "08:00"
```

### Afternoon Times
```
Input: "2:30 PM"
Display: [02:30 PM ⌚]
Storage: "14:30"
```

### Edge Cases
```
Midnight:
Input: "12:00 AM"
Display: [12:00 AM ⌚]
Storage: "00:00"

Noon:
Input: "12:00 PM"
Display: [12:00 PM ⌚]
Storage: "12:00"

Late Evening:
Input: "11:45 PM"
Display: [11:45 PM ⌚]
Storage: "23:45"
```

---

## 📋 Form Context

### In a Form
```
┌─────────────────────────────────────────┐
│ Create Lead                             │
├─────────────────────────────────────────┤
│                                         │
│ Customer Name *                         │
│ [________________________________]      │
│                                         │
│ Follow Up Date *                        │
│ [mm/dd/yyyy]                           │
│                                         │
│ Follow Up Time                          │
│ [09:30 AM ⌚]  ← Single clean input    │
│                                         │
│ Priority                                │
│ [Select priority ▼]                    │
│                                         │
│ Notes                                   │
│ [____________________________]          │
│ [____________________________]          │
│ [____________________________]          │
│                                         │
│ [Save]  [Cancel]                        │
└─────────────────────────────────────────┘
```

---

## 🔄 Comparison: Before vs After

### BEFORE (3 Inputs)
```
┌───────────────────────────────────────────────────┐
│ Follow Up Time                                    │
├───────────────────────────────────────────────────┤
│ Hour [09▼] : Minute [30▼] : Period [AM▼]        │
│   ↑             ↑              ↑                  │
│   Too many separate controls                    │
└───────────────────────────────────────────────────┘
```

### AFTER (1 Input)
```
┌───────────────────────────────────────────────────┐
│ Follow Up Time                                    │
├───────────────────────────────────────────────────┤
│ [09:30 AM ⌚]                                     │
│   ↑ Single clean unified field                  │
└───────────────────────────────────────────────────┘
```

---

## ✨ Features Demonstration

### 1. Type Input
```
Field shows: [___________________]
User types: "2:30pm"
Field shows: [2:30pm____________]
User blurs: Tab to next field
Field shows: [02:30 PM ⌚]
Stored: "14:30" ✓
```

### 2. Click Picker
```
Field shows: [09:30 AM ⌚]
User clicks: on field
Popup appears with spinners
User adjusts: +/- buttons
User clicks: Done button
Popup closes
Field updates: [Updated time ⌚]
Stored: Updated value ✓
```

### 3. Clear Button
```
Field shows: [09:30 AM ⌚ ✕]
User clicks: ✕ button
Field clears: [___________________]
Field focused: Ready for new input
Stored: "" (empty) ✓
```

---

## 📱 Mobile Interaction

### Tap Field
```
Mobile screen:
┌──────────────────────────┐
│ [09:30 AM ⌚] ← Tap    │
└──────────────────────────┘
         ↓
Picker popup appears
(centered on screen)
```

### Adjust Spinners
```
Large touch targets:
  ┌─ Big + button
  │ ┌─────────┐
  │ │   09    │
  │ └─────────┘
  │ ┌─ Big - button
  
Easy to tap with thumb
```

### Completion
```
User taps "Done"
         ↓
Popup closes
         ↓
Field updated
         ↓
Keyboard dismissed (if active)
```

---

## 🎯 Key Visual Elements

1. **Single Input Field** - Main focus
2. **Clock Icon** - Indicates time field
3. **Clear Button (X)** - Appears when value set
4. **Spinner Controls** - In popup for fine adjustment
5. **Done Button** - Confirms selection
6. **Focus Ring** - Shows keyboard focus
7. **Hover State** - Border highlight

---

## Summary

**Single unified time input that:**
- ✅ Looks professional and clean
- ✅ Accepts type or click input
- ✅ Shows helpful visual indicators
- ✅ Works on all screen sizes
- ✅ Provides smooth interactions
- ✅ Maintains 12-hour format consistency

