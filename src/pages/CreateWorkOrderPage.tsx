import { useNavigate, useLocation } from "react-router-dom";
import { X, Plus, Edit2 } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProjectsStore } from "@/store/projectsStore";
import { useTasksStore } from "@/store/tasksStore";
import { useProductsStore } from "@/store/productsStore";
import { useEmployeesStore } from "@/store/employeesStore";

const workOrderSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email().optional().or(z.literal("")),
  subject: z.string().min(1, "Subject is required"),
  serviceType: z.string().optional(),
  frequency: z.string().optional(),
  totalValue: z.string().optional(),
  paidAmount: z.string().optional(),
  start: z.string().min(1, "Start date is required"),
  end: z.string().optional(),
  status: z.enum(["Open", "Scheduled", "Completed"]),
  assignedTech: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

type TaskStatus = "Pending" | "In Progress" | "Completed";

type Task = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  status: TaskStatus;
};

const CreateWorkOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addWorkOrder, getNextWorkOrderId } = useProjectsStore();
  const { addTask } = useTasksStore();
  const { products } = useProductsStore();
  const { employees } = useEmployeesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    (location.state as any)?.leadData?.services ?? []
  );

  const serviceOptions = products.filter((p) => p.category === "Services" && p.status === "Active").map((p) => p.name);

  const leadData = (location.state as any)?.leadData;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customer: leadData?.name || "",
      phone: leadData?.phone || "",
      address: leadData?.address || "",
      subject: leadData?.services?.join(", ") || "",
      serviceType: leadData?.services?.[0] || "",
      status: "Open",
      start: new Date().toISOString().split("T")[0],
    },
  });

  const toggleService = (value: string) => {
    setSelectedServices((prev) => {
      const next = prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value];
      setValue("serviceType", next[0] ?? "");
      // add as task if not already there
      if (!prev.includes(value) && !tasks.find((t) => t.title === value)) {
        setTasks((t) => [...t, { id: Date.now().toString(), title: value, startDate: "", endDate: "", assignedTo: "", status: "Pending" }]);
      }
      if (prev.includes(value)) {
        setTasks((t) => t.filter((task) => task.title !== value));
      }
      return next;
    });
  };

  const removeService = (value: string) => toggleService(value);

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
    toast.success("Task updated");
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const onSubmit = async (data: WorkOrderFormData) => {
    setIsSubmitting(true);
    try {
      const workOrderId = getNextWorkOrderId();
      addWorkOrder({
        id: workOrderId,
        customer: data.customer,
        address: data.address,
        phone: data.phone,
        email: data.email || "",
        subject: data.subject,
        serviceType: data.serviceType || "",
        serviceTypes: selectedServices,
        frequency: data.frequency || "",
        totalValue: data.totalValue ? `₹ ${parseInt(data.totalValue).toLocaleString()}` : "₹ 0",
        paidAmount: data.paidAmount ? `₹ ${parseInt(data.paidAmount).toLocaleString()}` : "₹ 0",
        start: data.start,
        end: data.end || data.start,
        status: data.status as "Open" | "Scheduled" | "Completed",
        assignedTech: data.assignedTech || "Unassigned",
        notes: data.notes || "",
        siteAddress: data.address,
        billingAddress: data.address,
        nextService: "Unassigned",
      });
      tasks.forEach((t, i) => {
        addTask({
          id: `TASK-${Date.now()}-${i}`,
          workOrderId,
          title: t.title,
          description: "",
          startDate: t.startDate,
          endDate: t.endDate,
          assignedTo: t.assignedTo,
          status: t.status,
        });
      });
      toast.success("Work Order created successfully!");
      navigate("/projects");
    } catch {
      toast.error("Failed to create work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<TaskStatus, string> = {
    Pending: "bg-warning/10 text-warning border-warning/20",
    "In Progress": "bg-primary/10 text-primary border-primary/20",
    Completed: "bg-success/10 text-success border-success/20",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-card-foreground">Create New Work Order</h1>
          <p className="text-sm text-muted-foreground mt-2">Fill in the details to create a new work order</p>
        </div>
        <button onClick={() => navigate("/projects")} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
            <input type="text" placeholder="Enter customer name" {...register("customer")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone *</label>
            <input type="tel" placeholder="9876543210" {...register("phone")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
            <input type="email" placeholder="customer@email.com" {...register("email")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Address *</label>
            <input type="text" placeholder="Site address" {...register("address")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject *</label>
            <input type="text" placeholder="Work order subject" {...register("subject")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
          </div>

          <div>
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
                    <button type="button" onClick={() => removeService(s)} className="text-primary hover:text-primary/70"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
            {/* hidden input to satisfy react-hook-form */}
            <input type="hidden" {...register("serviceType")} />
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
            <input type="number" placeholder="0" {...register("totalValue")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount (₹)</label>
            <input type="number" placeholder="0" {...register("paidAmount")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
            <select {...register("status")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
              <option value="Open">Open</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Employee</label>
            <select {...register("assignedTech")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
              <option value="">Unassigned</option>
              {employees.map((e) => <option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
            <textarea placeholder="Additional notes..." rows={3} {...register("notes")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button type="button" onClick={() => navigate("/projects")} className="px-6 py-2.5 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
            {isSubmitting ? "Creating..." : "Create Work Order"}
          </button>
        </div>
      </form>

      {/* Tasks Section */}
      {tasks.length > 0 && (
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-bold text-card-foreground">Tasks</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Services added as tasks — click Edit to configure</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Task", "From Date", "To Date", "Assigned To", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground text-xs">{task.title}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{task.startDate || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{task.endDate || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{task.assignedTo || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${statusColors[task.status]}`}>{task.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingTask({ ...task })} className="p-1.5 rounded-md border border-border hover:bg-secondary transition-colors" title="Edit task">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => removeTask(task.id)} className="p-1.5 rounded-md border border-border hover:bg-destructive/10 transition-colors" title="Remove task">
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-card-foreground">Edit Task</h2>
              <button onClick={() => setEditingTask(null)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Task</label>
                <input value={editingTask.title} readOnly className="w-full px-3 py-2 rounded-lg bg-secondary/50 text-sm border border-border text-card-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">From Date</label>
                  <input type="date" value={editingTask.startDate} onChange={(e) => setEditingTask({ ...editingTask, startDate: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">To Date</label>
                  <input type="date" value={editingTask.endDate} onChange={(e) => setEditingTask({ ...editingTask, endDate: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Employee</label>
                <select value={editingTask.assignedTo} onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
                  <option value="">Unassigned</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.name}>{emp.name} — {emp.role}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
                <select value={editingTask.status} onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button onClick={() => setEditingTask(null)} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
                <button onClick={() => updateTask(editingTask)} className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Update Task</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CreateWorkOrderPage;
