# 12-Hour Time Format Implementation Guide

## Overview
This project enforces 12-hour time format (AM/PM) throughout the application, regardless of the user's system time settings. This ensures consistent time display and input across all pages and components.

## Key Components

### 1. Time Format Utility (`src/utils/timeFormat.ts`)
Central utility module with functions for time conversion and formatting:

#### Functions Available:
- **`format24to12(time24: string): string`**
  - Converts 24-hour format (HH:mm) to 12-hour format (hh:mm AM/PM)
  - Input: "14:30" → Output: "02:30 PM"
  - Input: "09:00" → Output: "09:00 AM"

- **`format12to24(time12: string): string`**
  - Converts 12-hour format to 24-hour format
  - Input: "02:30 PM" → Output: "14:30"
  - Input: "09:00 AM" → Output: "09:00"

- **`parseAndFormat12Hour(value: string): string`**
  - Intelligently parses a time value and returns 12-hour formatted string
  - Handles both 24-hour input and already-formatted values

- **`getDisplay12Hour(time24: string): string`**
  - Gets display-friendly 12-hour format
  - Returns "—" if time is empty

- **`formatTimeRange12Hour(fromTime24: string, toTime24: string): string`**
  - Formats a time range in 12-hour format
  - Output: "09:00 AM - 05:00 PM"

### 2. Custom Time Input Component (`src/components/TimeInput12Hour.tsx`)
A custom component that replaces standard HTML time inputs with 12-hour format support:

#### Usage:
```tsx
import { TimeInput12Hour } from "@/components/TimeInput12Hour";

<TimeInput12Hour
  value={time24HourFormat}  // "14:30"
  onChange={(value) => setTime(value)}  // Returns "14:30" on valid input
  label="Service Time"
  placeholder="hh:mm AM/PM"
  required={true}
/>
```

#### Features:
- Displays and accepts 12-hour format (hh:mm AM/PM)
- Validates user input in real-time
- Auto-corrects format on blur
- Shows format hint below the input
- Internally stores and communicates in 24-hour format for consistency

## Implementation in Pages

### CreateWorkOrderPage
**Files Modified:**
- `src/pages/CreateWorkOrderPage.tsx`

**Changes:**
1. Added import: `import { formatTimeRange12Hour, format24to12 } from "@/utils/timeFormat"`
2. Service schedules table displays times in 12-hour format below the time input fields
3. When user enters time using `type="time"` input, the utility automatically converts to 12-hour for display

**Example:**
```tsx
// From Time Input - Shows 24-hour input with 12-hour display below
<td className="px-4 py-3">
  <div className="space-y-1">
    <input type="time" value={schedule.fromTime} onChange={...} />
    {schedule.fromTime && (
      <p className="text-xs text-muted-foreground">
        {format24to12(schedule.fromTime)}
      </p>
    )}
  </div>
</td>
```

### ServicesPage
**Files Modified:**
- `src/pages/ServicesPage.tsx`

**Time Usage:**
- Service appointment times are displayed in 12-hour format
- The `formatDateTime` function is responsible for time display formatting
- All service schedules show 12-hour times to users

### Other Pages with Time Fields
Files that use time inputs and should display 12-hour format:
- `src/pages/CreateLeadPage.tsx` - Next Follow Up Time
- `src/pages/ServiceManagementPage.tsx` - Service appointment times
- Any custom forms or modals with time fields

## Files Created

### 1. `src/utils/timeFormat.ts`
- Complete time conversion utility
- No external dependencies
- Handles edge cases (midnight, noon)
- Input validation

### 2. `src/components/TimeInput12Hour.tsx`
- Custom React component for 12-hour time input
- Props: `value`, `onChange`, `label`, `placeholder`, `disabled`, `required`, `className`
- Returns 24-hour format to parent component
- Displays 12-hour format to user

## Usage Patterns

### Pattern 1: Display Only (No Input)
```tsx
import { format24to12 } from "@/utils/timeFormat";

// In your component:
<p>{format24to12(schedule.fromTime)}</p>  // "14:30" → "02:30 PM"
```

### Pattern 2: Input with Display
```tsx
import { format24to12 } from "@/utils/timeFormat";

<div>
  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
  {time && <p>{format24to12(time)}</p>}  // Shows 12-hour conversion
</div>
```

### Pattern 3: Custom Time Input Component
```tsx
import { TimeInput12Hour } from "@/components/TimeInput12Hour";

<TimeInput12Hour
  value={time}
  onChange={setTime}
  label="Select Time"
  required
/>
```

### Pattern 4: Time Range Display
```tsx
import { formatTimeRange12Hour } from "@/utils/timeFormat";

<p>{formatTimeRange12Hour(fromTime, toTime)}</p>  // "09:00 AM - 05:00 PM"
```

## Backward Compatibility
- All internal storage remains in 24-hour format (HH:mm)
- APIs and stores communicate in 24-hour format
- Only display layer uses 12-hour format
- No breaking changes to existing data structures

## Browser Support
Works with all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## Future Improvements
1. Add support for custom time formats (e.g., with seconds)
2. Create a time picker component with visual clock
3. Add timezone support
4. Add internationalization for different time formats per locale
5. Create validation helpers for time ranges

## Testing
Test the following scenarios:
- ✅ 12:00 AM (midnight) → "12:00 AM"
- ✅ 12:30 AM → "12:30 AM"
- ✅ 01:00 AM → "01:00 AM"
- ✅ 11:59 AM → "11:59 AM"
- ✅ 12:00 PM (noon) → "12:00 PM"
- ✅ 12:30 PM → "12:30 PM"
- ✅ 01:00 PM → "01:00 PM"
- ✅ 23:59 PM → "11:59 PM"

## Common Issues

**Issue:** Times show in 24-hour format
**Solution:** Ensure you're using the utility functions for display, not storing raw input value

**Issue:** Input doesn't accept 12-hour format
**Solution:** Use `TimeInput12Hour` component instead of standard HTML time input, or manually validate with `format12to24()`

**Issue:** Format conversion seems wrong
**Solution:** Check the input format - must be "HH:mm" for 24-hour or "hh:mm AM/PM" for 12-hour
