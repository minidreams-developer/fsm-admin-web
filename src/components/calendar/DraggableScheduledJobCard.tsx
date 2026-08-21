import { X } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

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

interface DraggableScheduledJobCardProps {
  job: ScheduledJob;
  workOrder: any;
  service?: any;
  getPriority: (workOrder: any) => string;
  priorityBgColors: Record<string, string>;
  onRemoveJob?: (jobId: string) => void;
}

export function DraggableScheduledJobCard({
  job,
  workOrder,
  service,
  getPriority,
  priorityBgColors,
  onRemoveJob,
}: DraggableScheduledJobCardProps) {
  const dragData: DragData = {
    type: "scheduledJob",
    workOrder,
    service: service || undefined,
    scheduledJob: job,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `scheduled-day-${job.id}`,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => e.stopPropagation()}
      className={`group relative mt-1 rounded p-1 border text-[10px] cursor-move hover:shadow-md transition-all ${
        priorityBgColors[getPriority(workOrder)]
      } ${isDragging ? "opacity-50" : ""}`}
    >
      {onRemoveJob && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveJob(job.id);
          }}
          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20"
          title="Remove service"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}

      <p className="font-bold truncate">{workOrder.id}</p>

      {service && (
        <p className="truncate text-[9px]">
          {service.name}
        </p>
      )}

      {service?.assignedTo && (
        <p className="text-[10px] text-muted-foreground">
          Assigned: {service.assignedTo}
        </p>
      )}
    </div>
  );
}