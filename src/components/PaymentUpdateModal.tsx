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
import { useTasksStore } from "@/store/tasksStore";

function ServiceMultiSelect({ options, selected, onChange }: { options: Array<{ id: string; title: string }>; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
        <span className={selected.length === 0 ? "text-muted-foreground" : "text-primary font-semibold"}>
          {selected.length === 0 ? "Select services (optional)" : `✓ ${selected.length} service${selected.length !== 1 ? 's' : ''} selected`}
        </span>
        <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
          {options.map(service => (
            <label key={service.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-secondary cursor-pointer text-sm text-card-foreground">
              <input type="checkbox" checked={selected.includes(service.id)} onChange={() => toggle(service.id)} className="accent-primary" />
              <span className="flex-1">{service.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const paymentSchema = z.object({
  paymentMethod: z.enum(["Cash", "UPI", "Check", "Bank Transfer"]),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  paidBy: z.string().min(1, "Paid by is required"),
  transactionId: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
  serviceTransactionIds: z.record(z.string()).optional(),
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
  const { getTasksByWorkOrder } = useTasksStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceTransactionIds, setServiceTransactionIds] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "Cash",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paidBy: "",
      transactionId: workOrder?.transactionId || "",
      serviceIds: [],
      serviceTransactionIds: {},
    },
  });

  const selectedServiceIds = watch("serviceIds") || [];
  const services = workOrder ? getTasksByWorkOrder(workOrder.id) : [];

  const onSubmit = async (data: PaymentFormData) => {
    if (!workOrder) return;

    setIsSubmitting(true);
    try {
      const currentPaid = parseFloat(workOrder.paidAmount?.replace(/[₹,]/g, "") || "0");
      const newAmount = parseFloat(data.amount);
      const totalPaid = currentPaid + newAmount;

      updateWorkOrder(workOrder.id, {
        paidAmount: `₹ ${totalPaid.toLocaleString()}`,
        transactionId: data.transactionId || undefined,
        serviceTransactionIds: Object.keys(serviceTransactionIds).length > 0 ? serviceTransactionIds : undefined,
      });

      toast.success(`Payment updated! ${selectedServiceIds.length > 0 ? `${selectedServiceIds.length} service${selectedServiceIds.length !== 1 ? 's' : ''} linked` : ''}`);
      reset();
      setServiceTransactionIds({});
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
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Services</label>
            <ServiceMultiSelect
              options={services.map(s => ({ id: s.id, title: `${s.title} — ${s.status}` }))}
              selected={selectedServiceIds}
              onChange={(ids) => setValue("serviceIds", ids)}
            />
            {selectedServiceIds.length > 0 && (
              <div className="mt-2 p-2.5 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs text-primary font-semibold">✓ {selectedServiceIds.length} service{selectedServiceIds.length !== 1 ? 's' : ''} selected</p>
              </div>
            )}
          </div>

          {/* Individual Transaction ID Fields for Each Selected Service */}
          {selectedServiceIds.length > 0 && (
            <div className="bg-primary/5 rounded-lg border border-primary/20 p-4 space-y-3">
              <p className="text-sm font-semibold text-primary">Transaction IDs for Selected Services</p>
              <div className="space-y-3">
                {selectedServiceIds.map((serviceId) => {
                  const service = services.find(s => s.id === serviceId);
                  return (
                    <div key={serviceId} className="bg-card border border-border rounded-lg p-3 space-y-1.5">
                      <label className="text-xs font-semibold text-card-foreground block">
                        📦 {service?.title}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter transaction ID for ${service?.title}`}
                        value={serviceTransactionIds[serviceId] || ""}
                        onChange={(e) => {
                          setServiceTransactionIds({
                            ...serviceTransactionIds,
                            [serviceId]: e.target.value,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground font-mono"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Overall Transaction ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. TXN-12345678 or UPI reference (optional)"
              {...register("transactionId")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground font-mono"
            />
            {errors.transactionId && (
              <p className="text-xs text-red-500 mt-1">{errors.transactionId.message}</p>
            )}
          </div> */}

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
