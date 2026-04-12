import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLeadsStore, type Lead, type LeadStatus, type UrgencyLevel } from "@/store/leadsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useProductsStore } from "@/store/productsStore";

type Props = {
  open: boolean;
  lead?: Lead;
  onClose: () => void;
  initialEdit?: boolean;
};

function formatLeadId(id: number) {
  return `ENQ-${String(id).padStart(4, "0")}`;
}

const urgencyLevels: UrgencyLevel[] = ["Low", "Medium", "High"];
const statuses: LeadStatus[] = ["New", "Contacted", "Quote Sent", "Follow Up", "Converted", "Lost"];
const leadSources = ["Website", "Call", "Referral", "Walk-in", "Google", "Facebook/Instagram", "Other"];
const branches = ["Kochi", "Calicut", "Thrissur", "Trivandrum", "Palakkad", "Munnar", "Other"];

export function LeadDetailsModal({ open, lead, onClose, initialEdit = false }: Props) {
  const { updateLead } = useLeadsStore();
  const { employees } = useEmployeesStore();
  const { products } = useProductsStore();
  const serviceOptions = products.filter((p) => p.category === "Services" && p.status === "Active").map((p) => p.name);

  const [isEditing, setIsEditing] = useState(initialEdit);
  const [activeTab, setActiveTab] = useState<"details" | "reminders">("details");
  const [form, setForm] = useState<Partial<Lead>>({});
  const [reminderDate, setReminderDate] = useState("");
  const [reminderText, setReminderText] = useState("");

  useEffect(() => {
    if (lead) setForm({ ...lead });
    setIsEditing(initialEdit);
    setActiveTab("details");
  }, [lead, open, initialEdit]);

  if (!open || !lead) return null;

  const setField = <K extends keyof Lead>(key: K, value: Lead[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const removeService = (idx: number) =>
    setForm((prev) => ({ ...prev, services: (prev.services ?? []).filter((_, i) => i !== idx) }));

  const saveReminder = () => {
    if (!reminderDate || !reminderText.trim()) {
      toast.error("Please select a date and enter reminder text");
      return;
    }
    const newReminder = { id: `REM-${Date.now()}`, date: reminderDate, text: reminderText.trim(), createdAt: new Date().toISOString() };
    updateLead(lead.id, { reminders: [...(lead.reminders ?? []), newReminder] });
    setReminderDate("");
    setReminderText("");
    toast.success("Reminder saved");
  };

  const deleteReminder = (id: string) => {
    updateLead(lead.id, { reminders: (lead.reminders ?? []).filter((r) => r.id !== id) });
  };

  const save = () => {
    if (!form.name?.trim() || !form.phone?.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    updateLead(lead.id, form);
    toast.success("Enquiry updated");
    setIsEditing(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">{isEditing ? "Edit Enquiry" : "Enquiry Details"}</h3>
            <p className="text-xs text-muted-foreground mt-1">{lead.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs (view mode only) */}
        {!isEditing && (
          <div className="flex border-b border-border flex-shrink-0">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "details" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("reminders")}
              className={`px-6 py-3 text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === "reminders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Reminders
              {(lead.reminders?.length ?? 0) > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px]">{lead.reminders?.length}</span>
              )}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 min-h-0">

          {/* Reminders tab */}
          {!isEditing && activeTab === "reminders" && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-xl p-4 border border-border space-y-3">
                <h4 className="text-sm font-semibold text-card-foreground">Add Reminder</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Reminder Date</label>
                    <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Reminder Text</label>
                    <input value={reminderText} onChange={(e) => setReminderText(e.target.value)} placeholder="e.g. Follow up call" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <button onClick={saveReminder} className="h-9 px-5 text-sm font-semibold hover:opacity-90 text-white rounded-lg shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
                  Save Reminder
                </button>
              </div>
              {(lead.reminders ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No reminders yet.</p>
              ) : (
                <div className="space-y-2">
                  {[...(lead.reminders ?? [])].sort((a, b) => a.date.localeCompare(b.date)).map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-3 p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-primary mb-1">{r.date}</p>
                        <p className="text-sm text-card-foreground">{r.text}</p>
                      </div>
                      <button onClick={() => deleteReminder(r.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details view */}
          {!isEditing && activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                ["Enquiry ID", formatLeadId(lead.id)],
                ["Customer Name", lead.name],
                ["Phone", lead.phone],
                ["Address", lead.address],
                ["Status", lead.status],
                ["Urgency Level", lead.urgencyLevel],
                ["Amount", typeof lead.amount === "number" ? `₹ ${lead.amount.toLocaleString()}` : "—"],
                ["Enquiry Source", lead.leadSource || "—"],
                ["Branch", lead.branch || "—"],
                ["Lead Incharge", lead.leadIncharge || "—"],
                ["Next Follow Up Date", lead.nextFollowUpDate || "—"],
                ["Date", lead.date],
                ["Quote Amount", typeof lead.quoteAmount === "number" ? `₹ ${lead.quoteAmount.toLocaleString()}` : "—"],
                ["Quote Contract", lead.quoteContract || "—"],
                ["Quote Viewed", lead.quoteIsViewed ? `Yes — ${lead.quoteViewedAt ?? ""}` : "No"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                  <p className="text-sm text-card-foreground">{value}</p>
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Services</label>
                <div className="flex flex-wrap gap-2">
                  {lead.services.map((s, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
              {lead.notes && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
              {lead.quoteNotes && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Quote Notes</label>
                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{lead.quoteNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Edit form */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Name *</label>
                <input value={form.name ?? ""} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Arun Sharma" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone *</label>
                <input value={form.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} placeholder="e.g. 9876543210" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address *</label>
                <input value={form.address ?? ""} onChange={(e) => setField("address", e.target.value)} placeholder="e.g. 12 MG Road, Kochi" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <select value={form.status ?? "New"} onChange={(e) => setField("status", e.target.value as LeadStatus)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Urgency Level</label>
                <select value={form.urgencyLevel ?? "Medium"} onChange={(e) => setField("urgencyLevel", e.target.value as UrgencyLevel)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {urgencyLevels.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount</label>
                <input type="number" value={form.amount ?? ""} onChange={(e) => setField("amount", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 5000" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Enquiry Source</label>
                <select value={form.leadSource ?? ""} onChange={(e) => setField("leadSource", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select source</option>
                  {leadSources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch</label>
                <select value={form.branch ?? ""} onChange={(e) => setField("branch", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select branch</option>
                  {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Enquiry Incharge</label>
                <select value={form.leadIncharge ?? ""} onChange={(e) => setField("leadIncharge", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Unassigned</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.name}>{emp.name} — {emp.role}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Next Follow Up Date</label>
                <input type="date" value={form.nextFollowUpDate ?? ""} onChange={(e) => setField("nextFollowUpDate", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Next Follow Up Time</label>
                <input type="time" value={(form as any).nextFollowUpTime ?? ""} onChange={(e) => setField("nextFollowUpTime" as any, e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Services (select from list)</label>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    setForm((prev) => ({
                      ...prev,
                      services: (prev.services ?? []).includes(val) ? prev.services ?? [] : [...(prev.services ?? []), val],
                    }));
                    e.target.value = "";
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
                  defaultValue=""
                >
                  <option value="" disabled>Select a service...</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s} disabled={(form.services ?? []).includes(s)}>{s}{(form.services ?? []).includes(s) ? " ✓" : ""}</option>
                  ))}
                </select>
                {(form.services ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(form.services ?? []).map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                        <span className="text-xs font-medium text-primary">{s}</span>
                        <button onClick={() => removeService(i)} className="text-primary hover:text-primary/70"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea value={form.notes ?? ""} onChange={(e) => setField("notes", e.target.value)} rows={3} placeholder="Additional notes..." className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          {!isEditing ? (
            <>
              <button onClick={onClose} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Close</button>
              <button onClick={() => setIsEditing(true)} className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Edit</button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
              <button onClick={save} className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Save Changes</button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
