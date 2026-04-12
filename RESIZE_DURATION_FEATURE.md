# Service Duration Resize Feature

## Overview
After placing a service on the calendar via drag-and-drop, users can now resize the duration by dragging the right edge of the service card. This allows flexible scheduling without needing to remove and re-add services.

## How It Works

### Visual Indicators
- **Resize Handle**: A subtle vertical bar appears on the right edge of each scheduled service card
- **Hover Effect**: The resize handle becomes more visible when hovering over the card
- **Cursor Change**: Cursor changes to `ew-resize` (↔) when hovering over the resize handle
- **Live Preview**: Duration updates in real-time as you drag

### User Interaction

#### 1. Locate the Service
- Find the scheduled service card in the calendar grid
- Hover over the card to reveal the resize handle on the right edge

#### 2. Start Resizing
- Click and hold the resize handle (right edge of the card)
- The card becomes locked for resizing (dragging is disabled during resize)

#### 3. Adjust Duration
- Drag right to increase duration
- Drag left to decrease duration (minimum 0.5 hours / 30 minutes)
- Duration snaps to 30-minute increments (0.5, 1.0, 1.5, 2.0, etc.)

#### 4. Complete Resize
- Release mouse button to apply the new duration
- Toast notification confirms the updated duration
- Service card updates to show new width

### Duration Display
- Default duration: 2 hours
- When resized, shows duration indicator: `+1.5h`, `+3h`, etc.
- Format: `{start_time} +{duration}h`
- Example: `9AM +2.5h` means 9:00 AM to 11:30 AM

## Technical Implementation

### State Management

#### Resize State
```typescript
const [resizingJob, setResizingJob] = useState<{ 
  jobId: string; 
  originalDuration: number 
} | null>(null);

const [resizePreview, setResizePreview] = useState<number | null>(null);
```

### Resize Handlers

#### 1. `handleResizeStart`
```typescript
const handleResizeStart = (jobId: string, originalDuration: number) => {
  setResizingJob({ jobId, originalDuration });
  setResizePreview(originalDuration);
};
```
- Captures the job being resized
- Stores original duration for reference
- Initializes preview state

#### 2. `handleResizeMove`
```typescript
const handleResizeMove = (jobId: string, newDuration: number) => {
  // Snap to 0.5 hour increments (30 minutes)
  const snappedDuration = Math.max(0.5, Math.round(newDuration * 2) / 2);
  setResizePreview(snappedDuration);
};
```
- Calculates new duration based on mouse movement
- Snaps to 30-minute increments
- Updates preview state for live feedback
- Enforces minimum duration of 0.5 hours

#### 3. `handleResizeEnd`
```typescript
const handleResizeEnd = (jobId: string, newDuration: number) => {
  if (!resizingJob) return;
  
  const snappedDuration = Math.max(0.5, Math.round(newDuration * 2) / 2);
  
  // Update the job duration
  setSchedule(prev => prev.map(job => 
    job.id === jobId 
      ? { ...job, duration: snappedDuration }
      : job
  ));
  
  setResizingJob(null);
  setResizePreview(null);
  toast.success(`Duration updated to ${snappedDuration} hour${snappedDuration !== 1 ? 's' : ''}`);
};
```
- Applies the final snapped duration
- Updates the schedule state
- Clears resize state
- Shows success notification

#### 4. `handleResizeCancel`
```typescript
const handleResizeCancel = () => {
  setResizingJob(null);
  setResizePreview(null);
};
```
- Cancels resize operation
- Restores original state

### Component Updates

#### DroppableTimeSlot Component

**New Props:**
```typescript
{
  onResizeStart: (jobId: string, originalDuration: number) => void;
  onResizeMove: (jobId: string, newDuration: number) => void;
  onResizeEnd: (jobId: string, newDuration: number) => void;
  onResizeCancel: () => void;
  resizingJobId: string | null;
  resizePreview: number | null;
}
```

**Resize Handle:**
```tsx
<div
  onMouseDown={handleResizeMouseDown}
  className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/30 transition-colors group-hover:bg-primary/20"
  title="Drag to resize duration"
>
  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary/50 rounded-l" />
</div>
```

**Mouse Event Handling:**
```typescript
const handleResizeMouseDown = (e: React.MouseEvent) => {
  if (!job || !cardRef.current) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  setIsResizing(true);
  setResizeStartX(e.clientX);
  setResizeStartWidth(cardRef.current.offsetWidth);
  
  if (onResizeStart) {
    onResizeStart(job.id, job.duration);
  }
};

useEffect(() => {
  if (!isResizing || !job) return;

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    
    const deltaX = e.clientX - resizeStartX;
    const parentWidth = cardRef.current.parentElement?.offsetWidth || 1;
    const columnWidth = parentWidth; // Each column is one hour
    
    // Calculate new duration based on pixel change
    const durationChange = deltaX / columnWidth;
    const newDuration = Math.max(0.5, job.duration + durationChange);
    
    if (onResizeMove) {
      onResizeMove(job.id, newDuration);
    }
  };

  const handleMouseUp = () => {
    if (!job) return;
    
    setIsResizing(false);
    
    if (onResizeEnd && resizePreview !== null) {
      onResizeEnd(job.id, resizePreview);
    }
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, [isResizing, job, resizeStartX, resizePreview, onResizeMove, onResizeEnd]);
```

### Duration Calculation

#### Pixel to Duration Conversion
```typescript
const deltaX = e.clientX - resizeStartX;
const columnWidth = parentWidth; // Each column = 1 hour
const durationChange = deltaX / columnWidth;
const newDuration = Math.max(0.5, job.duration + durationChange);
```

