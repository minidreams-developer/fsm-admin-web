# Service Duration Resize - Visual Guide

## Visual Elements

### 1. Normal State (No Hover)
```
┌─────────────────────────────┐
│ WO-001                      │
│ Pest Control                │
│ 🕐 9AM                      │
└─────────────────────────────┘
```
- Standard service card
- No resize handle visible
- Cursor: default

### 2. Hover State
```
┌─────────────────────────────┐
│ WO-001                    ❌│ ← Remove button
│ Pest Control               ║│ ← Resize handle
│ 🕐 9AM                     ║│
└─────────────────────────────┘
```
- Remove button (❌) appears top-right
- Resize handle (║) appears right edge
- Cursor: move (on card), ew-resize (on handle)

### 3. Resizing State
```
┌─────────────────────────────────────┐
│ WO-001                            ❌│
│ Pest Control                       ║│ ← Dragging this
│ 🕐 9AM +2.5h                       ║│ ← Duration shown
└─────────────────────────────────────┘
     ↑                               ↑
  Start time                    End time
  (fixed)                       (extends)
```
- Card width extends in real-time
- Duration indicator shows: `+2.5h`
- Cursor: ew-resize
- Dragging disabled

## Resize Handle Details

### Handle Structure
```
Right edge of card:
│
│  ← 2px hover area (transparent)
│
║  ← 1px visual indicator (semi-transparent primary color)
│
│
```

### Handle States
1. **Hidden**: Not visible when not hovering
2. **Visible**: `bg-primary/20` on card hover
3. **Hover**: `bg-primary/30` when hovering handle
4. **Active**: Full opacity during resize

## Duration Display

### Default Duration (2 hours)
```
🕐 9AM
```
- No duration indicator shown
- Assumes 2-hour default

### Custom Duration
```
🕐 9AM +1.5h    → 9:00 AM to 10:30 AM
🕐 10AM +3h     → 10:00 AM to 1:00 PM
🕐 2PM +0.5h    → 2:00 PM to 2:30 PM
```
- Shows `+{duration}h` when not default
- Updates in real-time during resize

## Card Width Calculation

### Formula
```
width = duration × 100% - 4px
```

### Examples
```
Duration: 0.5h → Width: 50% - 4px  (half column)
Duration: 1.0h → Width: 100% - 4px (one column)
Duration: 1.5h → Width: 150% - 4px (1.5 columns)
Duration: 2.0h → Width: 200% - 4px (two columns)
Duration: 3.0h → Width: 300% - 4px (three columns)
```

### Visual Representation
```
Time:    9AM      10AM      11AM      12PM
         │         │         │         │
         ├─────────┤         │         │  ← 1 hour
         ├─────────┴─────────┤         │  ← 2 hours
         ├─────────┴─────────┴─────────┤  ← 3 hours
```

## Snapping Behavior

### 30-Minute Increments
```
User drags to:    Snaps to:
0.2h              0.5h  (minimum)
0.7h              0.5h
0.8h              1.0h
1.2h              1.0h
1.3h              1.5h
1.7h              1.5h
1.8h              2.0h
2.3h              2.5h
```

### Visual Snapping
```
Dragging:
├─────────┼─────────┼─────────┤
0h       0.5h      1.0h      1.5h
         ↑         ↑         ↑
      Snap points (30 min intervals)
```

## Interaction Flow

### Step-by-Step Visual
```
1. Initial State (2 hours)
   ┌─────────────────────────────┐
   │ WO-001                      │
   │ Pest Control                │
   │ 🕐 9AM                      │
   └─────────────────────────────┘

2. Hover (resize handle appears)
   ┌─────────────────────────────┐
   │ WO-001                    ❌│
   │ Pest Control               ║│ ← Click here
   │ 🕐 9AM                     ║│
   └─────────────────────────────┘

3. Start Resize (click and hold)
   ┌─────────────────────────────┐
   │ WO-001                    ❌│
   │ Pest Control               ║│ ← Holding
   │ 🕐 9AM +2h                 ║│
   └─────────────────────────────┘
                                 ↑
                              Cursor here

4. Drag Right (increase duration)
   ┌─────────────────────────────────────┐
   │ WO-001                            ❌│
   │ Pest Control                       ║│ ← Dragging
   │ 🕐 9AM +2.5h                       ║│
   └─────────────────────────────────────┘
                                         ↑
                                    Cursor here

5. Release (apply new duration)
   ┌─────────────────────────────────────┐
   │ WO-001                            ❌│
   │ Pest Control                       ║│
   │ 🕐 9AM +2.5h                       ║│
   └─────────────────────────────────────┘
   
   Toast: "Duration updated to 2.5 hours"
```

