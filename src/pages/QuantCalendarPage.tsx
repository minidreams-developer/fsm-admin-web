import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Plus, 
  Zap,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  Filter,
  Calendar as CalendarIcon
} from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useTasksStore } from "@/store/tasksStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// Types
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type ViewMode = "day" | "week" | "month";

type ScheduledJob = {
  id: string; // Unique ID for the scheduled job
  workOrderId: string;
  serviceId?: string; // Add service/task ID
  employeeId: string;
  startTime: number;
  duration: number;
  date: string; // Add date to track which day the job is scheduled
  selectedTimeSlot: string; // e.g., "7AM"
};

type DragData = {
  type: 'workOrder' | 'service' | 'scheduledJob';
  workOrder: any;
  service?: any;
  scheduledJob?: ScheduledJob;
};

// Draggable Scheduled Job for Week/Month View
const DraggableScheduledJobCard = ({ job, workOrder, service, getPriority, priorityBgColors }: any) => {
  const dragData: DragData = {
    type: 'scheduledJob',
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
      className={`mt-1 rounded p-1 border text-[10px] cursor-move hover:shadow-md transition-all ${priorityBgColors[getPriority(workOrder)]} ${isDragging ? 'opacity-50' : ''}`}
    >
      <p className="font-bold truncate">{workOrder.id}</p>
      {service ? (
        <p className="truncate font-semibold">{service.title}</p>
      ) : (
        <p className="truncate">{formatTimeSlot(job.startTime)}</p>
      )}
    </div>
  );
};

// Droppable Day Cell for Week/Month View
const DroppableDayCell = ({ employeeId, date, dayJobs, workOrders, getTasksByWorkOrder, getPriority, priorityBgColors, activeDropZone }: any) => {
  const dropId = `drop-day-${employeeId}-${date}`;
  
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: {
      employeeId,
      timeSlot: 9, // Default time for week/month view
      date,
    },
  });

  const showHighlight = isOver || (activeDropZone?.employeeId === employeeId && activeDropZone?.date === date);

  return (
    <div
      ref={setNodeRef}
      className={`relative border-l border-border min-h-[70px] transition-colors p-1 cursor-pointer ${
        showHighlight ? 'bg-primary/20 ring-2 ring-primary ring-inset' : 'hover:bg-primary/5'
      }`}
    >
      <div className="text-xs font-semibold text-primary">{dayJobs.length} jobs</div>
      {dayJobs.slice(0, 2).map((job: any, idx: number) => {
        const wo = workOrders.find((w: any) => w.id === job.workOrderId);
        const service = job.serviceId ? getTasksByWorkOrder(job.workOrderId).find((s: any) => s.id === job.serviceId) : null;
        if (!wo) return null;

        return (
          <DraggableScheduledJobCard
            key={job.id}
            job={job}
            workOrder={wo}
            service={service}
            getPriority={getPriority}
            priorityBgColors={priorityBgColors}
          />
        );
      })}
      {dayJobs.length > 2 && (
        <div className="mt-1 text-[10px] text-muted-foreground">+{dayJobs.length - 2} more</div>
      )}
      {dayJobs.length === 0 && (
        <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
          {showHighlight ? 'Drop here' : 'Empty'}
        </div>
      )}
    </div>
  );
};

const timeSlots = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

// Helper function to format time slot
const formatTimeSlot = (hour: number): string => {
  if (hour === 12) return "12PM";
  if (hour > 12) return `${hour - 12}PM`;
  if (hour === 0) return "12AM";
  return `${hour}AM`;
};

