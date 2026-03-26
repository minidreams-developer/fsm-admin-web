import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, X, Calendar, Clock, MapPin, User, CheckCircle2, Eye, Check, Pencil, AlertCircle, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useServicesStore } from "@/store/servicesStore";
import { useProjectsStore } from "@/store/projectsStore";
import type { ServiceAppointment, Task, Attachment, AttachmentKind } from "@/store/servicesStore";
import type { WorkOrder } from "@/store/projectsStore";

const employees = [
  { id: 1, name: "Safeeq", phone: "9876543220", availability: "Available" },
  { id: 2, name: "Rajesh", phone: "9876543221", availability: "Available" },
  { id: 3, name: "Arun", phone: "9876543222", availability: "Busy" },
];

const statusMap = { Scheduled: "info", Unscheduled: "neutral", Completed: "success", Cancelled: "error" } as const;

type SelectedService = ServiceAppointment & { workOrder?: WorkOrder };

const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const { appointments, addAppointment, updateAppointment, getNextAppointmentId } = useServicesStore();
  const { workOrders, getWorkOrder } = useProjectsStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "Unscheduled" | "Overdue" | "Completed" | "Cancelled">("All");
  const [dateFilter, setDateFilter] = useState<"All" | "Today" | "Week" | "Month">("All");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [workOrderData, setWorkOrderData] = useState<WorkOrder | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ServiceAppointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const todayISO = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    workOrderId: "",
    customer: "",
    address: "",
    serviceType: "",
    appointmentDate: "",
    appointmentTime: "",
    employee: "",
    subject: "",
    salesExecutive: "",
    refNo: "",
    warrantyPeriod: "",
    technicians: [] as string[],
    instructions: "",
    tasks: [] as Task[]
  });
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskClosingDateTime, setNewTaskClosingDateTime] = useState("");
  const [newTaskBranch, setNewTaskBranch] = useState("");
  const [newTaskStaff, setNewTaskStaff] = useState("");
  const [newTaskAttachments, setNewTaskAttachments] = useState<Attachment[]>([]);

  const getDateTime = (date: string, time: string) => {
    const d = new Date(`${date}T${time || "00:00"}:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDateTime = (date: string, time: string) => {
    const d = getDateTime(date, time);
    if (!d) return `${date} ${time}`.trim();
    const formattedDate = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
    const formattedTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(d);
    return `${formattedDate} • ${formattedTime}`;
  };

  const isOverdue = (a: ServiceAppointment) => {
    if (a.status !== "Scheduled") return false;
    const d = getDateTime(a.date, a.time);
    if (!d) return false;
    return d.getTime() < Date.now();
  };

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const shouldIncludeByDate = (a: ServiceAppointment) => {
    if (dateFilter === "All") return true;
    if (!a.date) return false;
    if (dateFilter === "Today") return a.date === todayISO;

    const parts = a.date.split("-").map((x) => Number(x));
    if (parts.length !== 3) return false;
    const [y, m, d] = parts;
    if (!y || !m || !d) return false;
    const appointmentUTC = new Date(Date.UTC(y, m - 1, d));
    if (Number.isNaN(appointmentUTC.getTime())) return false;

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (dateFilter === "Month") {
      return appointmentUTC.getUTCFullYear() === todayUTC.getUTCFullYear() && appointmentUTC.getUTCMonth() === todayUTC.getUTCMonth();
    }

    const dow = todayUTC.getUTCDay();
    const diff = (dow + 6) % 7;
    const start = new Date(todayUTC);
    start.setUTCDate(todayUTC.getUTCDate() - diff);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return appointmentUTC.getTime() >= start.getTime() && appointmentUTC.getTime() < end.getTime();
  };

  const resetForm = () => {
    setEditingAppointmentId(null);
    setWorkOrderData(null);
    setFormData({
      workOrderId: "",
      customer: "",
      address: "",
      serviceType: "",
      appointmentDate: "",
      appointmentTime: "",
      employee: "",
      subject: "",
      salesExecutive: "",
      refNo: "",
      warrantyPeriod: "",
      technicians: [],
      instructions: "",
      tasks: [],
    });
    setNewTaskTitle("");
    setNewTaskClosingDateTime("");
    setNewTaskBranch("");
    setNewTaskStaff("");
    setNewTaskAttachments([]);
  };

  const openAssignNew = () => {
    if (showAssignForm) {
      closeForm();
      return;
    }
    resetForm();
    setShowAssignForm(true);
  };

  const openAssignForWorkOrder = (wo: WorkOrder) => {
    setEditingAppointmentId(null);
    setWorkOrderData(wo);
    setFormData((prev) => ({
      ...prev,
      workOrderId: wo.id,
      customer: wo.customer,
      address: wo.address,
      serviceType: wo.serviceType,
      subject: wo.subject ?? wo.serviceType,
      salesExecutive: wo.salesExecutive ?? "",
      refNo: wo.reference ?? "",
      appointmentDate: new Date().toISOString().split("T")[0],
    }));
    setShowAssignForm(true);
  };

  const openEditAppointment = (apt: ServiceAppointment) => {
    const wo = getWorkOrder(apt.workOrderId);
    setEditingAppointmentId(apt.id);
    setWorkOrderData(wo ?? null);
    setFormData({
      workOrderId: apt.workOrderId,
      customer: wo?.customer ?? "",
      address: wo?.address ?? "",
      serviceType: wo?.serviceType ?? "",
      appointmentDate: apt.date,
      appointmentTime: apt.time,
      employee: apt.employeeName,
      subject: apt.subject ?? wo?.subject ?? wo?.serviceType ?? "",
      salesExecutive: apt.salesExecutive ?? wo?.salesExecutive ?? "",
      refNo: apt.refNo ?? wo?.reference ?? "",
      warrantyPeriod: apt.warrantyPeriod ?? "",
      technicians: Array.isArray(apt.technicians) ? apt.technicians : [apt.employeeName].filter(Boolean),
      instructions: apt.instructions,
      tasks: apt.tasks ?? [],
    });
    setNewTaskTitle("");
    setShowAssignForm(true);
    setSelectedService(null);
  };

  useEffect(() => {
    const workOrderId = searchParams.get("workOrderId");
    if (workOrderId) {
      const workOrder = getWorkOrder(workOrderId);
      if (workOrder) {
        setEditingAppointmentId(null);
        setWorkOrderData(workOrder);
        setFormData(prev => ({
          ...prev,
          workOrderId: workOrder.id,
          customer: workOrder.customer,
          address: workOrder.address,
          serviceType: workOrder.serviceType,
          subject: workOrder.subject ?? workOrder.serviceType,
          salesExecutive: workOrder.salesExecutive ?? "",
          refNo: workOrder.reference ?? "",
          appointmentDate: new Date().toISOString().split('T')[0]
        }));
        setShowAssignForm(true);
      }
    }
  }, [searchParams, getWorkOrder]);

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: `TSK-${Date.now()}`,
        title: newTaskTitle,
        completed: false,
        closingDateTime: newTaskClosingDateTime || undefined,
        attachments: newTaskAttachments.length ? newTaskAttachments : undefined,
        branch: newTaskBranch || undefined,
        staff: newTaskStaff || undefined,
      };
      setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
      setNewTaskTitle("");
      setNewTaskClosingDateTime("");
      setNewTaskBranch("");
      setNewTaskStaff("");
      setNewTaskAttachments([]);
    }
  };

  const removeTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const handleAssignService = () => {
    if (!formData.workOrderId) {
      toast.error("Please select a work order");
      return;
    }
    if (!formData.employee) {
      toast.error("Please select a technician");
      return;
    }

    const hasDate = Boolean(formData.appointmentDate);
    const hasTime = Boolean(formData.appointmentTime);
    if (hasDate !== hasTime) {
      toast.error("Select both date and time, or leave both empty for unscheduled work.");
      return;
    }

    const technicians = Array.from(new Set([formData.employee, ...formData.technicians].filter(Boolean)));
    
    const nextData = {
      workOrderId: formData.workOrderId,
      date: hasDate ? formData.appointmentDate : "",
      time: hasTime ? formData.appointmentTime : "",
      employeeId: formData.employee,
      employeeName: formData.employee,
      subject: formData.subject || undefined,
      salesExecutive: formData.salesExecutive || undefined,
      refNo: formData.refNo || undefined,
      warrantyPeriod: formData.warrantyPeriod || undefined,
      technicians,
      instructions: formData.instructions,
      tasks: formData.tasks,
      status: (hasDate && hasTime ? "Scheduled" : "Unscheduled") as const,
      completedAt: undefined,
      completionNotes: undefined,
      cancelledAt: undefined,
      cancellationReason: undefined,
    };

    if (editingAppointmentId) {
      updateAppointment(editingAppointmentId, nextData);
      setSuccessMessage(`Service updated for ${formData.customer}`);
      toast.success("Service appointment updated successfully!");
    } else {
      const newAppointment = {
        id: getNextAppointmentId(),
        ...nextData,
      };
      addAppointment(newAppointment);
      setSuccessMessage(`Service assigned to ${formData.employee} for ${formData.customer}`);
      toast.success("Service appointment created successfully!");
    }
    setShowSuccessMessage(true);
    setShowAssignForm(false);
    resetForm();
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const closeForm = () => {
    setShowAssignForm(false);
    resetForm();
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  const openCancel = (apt: ServiceAppointment) => {
    setCancelReason(apt.cancellationReason ?? "");
    setCancelTarget(apt);
  };

  const closeCancel = () => {
    setCancelTarget(null);
    setCancelReason("");
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      toast.error("Add a cancellation reason.");
      return;
    }
    const cancelledAt = new Date().toISOString();
    updateAppointment(cancelTarget.id, {
      status: "Cancelled",
      cancelledAt,
      cancellationReason: cancelReason.trim(),
    });
    setSelectedService((prev) =>
      prev && prev.id === cancelTarget.id
        ? { ...prev, status: "Cancelled", cancelledAt, cancellationReason: cancelReason.trim() }
        : prev
    );
    toast.success("Appointment cancelled");
    closeCancel();
  };

  const unscheduledWorkOrders = workOrders.filter((wo) => !appointments.some((a) => a.workOrderId === wo.id));

  const filteredAppointments = appointments
    .filter((a) => {
      if (statusFilter === "All") return true;
      if (statusFilter === "Overdue") return isOverdue(a);
      return a.status === statusFilter;
    })
    .filter(shouldIncludeByDate)
    .filter((a) => {
      const wo = getWorkOrder(a.workOrderId);
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (wo?.customer ?? "").toLowerCase().includes(q) ||
        a.workOrderId.toLowerCase().includes(q) ||
        a.employeeName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    });

  const scheduledCount = appointments.filter((a) => a.status === "Scheduled").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "Cancelled").length;
  const overdueCount = appointments.filter((a) => isOverdue(a)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-sm font-medium text-success">
            ✓ {successMessage}. Employee will receive the task in their mobile app.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Service Appointments</h2>
          <p className="text-sm text-muted-foreground">Assign and track service appointments</p>
        </div>
        <button 
          onClick={openAssignNew}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all" 
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <Plus className="w-4 h-4" /> Assign Service
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Scheduled</p>
          <p className="text-lg font-bold text-card-foreground mt-1">{scheduledCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Overdue</p>
          <p className="text-lg font-bold text-card-foreground mt-1">{overdueCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-lg font-bold text-card-foreground mt-1">{completedCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Cancelled</p>
          <p className="text-lg font-bold text-card-foreground mt-1">{cancelledCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Unscheduled Work Orders</p>
          <p className="text-lg font-bold text-card-foreground mt-1">{unscheduledWorkOrders.length}</p>
        </div>
      </div>

      {/* Assign Service Form */}
      {showAssignForm && (
        <div className="bg-card rounded-xl border border-border shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Form Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h3 className="text-lg font-bold text-card-foreground">{editingAppointmentId ? "Edit Service Appointment" : "Assign Service Appointment"}</h3>
              <p className="text-sm text-muted-foreground mt-1">{editingAppointmentId ? "Update the schedule or technician" : "Schedule and assign a service to an employee"}</p>
            </div>
            <button 
              onClick={closeForm}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Work Order Information */}
            {workOrderData && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-xs font-medium text-primary mb-2">Work Order</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">{workOrderData.id}</span>
                    <span className="text-sm font-semibold text-card-foreground">{workOrderData.customer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {workOrderData.address}
                  </div>
                </div>
              </div>
            )}

            {!workOrderData && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 block">
                    Select Work Order <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.workOrderId}
                    onChange={(e) => {
                      const workOrderId = e.target.value;
                      const workOrder = workOrderId ? getWorkOrder(workOrderId) : undefined;
                      if (!workOrder) {
                        setWorkOrderData(null);
                        setFormData((prev) => ({
                          ...prev,
                          workOrderId: workOrderId,
                          customer: "",
                          address: "",
                          serviceType: "",
                          subject: "",
                          salesExecutive: "",
                          refNo: "",
                        }));
                        return;
                      }
                      setWorkOrderData(workOrder);
                      setFormData((prev) => ({
                        ...prev,
                        workOrderId: workOrder.id,
                        customer: workOrder.customer,
                        address: workOrder.address,
                        serviceType: workOrder.serviceType,
                        subject: workOrder.subject ?? workOrder.serviceType,
                        salesExecutive: workOrder.salesExecutive ?? "",
                        refNo: workOrder.reference ?? "",
                        appointmentDate: prev.appointmentDate || new Date().toISOString().split("T")[0],
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Choose a work order...</option>
                    {workOrders.map((wo) => (
                      <option key={wo.id} value={wo.id}>
                        {wo.id} — {wo.customer}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Appointment Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-card-foreground">Appointment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 block">
                    <Calendar className="w-3 h-3" />
                    Date
                  </label>
                  <input 
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 block">
                    <Clock className="w-3 h-3" />
                    Time
                  </label>
                  <input 
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Leave Date/Time empty to create an unscheduled assignment.</p>
            </div>

            {/* Employee Assignment */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-card-foreground">Assign Employee</h4>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 block">
                  <User className="w-3 h-3" />
                  Select Technician <span className="text-destructive">*</span>
                </label>
                <select 
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Choose a technician...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} {emp.availability === "Busy" ? "(Busy)" : "(Available)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-card-foreground">Service Fields</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject</label>
                  <input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Monthly service / One-time visit"
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Sales Executive</label>
                  <input
                    value={formData.salesExecutive}
                    onChange={(e) => setFormData({ ...formData, salesExecutive: e.target.value })}
                    placeholder="Name"
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Ref No</label>
                  <input
                    value={formData.refNo}
                    onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                    placeholder="Reference number"
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Warranty Period</label>
                  <input
                    value={formData.warrantyPeriod}
                    onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
                    placeholder="e.g., 3 Months"
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">Technicians</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value=""
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;
                      setFormData((prev) => ({ ...prev, technicians: Array.from(new Set([...prev.technicians, value])) }));
                    }}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Add technician (optional)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, technicians: [] }))}
                    className="h-10 px-3 text-xs font-semibold border border-border text-card-foreground rounded-lg hover:bg-secondary transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {(formData.technicians.length > 0 || formData.employee) && (
                  <div className="flex flex-wrap gap-2">
                    {[...new Set([formData.employee, ...formData.technicians].filter(Boolean))].map((name) => (
                      <div key={name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-card-foreground">
                        <span>{name}</span>
                        {name !== formData.employee && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, technicians: prev.technicians.filter((t) => t !== name) }))}
                            className="p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              
            </div>

            {/* Service Instructions */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-card-foreground">Service Instructions</h4>
              <textarea 
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Add specific instructions for this service appointment..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Task Checklist */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <h4 className="text-sm font-semibold text-card-foreground mb-2">Task Checklist</h4>
                <p className="text-xs text-muted-foreground mb-4">Add tasks for the employee to complete during this service</p>
              </div>

              {/* Add Task Input */}
              <div className="space-y-3 p-4 bg-secondary/30 rounded-lg border border-border">
                <input 
                  type="text"
                  placeholder="e.g., Inspect equipment, Collect payment, Document findings..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Closing Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newTaskClosingDateTime}
                      onChange={(e) => setNewTaskClosingDateTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch</label>
                    <input
                      value={newTaskBranch}
                      onChange={(e) => setNewTaskBranch(e.target.value)}
                      placeholder="Branch"
                      className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Staff</label>
                    <select
                      value={newTaskStaff}
                      onChange={(e) => setNewTaskStaff(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select staff (optional)</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Attachment (Photo, Video, Audio, Documents)</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (!files.length) return;
                        const next = files.map((f) => {
                          let kind: AttachmentKind = "Document";
                          if (f.type.startsWith("image/")) kind = "Photo";
                          else if (f.type.startsWith("video/")) kind = "Video";
                          else if (f.type.startsWith("audio/")) kind = "Audio";
                          return { id: `ATT-${Date.now()}-${f.name}`, name: f.name, kind };
                        });
                        setNewTaskAttachments((prev) => [...prev, ...next]);
                        e.currentTarget.value = "";
                      }}
                      className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-border file:bg-secondary file:text-card-foreground file:text-xs file:font-semibold hover:file:bg-secondary/70"
                    />
                    {newTaskAttachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newTaskAttachments.map((a) => (
                          <div key={a.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-card-foreground">
                            <span>{a.name}</span>
                            <button
                              type="button"
                              onClick={() => setNewTaskAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                              className="p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={addTask}
                  disabled={!newTaskTitle.trim()}
                  className="w-full px-3 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  + Add Task
                </button>
              </div>

              {/* Tasks List */}
              {formData.tasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Tasks ({formData.tasks.length})</p>
                  {formData.tasks.map((task, idx) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{task.title}</p>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          {task.closingDateTime && <span>Close: {new Date(task.closingDateTime).toLocaleString()}</span>}
                          {task.branch && <span>Branch: {task.branch}</span>}
                          {task.staff && <span>Staff: {task.staff}</span>}
                          {task.attachments && task.attachments.length > 0 && <span>Attachments: {task.attachments.length}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-border">
            <button 
              onClick={closeForm}
              className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button 
              onClick={handleAssignService}
              className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg" 
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              {editingAppointmentId ? "Save Changes" : "Assign Service"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Scheduled", "Unscheduled", "Overdue", "Completed", "Cancelled"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setStatusFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                statusFilter === t
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:ml-auto sm:justify-end">
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setShowDateDropdown((v) => !v)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                showDateDropdown ? "border-primary/30 ring-2 ring-primary/10" : "border-border"
              } bg-card hover:bg-secondary`}
              aria-haspopup="listbox"
              aria-expanded={showDateDropdown}
            >
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-card-foreground">{dateFilter}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showDateDropdown ? "rotate-180" : ""}`} />
            </button>
            {showDateDropdown && (
              <div className="absolute left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg z-20 min-w-[160px] p-1">
                {(["All", "Today", "Week", "Month"] as const).map((opt) => {
                  const active = dateFilter === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDateFilter(opt);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                        active ? "bg-primary/5 text-primary font-semibold" : "text-card-foreground hover:bg-secondary"
                      }`}
                      role="option"
                      aria-selected={active}
                    >
                      <span>{opt}</span>
                      {active ? <Check className="w-4 h-4" /> : <span className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Unscheduled Work Orders</h3>
            <p className="text-xs text-muted-foreground mt-1">Work orders with no scheduled appointment yet</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            Assign to create the first appointment
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Work Order", "Customer", "Service", "Work Order Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unscheduledWorkOrders.length === 0 ? (
                <tr className="border-b border-border last:border-0">
                  <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={5}>
                    No unscheduled work orders.
                  </td>
                </tr>
              ) : (
                unscheduledWorkOrders.map((wo) => (
                  <tr key={wo.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-card-foreground">{wo.id}</td>
                    <td className="px-5 py-4 text-card-foreground">{wo.customer}</td>
                    <td className="px-5 py-4 text-muted-foreground">{wo.serviceType}</td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={wo.status}
                        variant={wo.status === "Open" ? "warning" : wo.status === "Completed" ? "success" : "info"}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openAssignForWorkOrder(wo)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
                        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Assigned Services</h3>
            <p className="text-xs text-muted-foreground mt-1">{filteredAppointments.length} appointments</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Service ID", "Work Order", "Customer", "Technician", "When", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr className="border-b border-border last:border-0">
                  <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={7}>
                    No appointments match your filters.
                  </td>
                </tr>
              ) : filteredAppointments.map((a) => {
                const wo = getWorkOrder(a.workOrderId);
                return (
                  <tr 
                    key={a.id} 
                    onClick={() => {
                      setSelectedService({ ...a, workOrder: wo });
                    }}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 font-semibold text-primary text-sm">{a.id}</td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">{a.workOrderId}</td>
                    <td className="px-5 py-4 text-card-foreground text-sm font-medium">{wo?.customer ?? "Unknown"}</td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">{a.employeeName}</td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">{a.status === "Unscheduled" ? "Unscheduled" : formatDateTime(a.date, a.time)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label={a.status} variant={statusMap[a.status as keyof typeof statusMap]} />
                        {isOverdue(a) && <StatusBadge label="Overdue" variant="warning" />}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService({ ...a, workOrder: wo });
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-card-foreground hover:bg-secondary transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditAppointment(a);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-card-foreground hover:bg-secondary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {a.status !== "Completed" && a.status !== "Cancelled" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCancel(a);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/20 z-50 animate-in fade-in duration-300 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">Service Details</h3>
                  <p className="text-sm text-muted-foreground">{selectedService.id}</p>
                </div>
              </div>
              <button
                onClick={closeServiceModal}
                className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
              {/* Service Appointment Info */}
              <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                <h4 className="text-sm font-semibold text-card-foreground mb-4">Appointment Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Service ID</span>
                    <span className="text-sm font-semibold text-primary">{selectedService.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Work Order</span>
                    <span className="text-sm font-semibold text-card-foreground">{selectedService.workOrderId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <StatusBadge label={selectedService.status} variant={statusMap[selectedService.status as keyof typeof statusMap]} />
                  </div>
                  {isOverdue(selectedService) && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Attention</span>
                      <StatusBadge label="Overdue" variant="warning" />
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Work Order Details */}
              {selectedService.workOrder && (
                <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-semibold text-card-foreground mb-4">Customer Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Customer Name</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedService.workOrder.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service Address</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedService.workOrder.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedService.workOrder.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment Schedule */}
              <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                <h4 className="text-sm font-semibold text-card-foreground mb-4">Appointment Schedule</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">When</p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {selectedService.status === "Unscheduled" || !selectedService.date || !selectedService.time
                          ? "Unscheduled"
                          : formatDateTime(selectedService.date, selectedService.time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Employee */}
              <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                <h4 className="text-sm font-semibold text-card-foreground mb-4">Assigned Technician</h4>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                  <User className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Primary</p>
                    <p className="text-sm font-semibold text-card-foreground">{selectedService.employeeName}</p>
                    {selectedService.technicians && selectedService.technicians.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.from(new Set([selectedService.employeeName, ...selectedService.technicians].filter(Boolean))).map((name) => (
                          <div key={name} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-secondary/30 border border-border text-xs font-semibold text-card-foreground">
                            {name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(selectedService.subject || selectedService.salesExecutive || selectedService.refNo || selectedService.warrantyPeriod) && (
                <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-semibold text-card-foreground mb-4">Service Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Subject</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedService.subject || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sales Executive</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedService.salesExecutive || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ref No</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedService.refNo || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Warranty Period</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedService.warrantyPeriod || "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Instructions */}
              {selectedService.instructions && (
                <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-semibold text-card-foreground mb-3">Service Instructions</h4>
                  <p className="text-sm text-card-foreground leading-relaxed">{selectedService.instructions}</p>
                </div>
              )}

              {/* Task Checklist */}
              {selectedService.tasks && selectedService.tasks.length > 0 && (
                <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-semibold text-card-foreground mb-4">Task Checklist ({selectedService.tasks.length})</h4>
                  <div className="space-y-2">
                    {selectedService.tasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${task.completed ? "text-muted-foreground line-through" : "text-card-foreground"}`}>{task.title}</p>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            {task.closingDateTime && <span>Close: {new Date(task.closingDateTime).toLocaleString()}</span>}
                            {task.branch && <span>Branch: {task.branch}</span>}
                            {task.staff && <span>Staff: {task.staff}</span>}
                            {task.attachments && task.attachments.length > 0 && <span>Attachments: {task.attachments.length}</span>}
                          </div>
                        </div>
                        <StatusBadge label={task.completed ? "Done" : "Pending"} variant={task.completed ? "success" : "neutral"} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedService.status === "Completed" && (
                <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-semibold text-card-foreground mb-4">Completion</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Completed At</span>
                      <span className="text-sm font-semibold text-card-foreground">
                        {selectedService.completedAt ? new Date(selectedService.completedAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    {(selectedService.inTime || selectedService.outTime) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">In Time</p>
                          <p className="text-sm font-semibold text-card-foreground">{selectedService.inTime || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Out Time</p>
                          <p className="text-sm font-semibold text-card-foreground">{selectedService.outTime || "—"}</p>
                        </div>
                      </div>
                    )}
                    {selectedService.serviceDescription && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Service Description</p>
                        <p className="text-sm text-card-foreground leading-relaxed">{selectedService.serviceDescription}</p>
                      </div>
                    )}
                    {selectedService.payment && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Payment Mode</p>
                          <p className="text-sm font-semibold text-card-foreground">{selectedService.payment.mode}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Amount</p>
                          <p className="text-sm font-semibold text-card-foreground">
                            {typeof selectedService.payment.amount === "number" ? selectedService.payment.amount.toLocaleString() : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Regular Billing</p>
                          <p className="text-sm font-semibold text-card-foreground">{selectedService.payment.regularBilling ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    )}
                    {selectedService.completionNotes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Completion Notes</p>
                        <p className="text-sm text-card-foreground leading-relaxed">{selectedService.completionNotes}</p>
                      </div>
                    )}
                    {(selectedService.customerSignature || selectedService.technicianSignature) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Customer Signature</p>
                          <p className="text-sm font-semibold text-card-foreground">{selectedService.customerSignature?.name || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Technician Signature</p>
                          <p className="text-sm font-semibold text-card-foreground">{selectedService.technicianSignature?.name || "—"}</p>
                        </div>
                      </div>
                    )}
                    {((selectedService.beforeProof?.length ?? 0) > 0 || (selectedService.afterProof?.length ?? 0) > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Before Proof</p>
                          <p className="text-sm font-semibold text-card-foreground">{(selectedService.beforeProof?.length ?? 0) || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">After Proof</p>
                          <p className="text-sm font-semibold text-card-foreground">{(selectedService.afterProof?.length ?? 0) || "—"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedService.status === "Cancelled" && (
                <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-semibold text-card-foreground mb-4">Cancellation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Cancelled At</span>
                      <span className="text-sm font-semibold text-card-foreground">
                        {selectedService.cancelledAt ? new Date(selectedService.cancelledAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    {selectedService.cancellationReason && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cancellation Reason</p>
                        <p className="text-sm text-card-foreground leading-relaxed">{selectedService.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-border bg-card flex-shrink-0">
              <button
                onClick={closeServiceModal}
                className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => openEditAppointment(selectedService)}
                className="flex-1 h-10 border border-border text-card-foreground text-sm font-semibold hover:bg-secondary transition-colors rounded-lg inline-flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit / Reschedule
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/20 z-50 animate-in fade-in duration-300 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-card rounded-xl shadow-lg w-full max-w-lg flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">Cancel Appointment</h3>
                  <p className="text-sm text-muted-foreground">{cancelTarget.id}</p>
                </div>
                <button
                  onClick={closeCancel}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Work Order</span>
                    <span className="text-sm font-semibold text-card-foreground">{cancelTarget.workOrderId}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">Technician</span>
                    <span className="text-sm font-semibold text-card-foreground">{cancelTarget.employeeName}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Reason</p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g., Customer rescheduled, Technician unavailable, Site closed..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-border bg-card flex-shrink-0">
                <button
                  type="button"
                  onClick={closeCancel}
                  className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  className="flex-1 h-10 border border-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors rounded-lg inline-flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
