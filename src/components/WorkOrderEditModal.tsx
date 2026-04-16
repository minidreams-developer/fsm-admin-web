import { X, Edit2, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { useProductsStore } from "@/store/productsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useTasksStore } from "@/store/tasksStore";
import { useServicesStore } from "@/store/servicesStore";

type TaskStatus = "Pending" | "In Progress" | "Completed";

type Task = {
  id: string;
  title: string;
  description: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  startDate: string;
  endDate: string;
  fromTime: string;
  toTime: string;
  assignedTo: string;
  assignedEmployees: string[];
  status: TaskStatus;
};

type ServiceSchedule = {
  id: string;
  service: string;
  scheduleDate: string;
  timeSlot: string;
  assignedEmployees: string[];
};

const workOrderSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  serviceType: z.string().optional(),
  frequency: z.string().optional(),
  totalValue: z.string().optional(),
  paidAmount: z.string().optional(),
  start: z.string().min(1, "Start date is required"),
  end: z.string().optional(),
  status: z.enum(["Authorization Pending", "Ongoing", "Upcoming", "Missed", "Cancelled", "Completed", "Converted"]),
  assignedTech: z.string().optional(),
  workOrderIncharge: z.string().optional(),
  notes: z.string().optional(),
  siteAddress: z.string().optional(),
  billingAddress: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderEditModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function WorkOrderEditModal({ workOrder, isOpen, onClose, onSave }: WorkOrderEditModalProps) {
  const { updateWorkOrder } = useProjectsStore();
  const { products } = useProductsStore();
  const { employees } = useEmployeesStore();
  const { addTask, getTasksByWorkOrder, updateTask } = useTasksStore();
  const { appointments } = useServicesStore();
  
  const [selectedServices, setSelectedServices] = useState<string[]>(
    workOrder.serviceTypes ?? (workOrder.serviceType ? [workOrder.serviceType] : [])
  );
  
  // Initialize tasks from existing work order tasks
  const existingTasks = getTasksByWorkOrder(workOrder.id);
  const [tasks, setTasks] = useState<Task[]>(
    existingTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      unitPrice: 0,
      quantity: 1,
      amount: 0,
      startDate: t.startDate || "",
      endDate: t.endDate || "",
      fromTime: "",
      toTime: "",
      assignedTo: t.assignedTo || "",
      assignedEmployees: t.assignedEmployees || [],
      status: t.status as TaskStatus,
    }))
  );
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Get services from both Products (Services category) and Service Appointments
  const productServices = products.filter((p) => p.category === "Services" && p.status === "Active");
  const appointmentServices = appointments
    .filter((a) => a.subject)
    .map((a) => {
      let parsedUnitPrice = 0;
      if (a.unitPrice) {
        const cleanPrice = a.unitPrice.replace(/[₹,\s]/g, '');
        parsedUnitPrice = parseFloat(cleanPrice) || 0;
      } else if (a.payment?.amount) {
        parsedUnitPrice = a.payment.amount;
      }
      
      return {
        name: a.subject || "",
        description: a.serviceDescription || "",
        unitPrice: parsedUnitPrice,
      };
    });
  
  const allServices = [
    ...productServices.map(p => ({ name: p.name, description: p.description, unitPrice: p.unitPrice })),
    ...appointmentServices
  ];
  const uniqueServices = Array.from(
    new Map(allServices.map(s => [s.name, s])).values()
  );
  const serviceOptions = uniqueServices.map(s => s.name);

  const toggleService = (value: string) => {
    setSelectedServices((prev) => {
      const next = prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value];
      setValue("serviceType", next[0] ?? "");
      
      // Add as task if not already there
      if (!prev.includes(value) && !tasks.find((t) => t.title === value)) {
        const service = uniqueServices.find(s => s.name === value);
        setTasks((t) => [...t, { 
          id: `TASK-${Date.now()}`, 
          title: value,
          description: service?.description || "",
          unitPrice: service?.unitPrice || 0,
          quantity: 1,
          amount: service?.unitPrice || 0,
          startDate: "", 
          endDate: "",
          fromTime: "",
          toTime: "",
          assignedTo: "", 
          assignedEmployees: [],
          status: "Pending"
        }]);
      }
      
      if (prev.includes(value)) {
        setTasks((t) => t.filter((task) => task.title !== value));
      }
      
      return next;
    });
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskData = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
    toast.success("Service updated");
  };

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customer: workOrder.customer,
      phone: workOrder.phone,
      address: workOrder.address,
      email: workOrder.email,
      location: workOrder.location || "",
      subject: workOrder.subject,
      serviceType: workOrder.serviceType,
      frequency: workOrder.frequency,
      totalValue: workOrder.totalValue.replace(/[₹,\s]/g, ""),
      paidAmount: workOrder.paidAmount.replace(/[₹,\s]/g, ""),
      start: workOrder.start,
      end: workOrder.end,
      status: workOrder.status as WorkOrderFormData["status"],
      assignedTech: workOrder.assignedTech,
      workOrderIncharge: workOrder.workOrderIncharge || "",
      notes: workOrder.notes,
      siteAddress: workOrder.siteAddress || "",
      billingAddress: workOrder.billingAddress || "",
    },
  });

  const onSubmit = (data: WorkOrderFormData) => {
    try {
      updateWorkOrder(workOrder.id, {
        customer: data.customer,
        phone: data.phone,
        address: data.address,
        email: data.email || "",
        subject: data.subject,
        serviceType: data.serviceType || "",
        serviceTypes: selectedServices,
        frequency: data.frequency || "",
        totalValue: data.totalValue ? `₹ ${parseInt(data.totalValue).toLocaleString()}` : "₹ 0",
        paidAmount: data.paidAmount ? `₹ ${parseInt(data.paidAmount).toLocaleString()}` : "₹ 0",
        start: data.start,
        end: data.end || data.start,
        status: data.status as WorkOrder["status"],
        assignedTech: data.assignedTech || "Unassigned",
        notes: data.notes || "",
      });
      toast.success("Work Order updated successfully!");
      onSave();
      onClose();
    } catch {
      toast.error("Failed to update work order");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Edit Work Order</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{workOrder.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
                <input type="text" {...register("customer")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
                {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone *</label>
                <input type="tel" {...register("phone")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
                <input type="email" {...register("email")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Address *</label>
                <input type="text" {...register("address")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
                <input type="text" placeholder="e.g. Kochi, Kerala" {...register("location")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject *</label>
                <input type="text" {...register("subject")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Site Address</label>
                <textarea
                  {...register("siteAddress")}
                  placeholder="e.g. 12 MG Road, Kochi"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Billing Address</label>
                <textarea
                  {...register("billingAddress")}
                  placeholder="e.g. 12 MG Road, Kochi"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
                <input type="text" placeholder="e.g., Monthly" {...register("frequency")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date *</label>
                <input type="date" {...register("start")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
                {errors.start && <p className="text-xs text-red-500 mt-1">{errors.start.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date</label>
                <input type="date" {...register("end")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Total Value (₹)</label>
                <input type="number" {...register("totalValue")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount (₹)</label>
                <input type="number" {...register("paidAmount")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
                <select {...register("status")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
                  <option value="Authorization Pending">Authorization Pending</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Missed">Missed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Work Order Incharge</label>
                <select {...register("workOrderIncharge")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
                  <option value="">Select incharge...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} — {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Employee</label>
                <select {...register("assignedTech")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
                  <option value="">Unassigned</option>
                  {employees.map((e) => <option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
                <textarea rows={3} {...register("notes")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none" />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Type</label>
                <select
                  onChange={(e) => { if (e.target.value) { toggleService(e.target.value); e.target.value = ""; } }}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground mb-2"
                  defaultValue=""
                >
                  <option value="" disabled>Select service type...</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s} disabled={selectedServices.includes(s)}>{s}{selectedServices.includes(s) ? " ✓" : ""}</option>
                  ))}
                </select>
                {selectedServices.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((s) => (
                      <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                        <span className="text-xs font-medium text-primary">{s}</span>
                        <button type="button" onClick={() => toggleService(s)} className="text-primary hover:text-primary/70"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register("serviceType")} />
              </div>
            </div>

            {/* Services Section */}
            {tasks.length > 0 && (
              <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-base font-bold text-card-foreground">Services</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Services added</p>
                </div>
                <div className="flex flex-row gap-0">
                  <div className="flex-1 min-w-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task, index) => (
                          <tr key={task.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                            <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-card-foreground text-xs">{task.title}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{task.description || "—"}</td>
                            <td className="px-4 py-3 text-right text-card-foreground text-xs font-semibold">₹ {task.unitPrice?.toLocaleString() || 0}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newQuantity = Math.max(1, task.quantity - 1);
                                    const newAmount = task.unitPrice * newQuantity;
                                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, quantity: newQuantity, amount: newAmount } : t));
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                                >
                                  <span className="text-xs">−</span>
                                </button>
                                <span className="text-xs font-semibold text-card-foreground min-w-[2rem] text-center">{task.quantity || 1}</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newQuantity = task.quantity + 1;
                                    const newAmount = task.unitPrice * newQuantity;
                                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, quantity: newQuantity, amount: newAmount } : t));
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                                >
                                  <span className="text-xs">+</span>
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-card-foreground text-xs font-bold">₹ {task.amount?.toLocaleString() || 0}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  type="button"
                                  onClick={() => setEditingTask({ ...task })} 
                                  className="p-1.5 rounded-md border border-border hover:bg-secondary transition-colors" 
                                  title="Edit service"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => removeTask(task.id)} 
                                  className="p-1.5 rounded-md border border-border hover:bg-destructive/10 transition-colors" 
                                  title="Remove service"
                                >
                                  <X className="w-3.5 h-3.5 text-destructive" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="w-64 flex-shrink-0 border-l border-border bg-secondary/10 p-4 space-y-3 self-start ml-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                      <span className="text-sm font-semibold text-card-foreground">
                        ₹ {tasks.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">GST (18%)</span>
                      <span className="text-sm font-semibold text-card-foreground">
                        ₹ {(tasks.reduce((sum, t) => sum + (t.amount || 0), 0) * 0.18).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-card-foreground">Total Amount</span>
                        <span className="text-lg font-bold text-primary">
                          ₹ {(tasks.reduce((sum, t) => sum + (t.amount || 0), 0) * 1.18).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Appointments Schedule */}
            {tasks.length > 0 && (
              <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-base font-bold text-card-foreground">Service Appointments Schedule</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Schedule service visits for this work order</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schedule Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Slot</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Employees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, index) => {
                        const schedule = serviceSchedules.find(s => s.service === task.title) || {
                          id: task.id,
                          service: task.title,
                          scheduleDate: "",
                          timeSlot: "",
                          assignedEmployees: []
                        };
                        
                        return (
                          <tr key={task.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                            <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-card-foreground text-sm">{task.title}</td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={schedule.scheduleDate}
                                onChange={(e) => {
                                  setServiceSchedules(prev => {
                                    const existing = prev.find(s => s.service === task.title);
                                    if (existing) {
                                      return prev.map(s => s.service === task.title ? { ...s, scheduleDate: e.target.value } : s);
                                    }
                                    return [...prev, { ...schedule, scheduleDate: e.target.value }];
                                  });
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={schedule.timeSlot}
                                onChange={(e) => {
                                  setServiceSchedules(prev => {
                                    const existing = prev.find(s => s.service === task.title);
                                    if (existing) {
                                      return prev.map(s => s.service === task.title ? { ...s, timeSlot: e.target.value } : s);
                                    }
                                    return [...prev, { ...schedule, timeSlot: e.target.value }];
                                  });
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                              >
                                <option value="">Select time slot</option>
                                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const empName = e.target.value;
                                      setServiceSchedules(prev => {
                                        const existing = prev.find(s => s.service === task.title);
                                        const currentEmployees = existing?.assignedEmployees || [];
                                        
                                        if (!currentEmployees.includes(empName)) {
                                          const newEmployees = [...currentEmployees, empName];
                                          if (existing) {
                                            return prev.map(s => s.service === task.title ? { ...s, assignedEmployees: newEmployees } : s);
                                          }
                                          return [...prev, { ...schedule, assignedEmployees: newEmployees }];
                                        }
                                        return prev;
                                      });
                                      e.target.value = "";
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                                  defaultValue=""
                                >
                                  <option value="" disabled>
                                    {employees.length === 0 ? "No employees" : "Select employees..."}
                                  </option>
                                  {employees.map((emp) => (
                                    <option 
                                      key={emp.id} 
                                      value={emp.name}
                                      disabled={schedule.assignedEmployees.includes(emp.name)}
                                    >
                                      {emp.name} — {emp.role}{schedule.assignedEmployees.includes(emp.name) ? " ✓" : ""}
                                    </option>
                                  ))}
                                </select>
                                
                                {/* Selected Employees List */}
                                {schedule.assignedEmployees.length > 0 && (
                                  <div className="space-y-1">
                                    {schedule.assignedEmployees.map((empName) => {
                                      const emp = employees.find(e => e.name === empName);
                                      return (
                                        <div
                                          key={empName}
                                          className="flex items-center justify-between gap-2 px-2 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded border border-primary/20"
                                        >
                                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            <span className="truncate">{empName}</span>
                                            {emp && <span className="text-primary/70 text-[10px] flex-shrink-0">• {emp.role}</span>}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setServiceSchedules(prev => {
                                                const existing = prev.find(s => s.service === task.title);
                                                if (existing) {
                                                  const newEmployees = existing.assignedEmployees.filter(name => name !== empName);
                                                  return prev.map(s => s.service === task.title ? { ...s, assignedEmployees: newEmployees } : s);
                                                }
                                                return prev;
                                              });
                                            }}
                                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
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
            )}

            {/* Terms & Conditions */}
            <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold text-card-foreground">Terms & Conditions</h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div className="space-y-2.5">
                  <div className="flex gap-3">
                    <span className="text-sm font-medium text-muted-foreground flex-shrink-0">1.</span>
                    <p className="text-sm text-muted-foreground">Services will be performed as per the scheduled appointments</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-sm font-medium text-muted-foreground flex-shrink-0">2.</span>
                    <p className="text-sm text-muted-foreground">Customer must provide access to all areas requiring treatment</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-sm font-medium text-muted-foreground flex-shrink-0">3.</span>
                    <p className="text-sm text-muted-foreground">Payment is due within 30 days of invoice date</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-sm font-medium text-muted-foreground flex-shrink-0">4.</span>
                    <p className="text-sm text-muted-foreground">24-hour advance notice required for rescheduling</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-sm font-medium text-muted-foreground flex-shrink-0">5.</span>
                    <p className="text-sm text-muted-foreground">Service warranty valid for 30 days after each treatment</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                      I agree to the terms and conditions
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button type="button" onClick={onClose} className="px-6 py-2.5 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
