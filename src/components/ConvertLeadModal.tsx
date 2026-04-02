import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProjectsStore } from "@/store/projectsStore";
import { useLeadsStore, type Lead } from "@/store/leadsStore";

const convertSchema = z.object({
  totalValue: z.string().min(1, "Total value is required"),
  paidAmount: z.string().optional(),
  assignedTech: z.string().optional(),
  notes: z.string().optional(),
});

type ConvertFormData = z.infer<typeof convertSchema>;

interface ConvertLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConvertLeadModal({ lead, isOpen, onClose, onSuccess }: ConvertLeadModalProps) {
  const { addWorkOrder, getNextWorkOrderId } = useProjectsStore();
  const { updateLead } = useLeadsStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConvertFormData>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      totalValue: "",
      paidAmount: "",
      assignedTech: "",
      notes: "",
    },
  });

  const onSubmit = (data: ConvertFormData) => {
    if (!lead) return;

    try {
      const newWorkOrder = {
        id: getNextWorkOrderId(),
        customer: lead.name,
        address: lead.address,
        phone: lead.phone,
        email: "",
        subject: lead.services.join(", "),
        serviceType: lead.services[0] || "Service",
        frequency: "One-Time",
        totalValue: data.totalValue ? `₹ ${parseInt(data.totalValue).toLocaleString()}` : "₹ 0",
        paidAmount: data.paidAmount ? `₹ ${parseInt(data.paidAmount).toLocaleString()}` : "₹ 0",
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
        status: "Open" as const,
        assignedTech: data.assignedTech || "Unassigned",
        notes: data.notes || `Converted from enquiry: ${lead.name}`,
        siteAddress: lead.address,
        billingAddress: lead.address,
        nextService: "Unassigned",
      };

      addWorkOrder(newWorkOrder);
      updateLead(lead.id, { status: "Converted" });

      toast.success(`Enquiry "${lead.name}" converted to Work Order ${newWorkOrder.id}!`);
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to convert enquiry");
    }
  };

  if (!isOpen || !lead) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold text-card-foreground">Convert Enquiry to Work Order</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Lead Summary */}
          <div className="bg-secondary/30 rounded-lg p-4 border border-border mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Lead Details</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-semibold text-card-foreground">{lead.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Services</p>
                <p className="text-sm font-semibold text-card-foreground">{lead.services.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-semibold text-card-foreground">{lead.address}</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Total Value (₹) *</label>
            <input
              type="number"
              {...register("totalValue")}
              placeholder="Enter total contract value"
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.totalValue && <p className="text-xs text-red-500 mt-1">{errors.totalValue.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount (₹)</label>
            <input
              type="number"
              {...register("paidAmount")}
              placeholder="Amount already paid (optional)"
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Assigned Technician</label>
            <input
              type="text"
              {...register("assignedTech")}
              placeholder="Technician name (optional)"
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
            <textarea
              rows={3}
              {...register("notes")}
              placeholder="Additional notes for the work order (optional)"
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none"
            />
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
              Convert Enquiry
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
