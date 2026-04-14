import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useServicesStore, type ServiceAppointment } from "@/store/servicesStore";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: (service: ServiceAppointment) => void;
  appointment?: ServiceAppointment;
  mode?: "create" | "edit";
};

const employees = ["Safeeq", "Rajesh", "Arun"];

export function ServiceFormModal({ open, onClose, onSaved, appointment, mode = "create" }: Props) {
  const { addAppointment, updateAppointment, getNextAppointmentId } = useServicesStore();

  const [form, setForm] = useState<Partial<ServiceAppointment>>({
    subject: "",
    employeeName: "",
    date: "",
    time: "",
    refNo: "",
    warrantyPeriod: "",
    unitPrice: "",
    state: "",
    gst: "",
    igst: "",
    cgst: "",
    serviceDescription: "",
    workOrderId: "WO-NEW",
    instructions: "",
    tasks: [],
    status: "Scheduled",
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && appointment) {
      setForm({ ...appointment });
      return;
    }
    setForm({
      subject: "",
      employeeName: "",
      date: "",
      time: "",
      refNo: "",
      warrantyPeriod: "",
      unitPrice: "",
      state: "",
      gst: "",
      igst: "",
      cgst: "",
      serviceDescription: "",
      workOrderId: "WO-NEW",
      instructions: "",
      tasks: [],
      status: "Scheduled",
    });
  }, [open, mode, appointment]);

  const setField = <K extends keyof ServiceAppointment>(key: K, value: ServiceAppointment[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    if (!form.subject?.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!form.employeeName?.trim()) {
      toast.error("Employee name is required");
      return;
    }
    // if (!form.date) {
    //   toast.error("Date is required");
    //   return;
    // }
    if (!form.time) {
      toast.error("Time is required");
      return;
    }

    if (mode === "edit" && appointment) {
      updateAppointment(appointment.id, { ...form });
      toast.success("Service updated successfully!");
      onSaved?.({ ...appointment, ...form } as ServiceAppointment);
      onClose();
      return;
    }

    const newService: ServiceAppointment = {
      id: getNextAppointmentId(),
      workOrderId: form.workOrderId || "WO-NEW",
      date: form.date,
      time: form.time,
      employeeId: form.employeeName,
      employeeName: form.employeeName,
      subject: form.subject.trim(),
      refNo: form.refNo || "",
      warrantyPeriod: form.warrantyPeriod || "",
      unitPrice: form.unitPrice || "",
      state: form.state || "",
      gst: form.gst || "",
      igst: form.igst || "",
      cgst: form.cgst || "",
      serviceDescription: form.serviceDescription || "",
      instructions: form.instructions || "",
      tasks: form.tasks || [],
      status: form.status || "Scheduled",
    };

    addAppointment(newService);
    toast.success("Service added successfully!");
    onSaved?.(newService);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">{mode === "edit" ? "Edit Service" : "Add New Service"}</h3>
            <p className="text-xs text-muted-foreground mt-1">{mode === "edit" ? "Update service appointment" : "Create a new service appointment"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject *</label>
              <input
                type="text"
                value={form.subject || ""}
                onChange={(e) => setField("subject", e.target.value)}
                placeholder="Service subject"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Employee *</label>
              <select
                value={form.employeeName || ""}
                onChange={(e) => setField("employeeName", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <select
                value={form.status || "Scheduled"}
                onChange={(e) => setField("status", e.target.value as ServiceAppointment["status"])}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            {/* <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Date *</label>
              <input
                type="date"
                value={form.date || ""}
                onChange={(e) => setField("date", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div> */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Time *</label>
              <input
                type="time"
                value={form.time || ""}
                onChange={(e) => setField("time", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Reference No</label>
              <input
                type="text"
                value={form.refNo || ""}
                onChange={(e) => setField("refNo", e.target.value)}
                placeholder="REF-1001"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Warranty Period</label>
              <input
                type="text"
                value={form.warrantyPeriod || ""}
                onChange={(e) => setField("warrantyPeriod", e.target.value)}
                placeholder="3 Months"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Unit Price (₹)</label>
              <input
                type="number"
                value={form.unitPrice || ""}
                onChange={(e) => setField("unitPrice", e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">State</label>
              <select
                value={form.state || ""}
                onChange={(e) => setField("state", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              >
                <option value="">Select State</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">GST (%)</label>
              <input
                type="number"
                value={form.gst || ""}
                onChange={(e) => setField("gst", e.target.value)}
                placeholder="e.g. 18"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>

            {form.state !== "Tamil Nadu" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">IGST (%)</label>
                  <input
                    type="number"
                    value={form.igst || ""}
                    onChange={(e) => setField("igst", e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">CGST (%)</label>
                  <input
                    type="number"
                    value={form.cgst || ""}
                    onChange={(e) => setField("cgst", e.target.value)}
                    placeholder="e.g. 9"
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                  />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Description</label>
              <textarea
                value={form.serviceDescription || ""}
                onChange={(e) => setField("serviceDescription", e.target.value)}
                placeholder="Describe the service..."
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
            Add Service
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
