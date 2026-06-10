# ProjectsPage Service Display Enhancement

## Overview
Updated the ProjectsPage work order table to display actual service names instead of just a service count badge. This provides better visibility of what services are associated with each work order.

## Changes Made

### File Modified
- `src/pages/ProjectsPage.tsx`

### Previous Behavior (Services Column)
- Showed only a count badge (e.g., "2 Services")
- No indication of which services were associated with the work order
- Users had to click through to the work order details to see service names

### New Behavior (Services Column)
The Services column now displays:

1. **Count Badge** - Shows total number of services (e.g., "2 Services")
2. **Service Names** - Shows up to 2 service names with:
   - 📦 Icon for visual distinction
   - Service name extracted from the serviceType/serviceTypes fields
   - Service names cleaned up (removes AMC/One-Time/frequency info for cleaner display)
   - Light blue background highlighting
3. **Overflow Indicator** - If more than 2 services, shows "+N more" text

### Service Name Extraction Logic
Service names are extracted using a regex pattern that removes the frequency/type information:
```typescript
// Example transformations:
"Cockroach Control (AMC - Monthly)" → "Cockroach Control"
"Termite Control (One-Time)" → "Termite Control"
"Rat Control (AMC - Bi-Monthly)" → "Rat Control"
```

### Data Sources
The Services column uses work order fields:
- `project.serviceTypes` - Array of service strings (preferred)
- `project.serviceType` - Single service string (fallback)

## Visual Layout

```
Services Column Layout:
┌─────────────────────────────────────┐
│ ┌─────────────┐                    │
│ │  [2]        │ Services           │
│ └─────────────┘                    │
│                                    │
│ ┌─────────────────────────────────┐│
│ │ 📦 Cockroach Control            ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 📦 Termite Control              ││
│ └─────────────────────────────────┘│
│                                    │
└─────────────────────────────────────┘

If 3+ services:
┌─────────────────────────────────────┐
│ ┌─────────────┐                    │
│ │  [3]        │ Services           │
│ └─────────────┘                    │
│                                    │
│ ┌─────────────────────────────────┐│
│ │ 📦 Cockroach Control            ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 📦 Termite Control              ││
│ └─────────────────────────────────┘│
│                                    │
│ +1 more                            │
│                                    │
└─────────────────────────────────────┘
```

## Code Changes

### Services Column Implementation (Simplified View)
```typescript
<td className="px-3 py-3 cursor-pointer" onClick={() => navigate(`/work-order/${project.id}`)}>
  {(() => {
    const services = project.serviceTypes?.length 
      ? project.serviceTypes 
      : project.serviceType?.trim() ? [project.serviceType] : [];
    const count = services.length;
    
    // Extract service names (remove AMC/One-Time/frequency info)
    const serviceNames = services.map(svc => {
      const match = svc.match(/^([^(]+)/);
      return match ? match[1].trim() : svc;
    });
    
    return (
      <div className="space-y-1">
        {/* Count badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full 
                           bg-primary/10 text-primary text-xs font-bold">{count}</span>
          <span className="text-xs text-muted-foreground">
            {count === 1 ? "Service" : "Services"}
          </span>
        </div>
        
        {/* Service names */}
        <div className="flex flex-col gap-0.5">
          {serviceNames.slice(0, 2).map((name, idx) => (
            <div key={idx} className="text-xs bg-primary/5 text-primary px-2 py-1 rounded 
                                      whitespace-nowrap truncate">
              📦 {name}
            </div>
          ))}
          {count > 2 && (
            <div className="text-xs text-muted-foreground px-2 py-0.5">
              +{count - 2} more
            </div>
          )}
        </div>
      </div>
    );
  })()}
</td>
```

## Cleanup Changes

### Removed Unused Elements
1. **Imports** - Removed unused `Download` icon and `XLSX` import
2. **Functions** - Removed unused functions:
   - `parseNextServiceDate()` - Not referenced
   - `handleExportToExcel()` - Not being used (code was commented out)
3. **UI Elements** - Removed commented-out Export Data button

### Compiler Status
✓ No TypeScript errors
✓ Clean diagnostics
✓ All imports are used

## Testing Recommendations

1. **Single Service Work Order** - Verify displays:
   - "1 Service" label
   - Service name displayed with icon

2. **Multiple Service Work Order** - Verify displays:
   - Correct count (e.g., "3 Services")
   - First 2 service names
   - "+1 more" indicator

3. **No Service Work Order** - Verify displays:
   - "0 Services" label
   - No service boxes displayed

4. **Long Service Names** - Verify truncation works properly

5. **Click Navigation** - Verify clicking on row still navigates to work order details

## Impact
- **User Experience**: Better visibility of services at-a-glance in the projects list
- **Performance**: Minimal impact - simple string extraction
- **Data**: Uses existing serviceType/serviceTypes fields, no new data needed
- **Compatibility**: Works with existing work order structure

## Notes
- The solution matches the existing visual style of the application
- Service names are automatically cleaned up for display readability
- The hover effect on table rows still works as expected
- All existing filters and sorting remain unaffected
