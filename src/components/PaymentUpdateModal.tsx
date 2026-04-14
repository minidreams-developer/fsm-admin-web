import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { WorkOrder } from "@/store/projectsStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useEmployeesStore } from "@/store/employeesStore";

const paymentSchema = z.object({
  paymentMethod: z.enum(["Cash", "UPI", "Check", "Bank Transfer"]),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  paidBy: z.string().min(1, "Paid by is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

type Props = {
  open: boolean;
  workOrder?: WorkOrder;
  onClose: () => void;
};

export function PaymentUpdateModal({ open, workOrder, onClose }: Props) {
  const { updateWorkOrder } = useProjectsStore();
  const { employees } = useEmployeesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "Cash",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paidBy: "",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!workOrder) return;

    setIsSubmitting(true);
    try {
      const currentPaid = parseFloat(workOrder.paidAmount?.replace(/[₹,]/g, "") || "0");
      const newAmount = parseFloat(data.amount);
      const totalPaid = currentPaid + newAmount;

      updateWorkOrder(workOrder.id, {
        paidAmount: `₹ ${totalPaid.toLocaleString()}`,
      });

      toast.success("Payment updated successfully!");
      reset();
      onClose();
    } catch (error) {
      toast.error("Failed to update payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !workOrder) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Update Payment</h3>
            <p className="text-xs text-muted-foreground mt-1">{workOrder.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 min-h-0">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Payment Method</label>
            <select
              {...register("paymentMethod")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-xs text-red-500 mt-1">{errors.paymentMethod.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              {...register("amount")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Date</label>
            <input
              type="date"
              {...register("date")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Collected By</label>
            <select
              {...register("paidBy")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>{emp.name} — {emp.role}</option>
              ))}
            </select>
            {errors.paidBy && (
              <p className="text-xs text-red-500 mt-1">{errors.paidBy.message}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            {isSubmitting ? "Updating..." : "Update Payment"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
