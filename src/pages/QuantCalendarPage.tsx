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
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight as ChevronRightIcon
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

// Types
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type ViewMode = "day" | "week" | "month";

type ScheduledJob = {
  workOrderId: string;
  serviceId?: string; // Add service/task ID
  employeeId: string;
  startTime: number;
  duration: number;
  date: string; // Add date to track which day the job is scheduled
};

const timeSlots = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

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
  const [expandedWorkOrders, setExpandedWorkOrders] = useState<Set<string>>(new Set());
  
  // Schedule state
  const [schedule, setSchedule] = useState<ScheduledJob[]>([]);
  const [draggedWorkOrder, setDraggedWorkOrder] = useState<any | null>(null);
  const [draggedService, setDraggedService] = useState<any | null>(null);
  
  // Generate dummy schedule data
  const generateDummySchedule = (): ScheduledJob[] => {
    const dummySchedule: ScheduledJob[] = [];
    
    // Only generate if we have work orders and employees
    if (workOrders.length === 0 || employees.length === 0) return [];
    
    // Assign some work orders to random employees at different times
    const numToSchedule = Math.min(workOrders.length, Math.floor(workOrders.length * 0.6)); // Schedule 60% of work orders
    
    for (let i = 0; i < numToSchedule; i++) {
      const wo = workOrders[i];
      const randomEmployee = employees[i % employees.length];
      const randomStartTime = 6 + (i % 12); // Distribute between 6 AM and 5 PM
      const duration = Math.random() > 0.5 ? 2 : 3; // Random duration of 2 or 3 hours
      
      // Generate random date within current week/month
      const baseDate = new Date(selectedDate);
      const daysOffset = Math.floor(Math.random() * 7); // Random day within a week
      baseDate.setDate(baseDate.getDate() + daysOffset);
      
      dummySchedule.push({
        workOrderId: wo.id,
        employeeId: randomEmployee.id,
        startTime: randomStartTime,
        duration,
        date: baseDate.toISOString().split('T')[0],
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
    setSchedule(generateDummySchedule());
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

  const handleDragStart = (wo: any, service?: any) => {
    if (service) {
      setDraggedService(service);
      setDraggedWorkOrder(wo);
    } else {
      setDraggedWorkOrder(wo);
      setDraggedService(null);
    }
  };

  const handleScheduledJobDragStart = (e: React.DragEvent, job: ScheduledJob) => {
    e.stopPropagation();
    const wo = workOrders.find(w => w.id === job.workOrderId);
    const service = job.serviceId ? getTasksByWorkOrder(job.workOrderId).find(s => s.id === job.serviceId) : null;
    
    if (wo) {
      setDraggedWorkOrder(wo);
      setDraggedService(service || null);
      
      // Remove the job from schedule when starting to drag it
      setSchedule(prev => prev.filter(s => 
        !(s.workOrderId === job.workOrderId && 
          s.employeeId === job.employeeId && 
          s.startTime === job.startTime && 
          s.date === job.date &&
          s.serviceId === job.serviceId)
      ));
    }
  };

  const handleDrop = (employeeId: string, timeSlot: number, date?: string) => {
    const itemToDrag = draggedService || draggedWorkOrder;
    if (!itemToDrag) return;

    const scheduleDate = date || selectedDate.toISOString().split('T')[0];
    const employeeJobs = getEmployeeJobs(employeeId, scheduleDate);
    const duration = 2;

    const hasConflict = employeeJobs.some(job => {
      const jobEnd = job.startTime + job.duration;
      const newEnd = timeSlot + duration;
      return (timeSlot >= job.startTime && timeSlot < jobEnd) ||
             (newEnd > job.startTime && newEnd <= jobEnd) ||
             (timeSlot <= job.startTime && newEnd >= jobEnd);
    });

    if (hasConflict) {
      alert("Time slot conflict!");
      setDraggedWorkOrder(null);
      setDraggedService(null);
      return;
    }

    setSchedule([...schedule, {
      workOrderId: draggedWorkOrder.id,
      serviceId: draggedService?.id,
      employeeId,
      startTime: timeSlot,
      duration,
      date: scheduleDate,
    }]);

    setDraggedWorkOrder(null);
    setDraggedService(null);
  };

  const toggleWorkOrder = (woId: string) => {
    setExpandedWorkOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(woId)) {
        newSet.delete(woId);
      } else {
        newSet.add(woId);
      }
      return newSet;
    });
  };

  const handleAutoAssign = () => {
    const unassigned = workOrders.filter(wo => !schedule.some(s => s.workOrderId === wo.id));
    const newSchedule = [...schedule];

    unassigned.forEach(wo => {
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
          workOrderId: wo.id,
          employeeId: bestEmployee.id,
          startTime: bestTime,
          duration,
          date: bestDate,
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoAssign}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            <Zap className="w-4 h-4" />
            Auto Assign
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Work Order
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Work Orders */}
        <div className="col-span-3 bg-card rounded-xl border border-border">
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
              const isExpanded = expandedWorkOrders.has(wo.id);
              const hasServices = services.length > 0;
              
              return (
                <div key={wo.id} className="space-y-1">
                  <div
                    className={`p-3 rounded-lg border hover:shadow-md transition-all ${priorityBgColors[priority]} ${!hasServices ? 'cursor-move' : ''}`}
                    draggable={!hasServices}
                    onDragStart={() => !hasServices && handleDragStart(wo)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1">
                        {hasServices && (
                          <button
                            onClick={() => toggleWorkOrder(wo.id)}
                            className="hover:bg-black/10 rounded p-0.5"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                          </button>
                        )}
                        <p className="text-xs font-bold">{wo.id}</p>
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
                        <span className="text-[10px] font-semibold">{services.length} services</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Services List */}
                  {isExpanded && hasServices && (
                    <div className="ml-4 space-y-1">
                      {services.map(service => (
                        <div
                          key={service.id}
                          draggable
                          onDragStart={() => handleDragStart(wo, service)}
                          className="p-2 rounded-lg border border-border bg-secondary/50 cursor-move hover:shadow-md transition-all"
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
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Calendar */}
        <div className="col-span-9 bg-card rounded-xl border border-border">
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

                                return (
                                  <div
                                    key={hour}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(emp.id, hour)}
                                    className="relative border-l border-border min-h-[70px] hover:bg-primary/5 transition-colors cursor-pointer"
                                  >
                                    {wo && job && (
                                      <div
                                        draggable
                                        onDragStart={(e) => handleScheduledJobDragStart(e, job)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`absolute rounded-lg p-2 border-2 shadow-md cursor-move hover:shadow-lg transition-all ${priorityBgColors[getPriority(wo)]}`}
                                        style={{ 
                                          width: `calc(${job.duration * 100}% - 4px)`,
                                          left: '2px',
                                          top: '4px',
                                          bottom: '4px',
                                          zIndex: 10
                                        }}
                                      >
                                        <p className="text-xs font-bold truncate">{wo.id}</p>
                                        {service ? (
                                          <p className="text-[10px] truncate font-semibold text-primary">{service.title}</p>
                                        ) : (
                                          <p className="text-[10px] truncate">{wo.customer}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-1">
                                          <p className="text-[10px] flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {hour}:00 - {hour + job.duration}:00
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
                                <div
                                  key={dateStr}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() => handleDrop(emp.id, 9, dateStr)}
                                  className="relative border-l border-border min-h-[70px] hover:bg-primary/5 transition-colors p-1 cursor-pointer"
                                >
                                  <div className="text-xs font-semibold text-primary">{dayJobs.length} jobs</div>
                                  {dayJobs.slice(0, 2).map((job, idx) => {
                                    const wo = workOrders.find(w => w.id === job.workOrderId);
                                    const service = job.serviceId ? getTasksByWorkOrder(job.workOrderId).find(s => s.id === job.serviceId) : null;
                                    if (!wo) return null;
                                    return (
                                      <div
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => handleScheduledJobDragStart(e, job)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`mt-1 rounded p-1 border text-[10px] cursor-move hover:shadow-md transition-all ${priorityBgColors[getPriority(wo)]}`}
                                      >
                                        <p className="font-bold truncate">{wo.id}</p>
                                        {service ? (
                                          <p className="truncate font-semibold">{service.title}</p>
                                        ) : (
                                          <p className="truncate">{job.startTime}:00</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {dayJobs.length > 2 && (
                                    <div className="mt-1 text-[10px] text-muted-foreground">+{dayJobs.length - 2} more</div>
                                  )}
                                  {dayJobs.length === 0 && (
                                    <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
                                      Drop here
                                    </div>
                                  )}
                                </div>
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
  );
};

export default QuantCalendarPage;
