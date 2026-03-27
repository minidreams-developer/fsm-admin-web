import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";

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

interface WorkOrderEditModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function WorkOrderEditModal({ workOrder, isOpen, onClose, onSave }: WorkOrderEditModalProps) {
  const { updateWorkOrder } = useProjectsStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customer: workOrder.customer,
      phone: workOrder.phone,
      address: workOrder.address,
      email: workOrder.email,
      subject: workOrder.subject,
      serviceType: workOrder.serviceType,
      frequency: workOrder.frequency,
      totalValue: workOrder.totalValue.replace(/[₹,\s]/g, ""),
      paidAmount: workOrder.paidAmount.replace(/[₹,\s]/g, ""),
      start: workOrder.start,
      end: workOrder.end,
      status: workOrder.status,
      assignedTech: workOrder.assignedTech,
      notes: workOrder.notes,
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
        frequency: data.frequency || "",
        totalValue: data.totalValue ? `₹ ${parseInt(data.totalValue).toLocaleString()}` : "₹ 0",
        paidAmount: data.paidAmount ? `₹ ${parseInt(data.paidAmount).toLocaleString()}` : "₹ 0",
        start: data.start,
        end: data.end || data.start,
        status: data.status,
        assignedTech: data.assignedTech || "Unassigned",
        notes: data.notes || "",
      });
      toast.success("Work Order updated successfully!");
      onSave();
      onClose();
    } catch (error) {
      toast.error("Failed to update work order");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold text-card-foreground">Edit Work Order</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
              <input
                type="text"
                {...register("customer")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone *</label>
              <input
                type="tel"
                {...register("phone")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Address *</label>
              <input
                type="text"
                {...register("address")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject *</label>
              <input
                type="text"
                {...register("subject")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Type</label>
              <input
                type="text"
                {...register("serviceType")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
              <input
                type="text"
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
              {errors.start && <p className="text-xs text-red-500 mt-1">{errors.start.message}</p>}
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
                {...register("totalValue")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount (₹)</label>
              <input
                type="number"
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
                {...register("assignedTech")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
              <textarea
                rows={3}
                {...register("notes")}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
