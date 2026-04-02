import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Edit2, FolderKanban } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useLeadsStore } from "@/store/leadsStore";
import { StatusBadge } from "@/components/StatusBadge";
import { LeadDetailsModal } from "@/components/LeadDetailsModal";
import { CommentsCard } from "@/components/CommentsCard";

function formatLeadId(id: number) {
  return `ENQ-${String(id).padStart(4, "0")}`;
}

const statusBadge: Record<string, "info" | "warning" | "success" | "error" | "neutral"> = {
  New: "info", Contacted: "warning", "Quote Sent": "warning", Converted: "success", Lost: "error",
};

export const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead } = useLeadsStore();
  const lead = leads.find((l) => String(l.id) === id) ?? null;

  const [showEdit, setShowEdit] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderText, setReminderText] = useState("");
  const bellRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setShowReminders(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!lead) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/leads")} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-lg font-bold text-card-foreground">Enquiry not found</h2>
        </div>
      </div>
    );
  }

  const saveReminder = () => {
    if (!reminderDate || !reminderText.trim()) {
      toast.error("Please select a date and enter reminder text");
      return;
    }
    const newReminder = { id: `REM-${Date.now()}`, date: reminderDate, time: reminderTime, text: reminderText.trim(), createdAt: new Date().toISOString() };
    updateLead(lead.id, { reminders: [...(lead.reminders ?? []), newReminder] });
    setReminderDate("");
    setReminderTime("");
    setReminderText("");
    toast.success("Comment saved");
  };

  const deleteReminder = (remId: string) => {
    updateLead(lead.id, { reminders: (lead.reminders ?? []).filter((r) => r.id !== remId) });
  };

  const fields: [string, string][] = [
    ["Enquiry ID", formatLeadId(lead.id)],
    ["Customer Name", lead.name],
    ["Phone", lead.phone],
    ["Address", lead.address],
    ["Urgency Level", lead.urgencyLevel],
    ["Amount", typeof lead.amount === "number" ? `₹ ${lead.amount.toLocaleString()}` : "—"],
    ["Enquiry Source", lead.leadSource || "—"],
    ["Branch", lead.branch || "—"],
    ["Enquiry Incharge", lead.leadIncharge || "—"],
    ["Next Follow Up Date", lead.nextFollowUpDate || "—"],
    ["Date", lead.date],
    ["Quote Amount", typeof lead.quoteAmount === "number" ? `₹ ${lead.quoteAmount.toLocaleString()}` : "—"],
    ["Quote Contract", lead.quoteContract || "—"],
    ["Quote Viewed", lead.quoteIsViewed ? `Yes — ${lead.quoteViewedAt ?? ""}` : "No"],
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate("/leads")} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{lead.name}</h2>
          <p className="text-sm text-muted-foreground">{formatLeadId(lead.id)}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bell / Reminders */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setShowReminders((v) => !v)}
              className="relative inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
              title="Comments"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
              Comment
              {(lead.reminders?.length ?? 0) > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">{lead.reminders?.length}</span>
              )}            </button>

            {showReminders && (
              <div ref={popoverRef} className="absolute right-0 top-12 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl">
                <div className="p-4 border-b border-border">
                  <h4 className="text-sm font-semibold text-card-foreground">Add Comment</h4>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <input value={reminderText} onChange={(e) => setReminderText(e.target.value)} placeholder="Comment text..." className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <button onClick={saveReminder} className="w-full h-9 text-sm font-semibold hover:opacity-90 text-white rounded-lg shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
                    Save Comment
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowEdit(true)} className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => navigate("/create-work-order", { state: { leadData: lead, isQuotation: true } })}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            Convert to Quotation
          </button>
          {lead.status !== "Converted" && lead.status !== "Lost" && (
            <button
              onClick={() => navigate("/create-work-order", { state: { leadData: lead } })}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(148,43,244,0.3)]"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              <FolderKanban className="w-4 h-4" /> Convert to Work Order
            </button>
          )}
          {lead.status === "Converted" && (
            <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-semibold text-success bg-success/10 border border-success/20">
              ✓ Converted
            </span>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        {/* Avatar + status */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-primary">{lead.name[0]}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-card-foreground">{lead.name}</h1>
              <p className="text-lg text-muted-foreground mt-1">{lead.phone}</p>
              <div className="mt-2">
                <StatusBadge label={lead.status} variant={statusBadge[lead.status] ?? "neutral"} />
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fields.map(([label, value]) => (
            <div key={label} className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold text-card-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Services */}
        {lead.services.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Services</p>
            <div className="flex flex-wrap gap-2">
              {lead.services.map((s, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {lead.notes && (
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-card-foreground whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>

      <CommentsCard
        comments={lead.reminders ?? []}
        onDelete={(remId) => updateLead(lead.id, { reminders: (lead.reminders ?? []).filter((r) => r.id !== remId) })}
      />

      <LeadDetailsModal open={showEdit} lead={lead} initialEdit onClose={() => setShowEdit(false)} />
    </div>
  );
};

export default LeadDetailPage;