## Multiple Instances Example

### Same Service, Different Durations
```
Employee A:
┌─────────────────────────────┐
│ WO-001                      │
│ Pest Control                │
│ 🕐 9AM +2h                  │
└─────────────────────────────┘

Employee B:
┌─────────────────────────────────────┐
│ WO-001                            ❌│
│ Pest Control                       ║│
│ 🕐 10AM +3h                        ║│
└─────────────────────────────────────┘

Employee C:
┌──────────────────┐
│ WO-001         ❌│
│ Pest Control    ║│
│ 🕐 2PM +1h      ║│
└──────────────────┘
```
- Same service (Pest Control)
- Different employees
- Different durations (2h, 3h, 1h)
- Each resizable independently

## Color Coding (Priority)

### Priority Colors with Resize Handle
```
LOW (Green):
┌─────────────────────────────┐
│ WO-001                    ❌│ ← Green background
│ Service                    ║│ ← Green border
│ 🕐 9AM                     ║│
└─────────────────────────────┘

MEDIUM (Yellow):
┌─────────────────────────────┐
│ WO-002                    ❌│ ← Yellow background
│ Service                    ║│ ← Yellow border
│ 🕐 10AM                    ║│
└─────────────────────────────┘

HIGH (Orange):
┌─────────────────────────────┐
│ WO-003                    ❌│ ← Orange background
│ Service                    ║│ ← Orange border
│ 🕐 11AM                    ║│
└─────────────────────────────┘

URGENT (Red):
┌─────────────────────────────┐
│ WO-004                    ❌│ ← Red background
│ Service                    ║│ ← Red border
│ 🕐 12PM                    ║│
└─────────────────────────────┘
```

## Cursor States

### Visual Cursor Guide
```
On Card Body:
  ✋ move (can drag to reschedule)

On Resize Handle:
  ↔ ew-resize (can resize duration)

During Resize:
  ↔ ew-resize (everywhere)

During Drag:
  ✊ grabbing (moving card)
```

## Edge Cases

### Minimum Duration (0.5h)
```
Try to make smaller:
┌──────────┐
│ WO-001 ❌│
│ Service ║│ ← Can't go smaller
│ 🕐 9AM  ║│
└──────────┘
   0.5h (minimum)
```

### Maximum Duration (Grid Limit)
```
Extends across multiple columns:
┌─────────────────────────────────────────────────────────┐
│ WO-001                                                ❌│
│ Service                                                ║│
│ 🕐 9AM +6h                                             ║│
└─────────────────────────────────────────────────────────┘
  9AM      10AM      11AM      12PM      1PM      2PM      3PM
```

## Responsive Behavior

### Grid Layout
```
Each column = 1 hour of time

┌─────────┬─────────┬─────────┬─────────┐
│  9AM    │  10AM   │  11AM   │  12PM   │
├─────────┼─────────┼─────────┼─────────┤
│         │         │         │         │
│  ┌──────┴─────┐   │         │         │ ← 1.5h service
│  │ Service    │   │         │         │
│  └────────────┘   │         │         │
│         │         │         │         │
└─────────┴─────────┴─────────┴─────────┘
```

## Summary

The resize feature provides intuitive visual feedback through:
- **Discoverable Handle**: Appears on hover
- **Clear Cursor**: Changes to indicate resize mode
- **Live Preview**: Width updates in real-time
- **Duration Display**: Shows exact duration
- **Snapping**: Prevents micro-adjustments
- **Color Coding**: Maintains priority colors
- **Independent Instances**: Each service resizes separately

This creates a smooth, professional scheduling experience.
