import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: (workOrder: WorkOrder) => void;
};

const statuses = ["Open", "Scheduled", "Completed"];

export function WorkOrderFormModal({ open, onClose, onSaved }: Props) {
  const { addWorkOrder, getNextWorkOrderId } = useProjectsStore();

  const [form, setForm] = useState<Partial<WorkOrder>>({
    customer: "",
    address: "",
    phone: "",
    email: "",
    subject: "",
    serviceType: "",
    frequency: "",
    totalValue: "",
    paidAmount: "",
    start: "",
    end: "",
    status: "Open",
    assignedTech: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      customer: "",
      address: "",
      phone: "",
      email: "",
      subject: "",
      serviceType: "",
      frequency: "",
      totalValue: "",
      paidAmount: "",
      start: "",
      end: "",
      status: "Open",
      assignedTech: "",
      notes: "",
    });
  }, [open]);

  const setField = <K extends keyof WorkOrder>(key: K, value: WorkOrder[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    if (!form.customer?.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!form.address?.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!form.phone?.trim()) {
      toast.error("Phone is required");
      return;
    }
    if (!form.subject?.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!form.start) {
      toast.error("Start date is required");
      return;
    }

    const newWorkOrder: WorkOrder = {
      id: getNextWorkOrderId(),
      customer: form.customer.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email || "",
      subject: form.subject.trim(),
      serviceType: form.serviceType || "",
      frequency: form.frequency || "",
      totalValue: form.totalValue || "₹ 0",
      paidAmount: form.paidAmount || "₹ 0",
      start: form.start,
      end: form.end || form.start,
      status: (form.status as any) || "Open",
      assignedTech: form.assignedTech || "Unassigned",
      notes: form.notes || "",
      siteAddress: form.address,
      billingAddress: form.address,
      nextService: "Unassigned",
    };

    addWorkOrder(newWorkOrder);
    toast.success("Work order added successfully!");
    onSaved?.(newWorkOrder);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Add New Work Order</h3>
            <p className="text-xs text-muted-foreground mt-1">Create a new work order</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer *</label>
              <input
                type="text"
                value={form.customer || ""}
                onChange={(e) => setField("customer", e.target.value)}
                placeholder="Customer name"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone *</label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="customer@email.com"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Address *</label>
              <input
                type="text"
                value={form.address || ""}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Site address"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject *</label>
              <input
                type="text"
                value={form.subject || ""}
                onChange={(e) => setField("subject", e.target.value)}
                placeholder="Work order subject"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Type</label>
              <input
                type="text"
                value={form.serviceType || ""}
                onChange={(e) => setField("serviceType", e.target.value)}
                placeholder="e.g., Pest Control"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
              <input
                type="text"
                value={form.frequency || ""}
                onChange={(e) => setField("frequency", e.target.value)}
                placeholder="e.g., Monthly"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date *</label>
              <input
                type="date"
                value={form.start || ""}
                onChange={(e) => setField("start", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date</label>
              <input
                type="date"
                value={form.end || ""}
                onChange={(e) => setField("end", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Total Value</label>
              <input
                type="text"
                value={form.totalValue || ""}
                onChange={(e) => setField("totalValue", e.target.value)}
                placeholder="₹ 0"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount</label>
              <input
                type="text"
                value={form.paidAmount || ""}
                onChange={(e) => setField("paidAmount", e.target.value)}
                placeholder="₹ 0"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <select
                value={form.status || "Open"}
                onChange={(e) => setField("status", e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Work Order Incharge</label>
              <input
                type="text"
                value={form.assignedTech || ""}
                onChange={(e) => setField("assignedTech", e.target.value)}
                placeholder="Technician name"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 h-10 text-white rounded-lg hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all font-semibold text-sm"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            Add Work Order
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