// Draggable Work Order Card Component
const DraggableWorkOrderCard = ({ wo, service, priority, hasServices, isSelected, onWorkOrderClick }: any) => {
  // Only make it draggable if it's a service, not a work order
  const isDraggable = !!service;
  
  const dragData: DragData = service ? {
    type: 'service',
    workOrder: wo,
    service: service,
  } : {
    type: 'workOrder',
    workOrder: wo,
    service: undefined,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: service ? `service-${service.id}` : `wo-${wo.id}`,
    data: dragData,
    disabled: !isDraggable, // Disable dragging for work orders without services
  });

  return (
    <div
      ref={isDraggable ? setNodeRef : undefined}
      {...(isDraggable ? listeners : {})}
      {...(isDraggable ? attributes : {})}
      className={`p-3 rounded-lg border hover:shadow-md transition-all ${priorityBgColors[priority]} ${isDraggable ? 'cursor-move' : hasServices ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${isSelected ? 'ring-2 ring-primary' : ''} ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => hasServices && !service && onWorkOrderClick(wo)}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2 flex-1">
          <p className="text-xs font-bold">{wo.id}</p>
          {!hasServices && !service && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">No Services</span>
          )}
        </div>
        <span className="text-[10px]">
          {wo.workOrderDateTime ? new Date(wo.workOrderDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : "9:00 AM"}
        </span>
      </div>
      <p className="text-sm font-semibold mb-1">{wo.customer}</p>
      <div className="flex items-start gap-1 text-[11px] text-muted-foreground mb-1">
        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
        <span className="line-clamp-1">{wo.address}</span>
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="truncate">{wo.serviceType.split('(')[0].trim()}</span>
        {hasServices && !service && (
          <span className="text-[10px] font-semibold">{hasServices} services</span>
        )}
      </div>
    </div>
  );
};

// Draggable Service Card Component
const DraggableServiceCard = ({ service, workOrder }: any) => {
  const dragData: DragData = {
    type: 'service',
    workOrder,
    service,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `service-${service.id}`,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded-lg border border-border bg-secondary/50 cursor-move hover:shadow-md transition-all ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-card-foreground">{service.title}</p>
        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
          service.status === "Completed" 
            ? "bg-green-100 text-green-800" 
            : service.status === "In Progress"
            ? "bg-blue-100 text-blue-800"
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {service.status}
        </span>
      </div>
      {service.assignedTo && (
        <p className="text-[10px] text-muted-foreground">Assigned: {service.assignedTo}</p>
      )}
    </div>
  );
};

// Droppable Time Slot Component
const DroppableTimeSlot = ({ 
  employeeId, 
  timeSlot, 
  date, 
  job, 
  workOrder, 
  service, 
  priority,
  isOver,
  onScheduledJobDragStart 
}: any) => {
  const dropId = `drop-${employeeId}-${timeSlot}-${date}`;
  
  const { setNodeRef, isOver: isOverCurrent } = useDroppable({
    id: dropId,
    data: {
      employeeId,
      timeSlot,
      date,
    },
  });

  const dragData: DragData | undefined = job ? {
    type: 'scheduledJob',
    workOrder,
    service: service || undefined,
    scheduledJob: job,
  } : undefined;

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: job ? `scheduled-${job.id}` : `empty-${dropId}`,
    data: dragData,
    disabled: !job,
  });

  const showHighlight = isOverCurrent || isOver;

  return (
    <div
      ref={setNodeRef}
      className={`relative border-l border-border min-h-[70px] transition-all ${
        showHighlight ? 'bg-primary/20 ring-2 ring-primary ring-inset' : 'hover:bg-primary/5'
      } cursor-pointer`}
    >
      {/* Drop zone placeholder */}
      {showHighlight && !job && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-primary/10 border-2 border-dashed border-primary rounded-lg p-2 m-1 w-[calc(100%-8px)]">
            <p className="text-xs font-semibold text-primary text-center">
              {formatTimeSlot(timeSlot)}
            </p>
          </div>
        </div>
      )}

      {/* Scheduled job card */}
      {workOrder && job && (
        <div
          ref={setDragRef}
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className={`absolute rounded-lg p-2 border-2 shadow-md cursor-move hover:shadow-lg transition-all ${priorityBgColors[priority]} ${isDragging ? 'opacity-50' : ''}`}
          style={{ 
            width: `calc(${job.duration * 100}% - 4px)`,
            left: '2px',
            top: '4px',
            bottom: '4px',
            zIndex: isDragging ? 50 : 10
          }}
        >
          <p className="text-xs font-bold truncate">{workOrder.id}</p>
          {service ? (
            <p className="text-[10px] truncate font-semibold text-primary">{service.title}</p>
          ) : (
            <p className="text-[10px] truncate">{workOrder.customer}</p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeSlot(timeSlot)}
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
};

const getPriority = (wo: any): Priority => {
  if (wo.status === "Open") return "URGENT";
  if (wo.frequency === "Monthly") return "HIGH";
  if (wo.frequency === "Quarterly" || wo.frequency === "Bi-Monthly") return "MEDIUM";
  return "LOW";
};

const priorityBgColors: Record<Priority, string> = {
  LOW: "bg-green-100 border-green-300 text-green-900",
  MEDIUM: "bg-yellow-100 border-yellow-300 text-yellow-900",
  HIGH: "bg-orange-100 border-orange-300 text-orange-900",
  URGENT: "bg-red-100 border-red-300 text-red-900",
};

const QuantCalendarPage = () => {
  const { workOrders } = useProjectsStore();
  const { employees } = useEmployeesStore();
  const { getTasksByWorkOrder } = useTasksStore();
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any | null>(null);
  
  // Schedule state
  const [schedule, setSchedule] = useState<ScheduledJob[]>([]);
  
  // Drag state
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<{ employeeId: string; timeSlot: number; date: string } | null>(null);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Generate dummy schedule data
  const generateDummySchedule = (): ScheduledJob[] => {
    const dummySchedule: ScheduledJob[] = [];
    
    // Only generate if we have work orders and employees
    if (workOrders.length === 0 || employees.length === 0) return [];
    
    // Filter work orders that have services
    const workOrdersWithServices = workOrders.filter(wo => {
      const services = getTasksByWorkOrder(wo.id);
      return services.length > 0;
    });
    
    if (workOrdersWithServices.length === 0) return [];
    
    // Assign some services to random employees at different times
    const numToSchedule = Math.min(workOrdersWithServices.length, Math.floor(workOrdersWithServices.length * 0.6)); // Schedule 60% of work orders
    
    for (let i = 0; i < numToSchedule; i++) {
      const wo = workOrdersWithServices[i];
      const services = getTasksByWorkOrder(wo.id);
      
      // Pick a random service from this work order
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      const randomStartTime = 6 + Math.floor(Math.random() * 12); // Random time between 6 AM and 5 PM
      const duration = Math.random() > 0.5 ? 2 : 3; // Random duration of 2 or 3 hours
      
      // Generate random date within current week/month
      const baseDate = new Date(selectedDate);
      const daysOffset = Math.floor(Math.random() * 7); // Random day within a week
      baseDate.setDate(baseDate.getDate() + daysOffset);
      
      dummySchedule.push({
        id: `job-${wo.id}-${randomService.id}-${randomEmployee.id}-${Date.now()}-${i}-${Math.random()}`,
        workOrderId: wo.id,
        serviceId: randomService.id, // Always include service ID
        employeeId: randomEmployee.id,
        startTime: randomStartTime,
        duration,
        date: baseDate.toISOString().split('T')[0],
        selectedTimeSlot: formatTimeSlot(randomStartTime),
      });
    }
    
    return dummySchedule;
  };
  
  // Initialize schedule on mount
  useEffect(() => {
    setSchedule(generateDummySchedule());
  }, []);
  
  // Get unique branches
  const branches = useMemo(() => {
    const branchSet = new Set<string>();
    employees.forEach(emp => emp.branch.forEach(b => branchSet.add(b)));
    return Array.from(branchSet).sort();
  }, [employees]);
  
  // Get unique service types
  const serviceTypes = useMemo(() => {
    const serviceSet = new Set<string>();
    workOrders.forEach(wo => {
      const service = wo.serviceType.split('(')[0].trim();
      serviceSet.add(service);
    });
    return Array.from(serviceSet).sort();
  }, [workOrders]);
  
  // Get date range based on view mode
  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    if (viewMode === "day") {
      return [start];
    } else if (viewMode === "week") {
      // Get start of week (Sunday)
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
      
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    } else { // month
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    }
  };
  
  const dateRange = useMemo(() => getDateRange(), [selectedDate, viewMode]);
  
  // Filter schedule by date range
  const filteredSchedule = useMemo(() => {
    return schedule.filter(job => {
      const jobDate = new Date(job.date);
      return dateRange.some(d => 
        d.toISOString().split('T')[0] === jobDate.toISOString().split('T')[0]
      );
    });
  }, [schedule, dateRange]);
  
  // Handle refresh
  const handleRefresh = () => {
    // Clear existing schedule first
    setSchedule([]);
    // Generate new schedule with a slight delay to ensure state update
    setTimeout(() => {
      setSchedule(generateDummySchedule());
    }, 10);
    setSearchText("");
    setSearchEmployee("");
  };

  // Group employees by branch with filters
  const employeesByBranch = useMemo(() => {
    const grouped: Record<string, typeof employees> = {};
    
    // Filter employees first
    let filteredEmployees = employees;
    
    // Filter by branch
    if (selectedBranch !== "all") {
      filteredEmployees = filteredEmployees.filter(emp => emp.branch.includes(selectedBranch));
    }
    
    // Filter by specific employee
    if (selectedEmployee !== "all") {
      filteredEmployees = filteredEmployees.filter(emp => emp.id === selectedEmployee);
    }
    
    // Group by branch
    filteredEmployees.forEach(emp => {
      emp.branch.forEach(b => {
        if (!grouped[b]) grouped[b] = [];
        if (!grouped[b].find(e => e.id === emp.id)) {
          grouped[b].push(emp);
        }
      });
    });
    
    return grouped;
  }, [employees, selectedBranch, selectedEmployee]);

  // Filter work orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Search filter
      const matchesSearch = wo.customer.toLowerCase().includes(searchText.toLowerCase()) ||
                           wo.id.toLowerCase().includes(searchText.toLowerCase());
      
      // Not scheduled filter
      const isNotScheduled = !filteredSchedule.some(s => s.workOrderId === wo.id);
      
      // Service type filter
      const matchesService = selectedService === "all" || 
                            wo.serviceType.split('(')[0].trim() === selectedService;
      
      return matchesSearch && isNotScheduled && matchesService;
    });
  }, [workOrders, searchText, filteredSchedule, selectedService]);

  const getEmployeeJobs = (employeeId: string, date?: string) => {
    if (date) {
      return filteredSchedule.filter(s => s.employeeId === employeeId && s.date === date);
    }
    return filteredSchedule.filter(s => s.employeeId === employeeId);
  };
  
  // Handle date navigation
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDragStart = (event: DragStartEvent) => {
    const dragData = event.active.data.current as DragData;
    
    // Only allow services to be dragged, not work orders
    if (dragData?.type === 'workOrder' && !dragData.service) {
      return; // Reject work orders without services
    }
    
    setActiveDragData(dragData);
    
    // If dragging a scheduled job, remove it from schedule
    if (dragData?.type === 'scheduledJob' && dragData.scheduledJob) {
      setSchedule(prev => prev.filter(s => s.id !== dragData.scheduledJob!.id));
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (over && over.data.current) {
      const dropData = over.data.current as { employeeId: string; timeSlot: number; date: string };
      setActiveDropZone(dropData);
    } else {
      setActiveDropZone(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    
    if (!over || !activeDragData) {
      // If drag was cancelled, restore the scheduled job if it was one
      if (activeDragData?.type === 'scheduledJob' && activeDragData.scheduledJob) {
        setSchedule(prev => [...prev, activeDragData.scheduledJob!]);
      }
      setActiveDragData(null);
      setActiveDropZone(null);
      return;
    }

    // Reject if trying to drop a work order without a service
    if (activeDragData.type === 'workOrder' && !activeDragData.service) {
      alert("Only services can be scheduled! Please select a work order with services and drag individual services.");
      setActiveDragData(null);
      setActiveDropZone(null);
      return;
    }

    const dropData = over.data.current as { employeeId: string; timeSlot: number; date: string };
    const { employeeId, timeSlot, date } = dropData;

    // Get the work order and service from drag data
    const workOrder = activeDragData.workOrder;
    const service = activeDragData.service;
    
    // Ensure we have a service
    if (!service) {
      alert("Only services can be scheduled! Please drag individual services from the work order.");
      if (activeDragData.type === 'scheduledJob' && activeDragData.scheduledJob) {
        setSchedule(prev => [...prev, activeDragData.scheduledJob!]);
      }
      setActiveDragData(null);
      setActiveDropZone(null);
      return;
    }
    
    // Check for conflicts
    const employeeJobs = schedule.filter(s => s.employeeId === employeeId && s.date === date);
    const duration = 2;

    const hasConflict = employeeJobs.some(job => {
      const jobEnd = job.startTime + job.duration;
      const newEnd = timeSlot + duration;
      return (timeSlot >= job.startTime && timeSlot < jobEnd) ||
             (newEnd > job.startTime && newEnd <= jobEnd) ||
             (timeSlot <= job.startTime && newEnd >= jobEnd);
    });

    if (hasConflict) {
      alert("Time slot conflict! This employee already has a job scheduled at this time.");
      // Restore scheduled job if it was being moved
      if (activeDragData.type === 'scheduledJob' && activeDragData.scheduledJob) {
        setSchedule(prev => [...prev, activeDragData.scheduledJob!]);
      }
      setActiveDragData(null);
      setActiveDropZone(null);
      return;
    }

    // Create new scheduled job
    const newJob: ScheduledJob = {
      id: `job-${workOrder.id}-${service.id}-${employeeId}-${timeSlot}-${Date.now()}`,
      workOrderId: workOrder.id,
      serviceId: service.id,
      employeeId,
      startTime: timeSlot,
      duration,
      date,
      selectedTimeSlot: formatTimeSlot(timeSlot),
    };

    setSchedule(prev => [...prev, newJob]);
    setActiveDragData(null);
    setActiveDropZone(null);
  };

  const handleDragCancel = () => {
    // Restore scheduled job if it was being moved
    if (activeDragData?.type === 'scheduledJob' && activeDragData.scheduledJob) {
      setSchedule(prev => [...prev, activeDragData.scheduledJob!]);
    }
    setActiveDragData(null);
    setActiveDropZone(null);
  };

  const handleWorkOrderClick = (wo: any) => {
    const services = getTasksByWorkOrder(wo.id);
    if (services.length > 0) {
      setSelectedWorkOrder(selectedWorkOrder?.id === wo.id ? null : wo);
    }
  };

  const handleAutoAssign = () => {
    // Get all unassigned services from work orders
    const unassignedServices: Array<{ wo: any; service: any }> = [];
    
    workOrders.forEach(wo => {
      const services = getTasksByWorkOrder(wo.id);
      services.forEach(service => {
        // Check if this service is already scheduled
        const isScheduled = schedule.some(s => s.workOrderId === wo.id && s.serviceId === service.id);
        if (!isScheduled) {
          unassignedServices.push({ wo, service });
        }
      });
    });

    const newSchedule = [...schedule];

    unassignedServices.forEach(({ wo, service }) => {
      const duration = 2;
      let bestEmployee: any = null;
      let bestTime = -1;
      let bestDate = selectedDate.toISOString().split('T')[0];

      for (const emp of employees) {
        const empJobs = newSchedule.filter(s => s.employeeId === emp.id && s.date === bestDate);

        for (let time = 6; time <= 20 - duration; time++) {
          const hasConflict = empJobs.some(job => {
            const jobEnd = job.startTime + job.duration;
            const newEnd = time + duration;
            return (time >= job.startTime && time < jobEnd) ||
                   (newEnd > job.startTime && newEnd <= jobEnd) ||
                   (time <= job.startTime && newEnd >= jobEnd);
          });

          if (!hasConflict) {
            bestEmployee = emp;
            bestTime = time;
            break;
          }
        }

        if (bestEmployee) break;
      }

      if (bestEmployee && bestTime !== -1) {
        newSchedule.push({
          id: `job-${wo.id}-${service.id}-${bestEmployee.id}-${bestTime}-${Date.now()}`,
          workOrderId: wo.id,
          serviceId: service.id, // Always include service ID
          employeeId: bestEmployee.id,
          startTime: bestTime,
          duration,
          date: bestDate,
          selectedTimeSlot: formatTimeSlot(bestTime),
        });
      }
    });

    setSchedule(newSchedule);
  };

  const stats = useMemo(() => {
    const total = workOrders.length;
    const assigned = filteredSchedule.length;
    const unassigned = total - assigned;
    const assignedPercent = total > 0 ? Math.round((assigned / total) * 100) : 0;
    const busyEmployees = employees.filter(emp => getEmployeeJobs(emp.id).length > 0).length;
    const busyPercent = employees.length > 0 ? Math.round((busyEmployees / employees.length) * 100) : 0;
    
    return {
      total,
      assigned,
      unassigned,
      assignedPercent,
      busyPercent,
      completionRate: 85,
    };
  }, [workOrders, filteredSchedule, employees]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-4 animate-fade-in">
      {/* Top Filters Bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          
          {/* Branch Filter */}
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch} value={branch}>{branch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <button onClick={handlePreviousDay} className="p-2 hover:bg-secondary rounded-lg border border-border transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm font-medium min-w-[120px] text-left">
                    {format(selectedDate, "MMM dd, yyyy")}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <button onClick={handleNextDay} className="p-2 hover:bg-secondary rounded-lg border border-border transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={handleToday} className="px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg border border-border transition-colors">
              Today
            </button>
          </div>
          
          {/* View Mode Filter */}
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Employee Filter */}
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Service Type Filter */}
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {serviceTypes.map(service => (
                <SelectItem key={service} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="ml-auto px-4 py-2 rounded-lg border border-border hover:bg-secondary flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">
            {viewMode === "day" && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {viewMode === "week" && `Week of ${dateRange[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange[dateRange.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            {viewMode === "month" && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Work Orders */}
        <div className={`${selectedWorkOrder ? 'col-span-2' : 'col-span-3'} bg-card rounded-xl border border-border transition-all`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Work Orders</h3>
              <span className="text-xs font-semibold text-primary">{filteredWorkOrders.length} Unassigned</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search work orders..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {workOrders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No work orders available</p>
              </div>
            )}
            {filteredWorkOrders.length === 0 && workOrders.length > 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">No work orders match your search</p>
                <button 
                  onClick={() => setSearchText("")}
                  className="text-xs text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
            {filteredWorkOrders.map(wo => {
              const priority = getPriority(wo);
              const services = getTasksByWorkOrder(wo.id);
              const hasServices = services.length > 0;
              const isSelected = selectedWorkOrder?.id === wo.id;
              
              return (
                <div key={wo.id}>
                  <div
                    className={`p-3 rounded-lg border hover:shadow-md transition-all ${priorityBgColors[priority]} ${hasServices ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => hasServices && handleWorkOrderClick(wo)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1">
                        <p className="text-xs font-bold">{wo.id}</p>
                        {!hasServices && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">No Services</span>
                        )}
                        {hasServices && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Click to expand</span>
                        )}
                      </div>
                      <span className="text-[10px]">
                        {wo.workOrderDateTime ? new Date(wo.workOrderDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : "9:00 AM"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1">{wo.customer}</p>
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{wo.address}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="truncate">{wo.serviceType.split('(')[0].trim()}</span>
                      {hasServices && (
                        <span className="text-[10px] font-semibold text-primary">{services.length} services →</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Panel - Services (shown when work order is selected) */}
        {selectedWorkOrder && (
          <div className="col-span-2 bg-card rounded-xl border border-border animate-fade-in">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">Services</h3>
                <button
                  onClick={() => setSelectedWorkOrder(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{selectedWorkOrder.id}</p>
              <p className="text-xs font-semibold">{selectedWorkOrder.customer}</p>
            </div>
            <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
              {getTasksByWorkOrder(selectedWorkOrder.id).map(service => (
                <DraggableServiceCard
                  key={service.id}
                  service={service}
                  workOrder={selectedWorkOrder}
                />
              ))}
            </div>
          </div>
        )}

        {/* Right Panel - Calendar */}
        <div className={`${selectedWorkOrder ? 'col-span-8' : 'col-span-9'} bg-card rounded-xl border border-border transition-all`}>
          {/* View Tabs */}
          <div className="border-b border-border">
            <div className="flex items-center gap-4 px-4">
              <div className="px-4 py-3 text-sm font-semibold text-primary border-b-2 border-primary">
                {viewMode === "day" && "DAY VIEW"}
                {viewMode === "week" && "WEEK VIEW"}
                {viewMode === "month" && "MONTH VIEW"}
              </div>
            </div>
          </div>

          {/* Employee Search */}
          <div className="p-4 border-b border-border bg-secondary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Employees</span>
                <input
                  type="text"
                  placeholder="Filter employees..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="overflow-auto" style={{ maxHeight: '600px' }}>
            <div className="min-w-[1200px]">
              {/* Time Header for Day View */}
              {viewMode === "day" && (
                <>
                  <div className="sticky top-0 bg-card z-10 border-b border-border">
                    <div className="grid" style={{ gridTemplateColumns: "200px repeat(15, 1fr)" }}>
                      <div className="p-2"></div>
                      {timeSlots.map(hour => (
                        <div key={hour} className="p-2 text-center border-l border-border">
                          <p className="text-xs font-semibold">
                            {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : hour === 0 ? "12 AM" : `${hour} AM`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Rows by Branch for Day View */}
                  {Object.entries(employeesByBranch).map(([branch, branchEmployees]) => (
                    <div key={branch}>
                      {/* Branch Header */}
                      <div className="bg-blue-50 dark:bg-blue-500/10 border-b border-border">
                        <div className="grid" style={{ gridTemplateColumns: "200px repeat(15, 1fr)" }}>
                          <div className="p-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-400">{branch}</span>
                            <span className="text-xs text-muted-foreground">• {branchEmployees.length} Employees</span>
                          </div>
                          <div className="col-span-15"></div>
                        </div>
                      </div>

                      {/* Branch Employees */}
                      {branchEmployees
                        .filter(emp => emp.name.toLowerCase().includes(searchEmployee.toLowerCase()))
                        .map(emp => {
                          const empJobs = getEmployeeJobs(emp.id, selectedDate.toISOString().split('T')[0]);
                          return (
                            <div key={emp.id} className="grid border-b border-border hover:bg-secondary/10" style={{ gridTemplateColumns: "200px repeat(15, 1fr)" }}>
                              {/* Employee Info */}
                              <div className="p-3 border-r border-border flex items-center gap-3">
                                <img 
                                  src={emp.profilePhoto || "/placeholder.svg"} 
                                  alt={emp.name}
                                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{emp.name}</p>
                                  <p className="text-xs text-muted-foreground">{emp.role}</p>
                                  <p className="text-xs font-semibold text-primary">{empJobs.length}/3</p>
                                </div>
                              </div>

                              {/* Time Slots */}
                              {timeSlots.map(hour => {
                                const job = filteredSchedule.find(s => s.employeeId === emp.id && s.startTime === hour && s.date === selectedDate.toISOString().split('T')[0]);
                                const wo = job ? workOrders.find(w => w.id === job.workOrderId) : null;
                                const service = job?.serviceId ? getTasksByWorkOrder(job.workOrderId).find(s => s.id === job.serviceId) : null;
                                const isOver = activeDropZone?.employeeId === emp.id && 
                                              activeDropZone?.timeSlot === hour && 
                                              activeDropZone?.date === selectedDate.toISOString().split('T')[0];

                                return (
                                  <DroppableTimeSlot
                                    key={hour}
                                    employeeId={emp.id}
                                    timeSlot={hour}
                                    date={selectedDate.toISOString().split('T')[0]}
                                    job={job}
                                    workOrder={wo}
                                    service={service}
                                    priority={wo ? getPriority(wo) : null}
                                    isOver={isOver}
                                    onScheduledJobDragStart={() => {}}
                                  />
                                );
                              })}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </>
              )}

              {/* Week/Month View */}
              {(viewMode === "week" || viewMode === "month") && (
                <>
                  <div className="sticky top-0 bg-card z-10 border-b border-border">
                    <div className="grid" style={{ gridTemplateColumns: `200px repeat(${dateRange.length}, 1fr)` }}>
                      <div className="p-2"></div>
                      {dateRange.map(date => (
                        <div key={date.toISOString()} className="p-2 text-center border-l border-border">
                          <p className="text-xs font-semibold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-xs text-muted-foreground">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Rows */}
                  {Object.entries(employeesByBranch).map(([branch, branchEmployees]) => (
                    <div key={branch}>
                      <div className="bg-blue-50 dark:bg-blue-500/10 border-b border-border">
                        <div className="grid" style={{ gridTemplateColumns: `200px repeat(${dateRange.length}, 1fr)` }}>
                          <div className="p-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-400">{branch}</span>
                            <span className="text-xs text-muted-foreground">• {branchEmployees.length} Employees</span>
                          </div>
                          <div className={`col-span-${dateRange.length}`}></div>
                        </div>
                      </div>

                      {branchEmployees
                        .filter(emp => emp.name.toLowerCase().includes(searchEmployee.toLowerCase()))
                        .map(emp => (
                          <div key={emp.id} className="grid border-b border-border hover:bg-secondary/10" style={{ gridTemplateColumns: `200px repeat(${dateRange.length}, 1fr)` }}>
                            <div className="p-3 border-r border-border flex items-center gap-3">
                              <img 
                                src={emp.profilePhoto || "/placeholder.svg"} 
                                alt={emp.name}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{emp.name}</p>
                                <p className="text-xs text-muted-foreground">{emp.role}</p>
                              </div>
                            </div>

                            {dateRange.map(date => {
                              const dateStr = date.toISOString().split('T')[0];
                              const dayJobs = getEmployeeJobs(emp.id, dateStr);
                              
                              return (
                                <DroppableDayCell
                                  key={dateStr}
                                  employeeId={emp.id}
                                  date={dateStr}
                                  dayJobs={dayJobs}
                                  workOrders={workOrders}
                                  getTasksByWorkOrder={getTasksByWorkOrder}
                                  getPriority={getPriority}
                                  priorityBgColors={priorityBgColors}
                                  activeDropZone={activeDropZone}
                                />
                              );
                            })}
                          </div>
                        ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-2xl">📋</div>
          <div>
            <p className="text-xs text-muted-foreground">Total Work Orders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-2xl">✅</div>
          <div>
            <p className="text-xs text-muted-foreground">Assigned</p>
            <p className="text-2xl font-bold text-success">{stats.assigned} <span className="text-sm">({stats.assignedPercent}%)</span></p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-2xl">⚠️</div>
          <div>
            <p className="text-xs text-muted-foreground">Unassigned</p>
            <p className="text-2xl font-bold text-warning">{stats.unassigned} <span className="text-sm">({100 - stats.assignedPercent}%)</span></p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-2xl">👥</div>
          <div>
            <p className="text-xs text-muted-foreground">Employees Busy</p>
            <p className="text-2xl font-bold text-primary">{stats.busyPercent}%</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-2xl">📊</div>
          <div>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{stats.completionRate}%</p>
          </div>
        </div>
      </div>
    </div>

    {/* Drag Overlay */}
    <DragOverlay>
      {activeDragData && (
        <div className="opacity-90 rotate-3 scale-105">
          {activeDragData.type === 'service' && activeDragData.service ? (
            <div className="p-2 rounded-lg border-2 border-primary bg-secondary shadow-2xl w-48">
              <p className="text-xs font-semibold">{activeDragData.service.title}</p>
              <p className="text-[10px] text-muted-foreground">{activeDragData.workOrder.id}</p>
            </div>
          ) : (
            <div className={`p-3 rounded-lg border-2 border-primary shadow-2xl w-56 ${priorityBgColors[getPriority(activeDragData.workOrder)]}`}>
              <p className="text-xs font-bold">{activeDragData.workOrder.id}</p>
              <p className="text-sm font-semibold">{activeDragData.workOrder.customer}</p>
              <p className="text-[10px] truncate">{activeDragData.workOrder.serviceType.split('(')[0].trim()}</p>
            </div>
          )}
        </div>
      )}
    </DragOverlay>
  </DndContext>
  );
};

export default QuantCalendarPage;
