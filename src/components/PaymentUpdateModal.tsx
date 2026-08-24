import { createPortal } from "react-dom";
import { X, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/lib/toast";
import type { WorkOrder, PaymentRecord } from "@/store/projectsStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useTasksStore } from "@/store/tasksStore";
import { saveFile, generateFileId } from "@/utils/fileStorage";

const paymentSchema = z.object({
  paymentMethod: z.enum(["Cash", "UPI", "Check", "Bank Transfer"]),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  paidBy: z.string().min(1, "Paid by is required"),
  transactionId: z.string().optional(),
  serviceId: z.string().optional(),
  attachmentId: z.string().optional(),
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
  const [attachmentFiles, setAttachmentFiles] = useState<Array<{ name: string; id: string }>>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "Cash",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paidBy: "",
      transactionId: workOrder?.transactionId || "",
      serviceId: "",
      attachmentId: "",
    },
  });

  const services = workOrder ? getTasksByWorkOrder(workOrder.id) : [];

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        showToast.error(`${file.name}: File size must be less than 10MB`);
        continue;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const fileId = generateFileId(workOrder?.id || "payment", file.name);
          
          await saveFile(fileId, file.name, arrayBuffer, file.type);
          setAttachmentFiles(prev => [...prev, { name: file.name, id: fileId }]);
          showToast.success(`${file.name} attached successfully`);
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        showToast.error(`Failed to attach ${file.name}`);
      }
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachmentFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!workOrder) return;

    setIsSubmitting(true);
    try {
      const currentPaid = parseFloat(workOrder.paidAmount?.replace(/[₹,]/g, "") || "0");
      const newAmount = parseFloat(data.amount);
      const totalPaid = currentPaid + newAmount;

      // Create payment record
      const paymentRecord: PaymentRecord = {
        id: `payment_${workOrder.id}_${Date.now()}`,
        amount: newAmount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || undefined,
        serviceId: data.serviceId || undefined,
        attachmentIds: attachmentFiles.length > 0 ? attachmentFiles.map(f => f.id) : undefined,
        paidBy: data.paidBy,
        date: data.date,
        createdAt: new Date().toISOString(),
      };

      // Add to payment history
      const updatedPaymentHistory = [...(workOrder.paymentHistory || []), paymentRecord];

      updateWorkOrder(workOrder.id, {
        paidAmount: `₹ ${totalPaid.toLocaleString()}`,
        transactionId: data.transactionId || undefined,
        paymentHistory: updatedPaymentHistory,
      });

      showToast.success("Payment updated!");
      reset();
      setAttachmentFiles([]);
      onClose();
    } catch (error) {
      showToast.error("Failed to update payment");
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
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Attachments (Optional)</label>
            <div className="mb-2">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm border border-border cursor-pointer hover:bg-secondary/80 transition-colors text-card-foreground">
                <Upload className="w-4 h-4" />
                <span>Choose files (receipts, invoices, etc.)</span>
                <input
                  type="file"
                  onChange={handleAttachmentChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                />
              </label>
            </div>
            
            {/* Attached Files List */}
            {attachmentFiles.length > 0 && (
              <div className="space-y-2">
                {attachmentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm font-medium text-primary truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Service</label>

            <select
              {...register("serviceId")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            >
              <option value="">Select a service (optional)</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title} — {service.status}
                </option>
              ))}
            </select>
            {errors.serviceId && (
              <p className="text-xs text-red-500 mt-1">{errors.serviceId.message}</p>
            )}
          </div>

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
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Transaction ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. TXN-12345678 or UPI reference"
              {...register("transactionId")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground font-mono"
            />
            {errors.transactionId && (
              <p className="text-xs text-red-500 mt-1">{errors.transactionId.message}</p>
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
