# Drag-and-Drop Implementation for Quant Calendar

## Overview
Implemented precise grid-based drag-and-drop functionality for scheduling work order services into a time-based calendar grid using `@dnd-kit`.

## Key Features

### 1. Grid-Based Collision Detection
- Each time slot column acts as an independent drop zone
- Strict snapping to column boundaries (no free-position dropping)
- Automatic alignment to nearest valid column

### 2. Visual Feedback
- **Hover Effect**: Active column highlights when dragging over it
- **Drop Preview**: Shows placeholder with time label inside the target column
- **Drag Overlay**: Displays a semi-transparent preview of the dragged item
- **Snap Animation**: Smooth transition when item snaps to column

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

#### 4. DroppableDayCell
- Simplified drop zone for week/month views
- Shows multiple jobs in compact format
- Supports re-dragging of scheduled jobs

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
1. Drag a work order card from the left panel
2. Hover over a time slot column (highlights in blue)
3. Drop to schedule the work order
4. Card snaps precisely to the column

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