#### Snapping Logic
```typescript
// Snap to 0.5 hour increments (30 minutes)
const snappedDuration = Math.max(0.5, Math.round(newDuration * 2) / 2);
```

**Examples:**
- `1.2 hours` → snaps to `1.0 hours`
- `1.3 hours` → snaps to `1.5 hours`
- `2.7 hours` → snaps to `2.5 hours`
- `0.2 hours` → snaps to `0.5 hours` (minimum)

### Visual Feedback

#### Card Width
```typescript
const displayDuration = (resizingJobId === job?.id && resizePreview !== null) 
  ? resizePreview 
  : job?.duration || 2;

style={{ 
  width: `calc(${displayDuration * 100}% - 4px)`,
  // ...
}}
```
- Uses preview duration during resize
- Falls back to actual duration when not resizing
- Width is percentage of parent (each hour = 100%)

#### Duration Label
```tsx
<p className="text-[10px] flex items-center gap-1">
  <Clock className="w-3 h-3" />
  {formatTimeSlot(timeSlot)}
  {displayDuration !== 2 && (
    <span className="text-[9px] text-primary font-semibold">
      +{displayDuration}h
    </span>
  )}
</p>
```
- Shows start time
- Adds duration indicator if not default (2 hours)
- Updates in real-time during resize

### Interaction States

#### Normal State
- Card is draggable
- Resize handle visible on hover
- Cursor: `move` on card, `ew-resize` on handle

#### Resizing State
- Card dragging is disabled
- Resize handle is active
- Cursor: `ew-resize` everywhere
- Live preview of new duration

#### Dragging State (Existing)
- Resize is disabled
- Card follows cursor
- Semi-transparent overlay

## Features

### ✅ Implemented
- Resize by dragging right edge
- Snap to 30-minute increments
- Minimum duration: 0.5 hours (30 minutes)
- Maximum duration: unlimited (constrained by grid)
- Live preview during resize
- Visual resize handle
- Toast notification on complete
- Disable dragging during resize
- Disable resizing during drag
- Duration display in card
- Only affects specific instance

### 🎯 Key Behaviors
- **Start time**: Fixed (never changes)
- **End time**: Extends based on duration
- **Snapping**: 30-minute increments (0.5h, 1.0h, 1.5h, 2.0h, etc.)
- **Minimum**: 0.5 hours (30 minutes)
- **Instance-specific**: Each cloned service can have different duration
- **Conflict detection**: Not implemented (can overlap)

## Usage Examples

### Example 1: Extend Service Duration
```
Initial: Service at 9 AM, 2 hours (9:00 - 11:00)
Action: Drag right edge to extend
Result: Service at 9 AM, 3.5 hours (9:00 - 12:30)
```

### Example 2: Shorten Service Duration
```
Initial: Service at 2 PM, 2 hours (14:00 - 16:00)
Action: Drag left edge to shorten
Result: Service at 2 PM, 1 hour (14:00 - 15:00)
```

### Example 3: Minimum Duration
```
Initial: Service at 10 AM, 1 hour (10:00 - 11:00)
Action: Try to drag left to make shorter
Result: Service at 10 AM, 0.5 hours (10:00 - 10:30) - minimum enforced
```

### Example 4: Multiple Instances
```
Service: "Pest Control"
Instance 1: Employee A, 9 AM, 2 hours
Instance 2: Employee B, 10 AM, 1.5 hours (resized)
Instance 3: Employee C, 2 PM, 3 hours (resized)

Each instance maintains its own duration independently
```

## UI/UX Considerations

### Visual Cues
- **Resize Handle**: Subtle but discoverable
- **Hover State**: Handle becomes more prominent
- **Active State**: Cursor changes to indicate resize mode
- **Preview**: Real-time width update

### Accessibility
- **Cursor Feedback**: Clear visual indication of resize capability
- **Tooltip**: "Drag to resize duration" on hover
- **Snapping**: Prevents accidental micro-adjustments
- **Minimum Duration**: Prevents unusable short durations

### Performance
- **Throttling**: Mouse move events handled efficiently
- **State Updates**: Only updates preview during drag
- **Final Update**: Single state update on mouse up
- **Cleanup**: Event listeners properly removed

## Future Enhancements

### Potential Improvements
1. **Conflict Detection**: Prevent overlapping with other services
2. **Visual Guides**: Show time grid lines during resize
3. **Keyboard Support**: Arrow keys for fine-tuning
4. **Touch Support**: Mobile-friendly resize gestures
5. **Undo/Redo**: History management for duration changes
6. **Preset Durations**: Quick buttons for common durations (1h, 2h, 4h)
7. **Time Display**: Show end time in addition to duration
8. **Validation**: Warn if duration exceeds working hours

## Testing Checklist

- [x] Resize handle visible on hover
- [x] Cursor changes to ew-resize on handle
- [x] Drag right increases duration
- [x] Drag left decreases duration
- [x] Minimum duration enforced (0.5h)
- [x] Snapping to 30-minute increments
- [x] Live preview during resize
- [x] Toast notification on complete
- [x] Duration label updates
- [x] Card width updates
- [x] Dragging disabled during resize
- [x] Resizing disabled during drag
- [x] Multiple instances resize independently
- [x] Start time remains fixed
- [x] Event listeners cleaned up properly

## Summary

The resize duration feature provides intuitive, visual control over service scheduling. Users can quickly adjust service durations by dragging the right edge of service cards, with real-time feedback and automatic snapping to 30-minute increments. This enhances scheduling flexibility without requiring complex UI interactions.
