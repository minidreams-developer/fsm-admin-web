import { useNavigate, useLocation } from "react-router-dom";
import { X, Edit2, Plus } from "lucide-react";
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
import { useCustomersStore } from "@/store/customersStore";

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
  status: z.enum(["Authorization Pending", "Open", "Scheduled", "Completed"]),
  assignedTech: z.string().optional(),
  notes: z.string().optional(),
  siteAddress: z.string().optional(),
  billingAddress: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

type TaskStatus = "Pending" | "In Progress" | "Completed";

type Task = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  assignedEmployees: string[]; // Add support for multiple employees
  status: TaskStatus;
  quantity: number;
};

const CreateWorkOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addWorkOrder, getNextWorkOrderId } = useProjectsStore();
  const { addTask } = useTasksStore();
  const { products } = useProductsStore();
  const { employees } = useEmployeesStore();
  const { customers } = useCustomersStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    (location.state as any)?.leadData?.services ?? []
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [extraSiteAddresses, setExtraSiteAddresses] = useState<string[]>([]);

  const serviceOptions = products.filter((p) => p.category === "Services" && p.status === "Active").map((p) => p.name);
  
  // Filter employees to show only Sales Executives
  const salesExecutives = employees.filter((emp) => emp.role === "Sales Executive");

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const fullName = `${customer.firstName} ${customer.lastName}`.trim();
      setValue("customer", fullName);
      setValue("phone", customer.mobile || customer.landline || "");
      setValue("email", customer.emailAddress || "");
      setValue("address", customer.siteAddress || customer.billingAddress || "");
      setValue("siteAddress", customer.siteAddress || "", { shouldValidate: true, shouldDirty: true });
      setValue("billingAddress", customer.billingAddress || "", { shouldValidate: true, shouldDirty: true });
    }
  };

  const leadData = (location.state as any)?.leadData;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customer: leadData?.name || "",
      phone: leadData?.phone || "",
      address: leadData?.address || "",
      subject: leadData?.services?.join(", ") || "",
      serviceType: leadData?.services?.[0] || "",
      status: "Authorization Pending",
      start: new Date().toISOString().split("T")[0],
      siteAddress: "",
      billingAddress: "",
    },
  });

  const toggleService = (value: string) => {
    setSelectedServices((prev) => {
      const next = prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value];
      setValue("serviceType", next[0] ?? "");
      // add as task if not already there
      if (!prev.includes(value) && !tasks.find((t) => t.title === value)) {
        setTasks((t) => [...t, { 
          id: Date.now().toString(), 
          title: value, 
          startDate: "", 
          endDate: "", 
          assignedTo: "", 
          assignedEmployees: [],
          status: "Pending",
          quantity: 1
        }]);
      }
      if (prev.includes(value)) {
        setTasks((t) => t.filter((task) => task.title !== value));
      }
      return next;
    });
  };

  const toggleEmployee = (employeeName: string) => {
    setSelectedEmployees((prev) => 
      prev.includes(employeeName) 
        ? prev.filter((e) => e !== employeeName) 
        : [...prev, employeeName]
    );
  };

  const removeService = (value: string) => toggleService(value);

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
    toast.success("Service updated");
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const onSubmit = async (data: WorkOrderFormData) => {
    setIsSubmitting(true);
    try {
      const workOrderId = getNextWorkOrderId();
      
      // Combine all site addresses
      const allSiteAddresses = [
        data.siteAddress || data.address,
        ...extraSiteAddresses.filter(addr => addr.trim())
      ].filter(Boolean).join(" | ");
      
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
        status: data.status as "Authorization Pending" | "Open" | "Scheduled" | "Completed",
        assignedTech: selectedEmployees.length > 0 ? selectedEmployees.join(", ") : "Unassigned",
        notes: data.notes || "",
        siteAddress: allSiteAddresses,
        billingAddress: data.billingAddress || data.address,
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
          assignedTo: t.assignedEmployees.length > 0 ? t.assignedEmployees.join(", ") : t.assignedTo,
          assignedEmployees: t.assignedEmployees.length > 0 ? t.assignedEmployees : (t.assignedTo ? [t.assignedTo] : []),
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
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                if (e.target.value) {
                  handleCustomerSelect(e.target.value);
                } else {
                  setSelectedCustomerId("");
                  setValue("customer", "");
                  setValue("phone", "");
                  setValue("email", "");
                  setValue("address", "");
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            >
              <option value="">Select customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName} — {customer.mobile || customer.landline}
                </option>
              ))}
            </select>
            {/* Hidden input for form validation */}
            <input type="hidden" {...register("customer")} />
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
            <input type="text" placeholder=" address" {...register("address")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground block">Site Address</label>
              <button
                type="button"
                onClick={() => setExtraSiteAddresses(prev => [...prev, ""])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <textarea
              {...register("siteAddress")}
              placeholder="e.g. 12 MG Road, Kochi"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            {extraSiteAddresses.map((addr, idx) => (
              <div key={idx} className="relative mt-2">
                <textarea
                  value={addr}
                  onChange={(e) => setExtraSiteAddresses(prev => prev.map((a, i) => i === idx ? e.target.value : a))}
                  placeholder={`e.g. Site Address ${idx + 2}`}
                  rows={2}
                  className="w-full px-3 py-2.5 pr-9 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  type="button"
                  onClick={() => setExtraSiteAddresses(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-2.5 right-2.5 p-0.5 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="text-xs font-medium text-muted-foreground block">Billing Address</label>
              <button
                type="button"
                onClick={() => {
                  const siteAddr = document.querySelector<HTMLTextAreaElement>('textarea[name="siteAddress"]')?.value || "";
                  setValue("billingAddress", siteAddr);
                }}
                className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                Same as Site Address
              </button>
            </div>
            <textarea
              {...register("billingAddress")}
              placeholder="e.g. 12 MG Road, Kochi"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
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
              <option value="Authorization Pending">Authorization Pending</option>
              <option value="Open">Open</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Sales Executives</label>
            <select
              onChange={(e) => { if (e.target.value) { toggleEmployee(e.target.value); e.target.value = ""; } }}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground mb-2"
              defaultValue=""
            >
              <option value="" disabled>
                {salesExecutives.length === 0 ? "No Sales Executives available" : "Select sales executives..."}
              </option>
              {salesExecutives.map((emp) => (
                <option key={emp.id} value={emp.name} disabled={selectedEmployees.includes(emp.name)}>
                  {emp.name} — {emp.role}{selectedEmployees.includes(emp.name) ? " ✓" : ""}
                </option>
              ))}
            </select>
            
            {/* Display selected employees */}
            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEmployees.map((empName) => {
                  const emp = employees.find(e => e.name === empName);
                  return (
                    <div key={empName} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="text-xs font-medium text-primary">{empName}</span>
                      {emp && <span className="text-xs text-primary/70">• {emp.role}</span>}
                      <button 
                        type="button" 
                        onClick={() => toggleEmployee(empName)} 
                        className="text-primary hover:text-primary/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Hidden input for form compatibility */}
            <input type="hidden" {...register("assignedTech")} value={selectedEmployees.join(", ")} />
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

      {/* Services Section */}
      {tasks.length > 0 && (
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-bold text-card-foreground">Services</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Services added — click Edit to configure</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Service", "Quantity", "From Date", "To Date", "Assigned To", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground text-xs">{task.title}</td>
                  <td className="px-4 py-3 text-card-foreground text-xs font-semibold">{task.quantity || 1}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{task.startDate || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{task.endDate || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {task.assignedEmployees.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {task.assignedEmployees.map((empName, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                            {empName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      task.assignedTo || "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${statusColors[task.status]}`}>{task.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingTask({ ...task })} className="p-1.5 rounded-md border border-border hover:bg-secondary transition-colors" title="Edit service">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => removeTask(task.id)} className="p-1.5 rounded-md border border-border hover:bg-destructive/10 transition-colors" title="Remove service">
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

      {/* Edit Service Modal */}
      {editingTask && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold text-card-foreground">Edit Service</h2>
              <button onClick={() => setEditingTask(null)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Service</label>
                <input value={editingTask.title} readOnly className="w-full px-3 py-2 rounded-lg bg-secondary/50 text-sm border border-border text-card-foreground" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={editingTask.quantity} 
                  onChange={(e) => setEditingTask({ ...editingTask, quantity: Math.max(1, parseInt(e.target.value) || 1) })} 
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" 
                />
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
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Employees</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const empName = e.target.value;
                      if (!editingTask.assignedEmployees.includes(empName)) {
                        const newEmployees = [...editingTask.assignedEmployees, empName];
                        setEditingTask({ 
                          ...editingTask, 
                          assignedEmployees: newEmployees,
                          assignedTo: newEmployees.join(", ")
                        });
                      }
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground mb-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {employees.length === 0 ? "No employees available" : "Select employees..."}
                  </option>
                  {employees.map((emp) => (
                    <option 
                      key={emp.id} 
                      value={emp.name} 
                      disabled={editingTask.assignedEmployees.includes(emp.name)}
                    >
                      {emp.name} — {emp.role}{editingTask.assignedEmployees.includes(emp.name) ? " ✓" : ""}
                    </option>
                  ))}
                </select>
                
                {/* Display selected employees */}
                {editingTask.assignedEmployees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editingTask.assignedEmployees.map((empName) => {
                      const emp = employees.find(e => e.name === empName);
                      return (
                        <div key={empName} className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
                          <span className="text-xs font-medium text-primary">{empName}</span>
                          {emp && <span className="text-xs text-primary/70">• {emp.role}</span>}
                          <button 
                            type="button" 
                            onClick={() => {
                              const newEmployees = editingTask.assignedEmployees.filter(n => n !== empName);
                              setEditingTask({ 
                                ...editingTask, 
                                assignedEmployees: newEmployees,
                                assignedTo: newEmployees.join(", ")
                              });
                            }}
                            className="text-primary hover:text-primary/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                <button onClick={() => updateTask(editingTask)} className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Update Service</button>
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
