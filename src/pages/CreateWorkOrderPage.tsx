import { useNavigate, useLocation } from "react-router-dom";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProjectsStore } from "@/store/projectsStore";

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

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  assignedTo: z.string().min(1, "Task assigned is required"),
});

type TaskFormData = z.infer<typeof taskSchema>;

type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
};

const CreateWorkOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addWorkOrder, getNextWorkOrderId } = useProjectsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const leadData = (location.state as any)?.leadData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkOrderFormData>({
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

  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    formState: { errors: taskErrors },
    reset: resetTaskForm,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: WorkOrderFormData) => {
    setIsSubmitting(true);
    try {
      const newWorkOrder = {
        id: getNextWorkOrderId(),
        customer: data.customer,
        address: data.address,
        phone: data.phone,
        email: data.email || "",
        subject: data.subject,
        serviceType: data.serviceType || "",
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
      };

      addWorkOrder(newWorkOrder);
      toast.success("Work Order created successfully!");
      navigate("/projects");
    } catch (error) {
      toast.error("Failed to create work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTaskSubmit = (data: TaskFormData) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description || "",
      startDate: data.startDate,
      endDate: data.endDate,
      assignedTo: data.assignedTo,
    };
    setTasks([...tasks, newTask]);
    toast.success(`Task "${data.title}" added successfully!`);
    resetTaskForm();
    setShowTaskModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-card-foreground">Create New Work Order</h1>
          <p className="text-sm text-muted-foreground mt-2">Fill in the details to create a new work order</p>
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
              <input
                type="text"
                placeholder="Enter customer name"
                {...register("customer")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.customer && (
                <p className="text-xs text-red-500 mt-1">{errors.customer.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone *</label>
              <input
                type="tel"
                placeholder="9876543210"
                {...register("phone")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                placeholder="customer@email.com"
                {...register("email")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Address *</label>
              <input
                type="text"
                placeholder="Site address"
                {...register("address")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject *</label>
              <input
                type="text"
                placeholder="Work order subject"
                {...register("subject")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.subject && (
                <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Type</label>
              <input
                type="text"
                placeholder="e.g., Pest Control"
                {...register("serviceType")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
              <input
                type="text"
                placeholder="e.g., Monthly"
                {...register("frequency")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date *</label>
              <input
                type="date"
                {...register("start")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.start && (
                <p className="text-xs text-red-500 mt-1">{errors.start.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date</label>
              <input
                type="date"
                {...register("end")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Total Value (₹)</label>
              <input
                type="number"
                placeholder="0"
                {...register("totalValue")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount (₹)</label>
              <input
                type="number"
                placeholder="0"
                {...register("paidAmount")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              >
                <option value="Open">Open</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Assigned Tech</label>
              <input
                type="text"
                placeholder="Technician name"
                {...register("assignedTech")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
              <textarea
                placeholder="Additional notes..."
                rows={4}
                {...register("notes")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-6 py-2.5 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              {isSubmitting ? "Creating..." : "Create Work Order"}
            </button>
            <button
              type="button"
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all whitespace-nowrap"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </form>

      {/* Tasks Section */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">Tasks</h2>
            <p className="text-sm text-muted-foreground mt-1">Added tasks for this work order</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Task Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Start Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">End Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-card-foreground">{task.title}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{task.description || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{task.startDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{task.endDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{task.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
          <div className="bg-card rounded-[20px] shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-card-foreground">Add Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleTaskSubmit(onTaskSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Task Title *</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  {...registerTask("title")}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                />
                {taskErrors.title && (
                  <p className="text-xs text-red-500 mt-1">{taskErrors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
                <textarea
                  placeholder="Enter task description (optional)"
                  rows={2}
                  {...registerTask("description")}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date *</label>
                <input
                  type="date"
                  {...registerTask("startDate")}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                />
                {taskErrors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{taskErrors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date *</label>
                <input
                  type="date"
                  {...registerTask("endDate")}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                />
                {taskErrors.endDate && (
                  <p className="text-xs text-red-500 mt-1">{taskErrors.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Task Assigned *</label>
                <input
                  type="text"
                  placeholder="Enter assigned person name"
                  {...registerTask("assignedTo")}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                />
                {taskErrors.assignedTo && (
                  <p className="text-xs text-red-500 mt-1">{taskErrors.assignedTo.message}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CreateWorkOrderPage;
