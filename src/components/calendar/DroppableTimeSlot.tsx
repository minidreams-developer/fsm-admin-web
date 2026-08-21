import { useEffect, useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Clock, Users, X } from "lucide-react";

type ScheduledJob = {
  id: string;
  workOrderId: string;
  serviceId?: string;
  employeeId: string;
  startTime: number;
  duration: number;
  date: string;
  selectedTimeSlot: string;
};

type DragData = {
  type: "workOrder" | "service" | "scheduledJob";
  workOrder: any;
  service?: any;
  scheduledJob?: ScheduledJob;
};

interface DroppableTimeSlotProps {
  employeeId: string;
  timeSlot: string;
  date: string;
  job?: ScheduledJob;
  workOrder?: any;
  service?: any;
  priority: string;
  isOver?: boolean;
  onRemoveJob: (jobId: string) => void;
  onResizeStart?: (jobId: string, duration: number) => void;
  onResizeMove?: (jobId: string, duration: number) => void;
  onResizeEnd?: (jobId: string, duration: number) => void;
  onResizeCancel?: () => void;
  resizingJobId?: string | null;
  resizePreview?: number | null;
  priorityBgColors: Record<string, string>;
  formatTimeSlot: (timeSlot: string) => string;
}

export function DroppableTimeSlot({
  employeeId,
  timeSlot,
  date,
  job,
  workOrder,
  service,
  priority,
  isOver,
  onRemoveJob,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  resizingJobId,
  resizePreview,
  priorityBgColors,
  formatTimeSlot,
}: DroppableTimeSlotProps) {
  const dropId = `drop-${employeeId}-${timeSlot}-${date}`;

  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver: isOverCurrent } = useDroppable({
    id: dropId,
    data: {
      employeeId,
      timeSlot,
      date,
    },
  });

  const dragData: DragData | undefined = job
    ? {
        type: "scheduledJob",
        workOrder,
        service: service || undefined,
        scheduledJob: job,
      }
    : undefined;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: job ? `scheduled-${job.id}` : `empty-${dropId}`,
    data: dragData,
    disabled: !job || isResizing,
  });

  const showHighlight = isOverCurrent || isOver;

  const displayDuration =
    resizingJobId === job?.id && resizePreview !== null
      ? resizePreview
      : job?.duration || 2;

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!job || !cardRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeStartX(e.clientX);

    if (onResizeStart) {
      onResizeStart(job.id, job.duration);
    }

    if (cardRef.current) {
      cardRef.current.style.pointerEvents = "none";
    }
  };

  useEffect(() => {
    if (!isResizing || !job) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const deltaX = e.clientX - resizeStartX;
      const parentWidth = cardRef.current.parentElement?.offsetWidth || 1;

      const durationChange = deltaX / parentWidth;
      const newDuration = Math.max(0.5, job.duration + durationChange);

      if (onResizeMove) {
        onResizeMove(job.id, newDuration);
      }
    };

    const handleMouseUp = () => {
      if (!job) return;

      setIsResizing(false);

      if (cardRef.current) {
        cardRef.current.style.pointerEvents = "auto";
      }

      if (onResizeEnd && resizePreview !== null) {
        onResizeEnd(job.id, resizePreview);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    job,
    resizeStartX,
    resizePreview,
    onResizeMove,
    onResizeEnd,
  ]);

  return (
    <div
      ref={setNodeRef}
      className={`relative border-l border-border min-h-[70px] transition-all ${
        showHighlight
          ? "bg-primary/20 ring-2 ring-primary ring-inset"
          : "hover:bg-primary/5"
      } cursor-pointer`}
    >
      {showHighlight && !job && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-primary/10 border-2 border-dashed border-primary rounded-lg p-2 m-1 w-[calc(100%-8px)]">
            <p className="text-xs font-semibold text-primary text-center">
              {formatTimeSlot(timeSlot)}
            </p>
          </div>
        </div>
      )}

      {workOrder && job && (
        <div
          ref={(node) => {
            setDragRef(node);
            if (node) cardRef.current = node;
          }}
          {...(isResizing ? {} : listeners)}
          {...(isResizing ? {} : attributes)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            const target = e.target as HTMLElement;

            if (target.closest("[data-resize-handle]")) {
              e.stopPropagation();
            }
          }}
          className={`group absolute rounded-lg p-2 border-2 shadow-md transition-all ${
            isResizing
              ? "cursor-ew-resize select-none"
              : "cursor-move hover:shadow-lg"
          } ${priorityBgColors[priority]} ${
            isDragging ? "opacity-50" : ""
          }`}
          style={{
            width: `calc(${displayDuration * 100}% - 4px)`,
            left: "2px",
            top: "4px",
            bottom: "4px",
            zIndex: isDragging || isResizing ? 50 : 10,
            userSelect: isResizing ? "none" : "auto",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveJob(job.id);
            }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20"
            title="Remove service"
          >
            <X className="w-3 h-3" />
          </button>

          <div
            data-resize-handle="true"
            onMouseDown={handleResizeMouseDown}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-primary/40 transition-colors z-30 flex items-center justify-center"
            style={{ touchAction: "none" }}
            title="Drag to resize duration"
          >
            <div className="w-1 h-12 bg-primary/60 rounded group-hover:bg-primary/80 transition-colors pointer-events-none" />
          </div>

          <p className="text-xs font-bold truncate pr-2">
            {workOrder.id}
          </p>

          {service ? (
            <p className="text-[10px] truncate font-semibold text-primary pr-2">
              {service.title}
            </p>
          ) : (
            <p className="text-[10px] truncate pr-2">
              {workOrder.customer}
            </p>
          )}

          <div className="flex items-center justify-between mt-1 pr-2">
            <p className="text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" />

              {formatTimeSlot(timeSlot)}

              {displayDuration !== 2 && (
                <span className="text-[9px] text-primary font-semibold">
                  +{displayDuration}h
                </span>
              )}
            </p>

            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="text-[10px]">2</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}