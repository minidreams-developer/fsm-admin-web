# Drag-and-Drop Implementation for Quant Calendar

## Overview
Implemented precise grid-based drag-and-drop functionality for scheduling work order **services** (not work orders) into a time-based calendar grid using `@dnd-kit`.

## Important: Services Only
**Only individual services can be dragged into the timeslot table, not entire work orders.**

- Work orders without services are displayed but cannot be dragged (shown with "No Services" badge)
- Work orders with services must be clicked to expand and show individual services
- Only the individual services from the expanded panel can be dragged into time slots
- This ensures granular scheduling at the service level rather than work order level

## Key Features

### 1. Grid-Based Collision Detection
- Each time slot column acts as an independent drop zone
- Strict snapping to column boundaries (no free-position dropping)
- Automatic alignment to nearest valid column

### 2. Cancel/Remove Services
- **Hover to reveal**: Hover over any scheduled service to see a red X button
- **Click to remove**: Click the X button to remove the service instantly
- **No confirmation**: Service is removed immediately for quick workflow
- **Toast notification**: Shows success message after removal
- **Re-draggable**: Removed services can be dragged back into the schedule

### 3. Visual Feedback
- **Hover Effect**: Active column highlights when dragging over it
- **Drop Preview**: Shows placeholder with time label inside the target column
- **Drag Overlay**: Displays a semi-transparent preview of the dragged item
- **Snap Animation**: Smooth transition when item snaps to column
- **Remove Button**: Red X button appears on hover (day view) or always visible (week/month view)

### 3. Data Storage
Each dropped service stores:
- `id`: Unique identifier for the scheduled job
- `employeeId`: ID of the assigned employee
- `workOrderId`: ID of the work order
- `serviceId`: ID of the specific service (optional)
- `selectedTimeSlot`: Formatted time slot (e.g., "7AM")
- `startTime`: Numeric hour (e.g., 7)
- `duration`: Duration in hours
- `date`: Date string (YYYY-MM-DD)

### 4. Re-dragging Support
- Already placed services can be dragged between time slots
- Time slot updates dynamically on drop
- Conflict detection prevents overlapping schedules

### 5. Conflict Detection
- Checks for time slot conflicts before allowing drop
- Prevents overlapping schedules for the same employee
- Shows alert if conflict detected
- Restores original position if drop is invalid

## Technical Implementation

### Libraries Used
- `@dnd-kit/core`: Core drag-and-drop functionality
- `@dnd-kit/sortable`: Sorting strategies
- `@dnd-kit/utilities`: Utility functions

### Key Components

#### 1. DraggableWorkOrderCard
- Renders draggable work order cards in the left panel
- Supports both work orders and individual services
- Shows priority-based color coding

#### 2. DraggableServiceCard
- Renders draggable service cards when work order is expanded
- Shows service status and assignment information

#### 3. DroppableTimeSlot
- Renders each time slot column as a drop zone
- Shows scheduled jobs with drag capability
- Displays hover effects and drop previews
- Handles both dragging and dropping

#### 4. DraggableScheduledJobCard
- Renders draggable scheduled jobs in week/month views
- Supports re-dragging between days
- Shows work order and service information in compact format

#### 5. DroppableDayCell
- Simplified drop zone for week/month views
- Shows multiple jobs in compact format
- Uses DraggableScheduledJobCard for each job to enable re-dragging

### Drag Handlers

#### handleDragStart
- Captures drag data (work order, service, or scheduled job)
- Removes scheduled job from schedule if re-dragging
- Sets active drag state for overlay

#### handleDragOver
- Tracks which drop zone is currently hovered
- Updates active drop zone state for visual feedback

#### handleDragEnd
- Validates drop target
- Checks for time slot conflicts
- Creates new scheduled job with all required data
- Updates schedule state
- Restores job if drop was invalid

#### handleDragCancel
- Restores scheduled job if drag was cancelled
- Cleans up drag state

## Usage

### Dragging Work Orders
1. ~~Drag a work order card from the left panel~~ **Work orders cannot be dragged directly**
2. Click a work order card that has services (shows "Click to expand" badge)
3. The services panel appears in the middle showing all services for that work order
4. Drag individual service cards from the services panel
5. Hover over a time slot column (highlights in blue)
6. Drop to schedule the service
7. Card snaps precisely to the column

### Dragging Services
1. Click a work order with multiple services
2. Services panel appears in the middle
3. Drag individual service cards
4. Drop into specific time slots

### Re-scheduling
1. Drag an already scheduled job
2. Move to a different time slot or employee
3. Drop to update the schedule
4. Conflict detection prevents invalid moves

### Removing Services
1. Hover over a scheduled service card
2. Red X button appears in the top-right corner
3. Click the X button
4. Service is removed instantly with a success notification
5. Service can be re-dragged if needed

## Visual Enhancements

### Hover Effects
- Time slot columns highlight with blue background when hovered
- Ring border appears around active drop zone

### Drop Preview
- Dashed border placeholder shows where item will be placed
- Time label displays inside the placeholder

### Drag Overlay
- Semi-transparent copy of dragged item follows cursor
- Slight rotation and scale for visual depth
- Shows work order or service information

### Snap Animation
- Smooth CSS transitions when items snap to columns
- Shadow effects on hover and drag

## Grid Alignment

### Column Width
- Each time slot column has equal width
- Scheduled jobs span multiple columns based on duration
- No overflow to adjacent columns

### Pixel-Perfect Alignment
- Card width = column width × duration
- Left/right padding ensures no overlap
- Top/bottom padding for visual spacing

## Future Enhancements

1. **Multi-select**: Drag multiple services at once
2. **Resize**: Adjust duration by dragging edges
3. **Copy**: Duplicate schedules across days
4. **Undo/Redo**: History management for schedule changes
5. **Keyboard Navigation**: Accessibility improvements
6. **Touch Support**: Mobile-friendly drag-and-drop
