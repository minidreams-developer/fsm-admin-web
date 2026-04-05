import { useState, useMemo } from "react";
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Plus, 
  Zap,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import { useEmployeesStore } from "@/store/employeesStore";

// Types
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type ScheduledJob = {
  workOrderId: string;
  employeeId: string;
  startTime: number;
  duration: number;
};

const timeSlots = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

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
  const [schedule, setSchedule] = useState<ScheduledJob[]>([]);
  const [searchText, setSearchText] = useState("");
  const [draggedWorkOrder, setDraggedWorkOrder] = useState<any | null>(null);
  const [selectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"branch" | "employee">("branch");
  const [searchEmployee, setSearchEmployee] = useState("");

  // Group employees by branch
  const employeesByBranch = useMemo(() => {
    const grouped: Record<string, typeof employees> = {};
    employees.forEach(emp => {
      emp.branch.forEach(b => {
        if (!grouped[b]) grouped[b] = [];
        if (!grouped[b].find(e => e.id === emp.id)) {
          grouped[b].push(emp);
        }
      });
    });
    return grouped;
  }, [employees]);

  // Filter work orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.customer.toLowerCase().includes(searchText.toLowerCase()) ||
                           wo.id.toLowerCase().includes(searchText.toLowerCase());
      const isNotScheduled = !schedule.some(s => s.workOrderId === wo.id);
      return matchesSearch && isNotScheduled;
    });
  }, [workOrders, searchText, schedule]);

  const getEmployeeJobs = (employeeId: string) => {
    return schedule.filter(s => s.employeeId === employeeId);
  };

  const handleDragStart = (wo: any) => {
    setDraggedWorkOrder(wo);
  };

  const handleDrop = (employeeId: string, timeSlot: number) => {
    if (!draggedWorkOrder) return;

    const employeeJobs = getEmployeeJobs(employeeId);
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
      return;
    }

    setSchedule([...schedule, {
      workOrderId: draggedWorkOrder.id,
      employeeId,
      startTime: timeSlot,
      duration,
    }]);

    setDraggedWorkOrder(null);
  };

  const handleAutoAssign = () => {
    const unassigned = workOrders.filter(wo => !schedule.some(s => s.workOrderId === wo.id));
    const newSchedule = [...schedule];

    unassigned.forEach(wo => {
      const duration = 2;
      let bestEmployee: any = null;
      let bestTime = -1;

      for (const emp of employees) {
        const empJobs = newSchedule.filter(s => s.employeeId === emp.id);

        for (let time = 7; time <= 19 - duration; time++) {
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
        });
      }
    });

    setSchedule(newSchedule);
  };

  const stats = useMemo(() => {
    const total = workOrders.length;
    const assigned = schedule.length;
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
  }, [workOrders, schedule, employees]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-secondary rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold">Today</span>
          <button className="p-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="text-lg font-semibold">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
              return (
                <div
                  key={wo.id}
                  draggable
                  onDragStart={() => handleDragStart(wo)}
                  className={`p-3 rounded-lg border cursor-move hover:shadow-md transition-all ${priorityBgColors[priority]}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-bold">{wo.id}</p>
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
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>2</span>
                    </div>
                  </div>
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
              <button
                onClick={() => setViewMode("branch")}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  viewMode === "branch"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-card-foreground"
                }`}
              >
                BRANCH VIEW
              </button>
              <button
                onClick={() => setViewMode("employee")}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  viewMode === "employee"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-card-foreground"
                }`}
              >
                EMPLOYEE VIEW
              </button>
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
              {/* Time Header */}
              <div className="sticky top-0 bg-card z-10 border-b border-border">
                <div className="grid" style={{ gridTemplateColumns: "200px repeat(13, 1fr)" }}>
                  <div className="p-2"></div>
                  {timeSlots.map(hour => (
                    <div key={hour} className="p-2 text-center border-l border-border">
                      <p className="text-xs font-semibold">
                        {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Rows by Branch */}
              {viewMode === "branch" && Object.entries(employeesByBranch).map(([branch, branchEmployees]) => (
                <div key={branch}>
                  {/* Branch Header */}
                  <div className="bg-blue-50 dark:bg-blue-500/10 border-b border-border">
                    <div className="grid" style={{ gridTemplateColumns: "200px repeat(13, 1fr)" }}>
                      <div className="p-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-400">{branch}</span>
                        <span className="text-xs text-muted-foreground">• {branchEmployees.length} Employees</span>
                      </div>
                      <div className="col-span-13"></div>
                    </div>
                  </div>

                  {/* Branch Employees */}
                  {branchEmployees
                    .filter(emp => emp.name.toLowerCase().includes(searchEmployee.toLowerCase()))
                    .map(emp => {
                      const empJobs = getEmployeeJobs(emp.id);
                      return (
                        <div key={emp.id} className="grid border-b border-border hover:bg-secondary/10" style={{ gridTemplateColumns: "200px repeat(13, 1fr)" }}>
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
                            const job = schedule.find(s => s.employeeId === emp.id && s.startTime === hour);
                            const wo = job ? workOrders.find(w => w.id === job.workOrderId) : null;

                            return (
                              <div
                                key={hour}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(emp.id, hour)}
                                className="relative border-l border-border min-h-[70px] hover:bg-primary/5 transition-colors"
                              >
                                {wo && job && (
                                  <div
                                    className={`absolute rounded-lg p-2 border-2 shadow-md ${priorityBgColors[getPriority(wo)]}`}
                                    style={{ 
                                      width: `calc(${job.duration * 100}% - 4px)`,
                                      left: '2px',
                                      top: '4px',
                                      bottom: '4px',
                                      zIndex: 10
                                    }}
                                  >
                                    <p className="text-xs font-bold truncate">{wo.id}</p>
                                    <p className="text-[10px] truncate">{wo.customer}</p>
                                    <p className="text-[10px] flex items-center gap-1 mt-1">
                                      <Clock className="w-3 h-3" />
                                      {hour}:00 - {hour + job.duration}:00
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Users className="w-3 h-3" />
                                      <span className="text-[10px]">2</span>
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
