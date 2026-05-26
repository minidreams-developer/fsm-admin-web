import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Edit2, FolderKanban, Bell, ChevronDown, FileText, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useLeadsStore } from "@/store/leadsStore";
import { StatusBadge } from "@/components/StatusBadge";
import { LeadDetailsModal } from "@/components/LeadDetailsModal";
import { CommentsCard } from "@/components/CommentsCard";
import { TimeInput12Hour } from "@/components/TimeInput12Hour";

function formatLeadId(id: number) {
  return `LEAD-${String(id).padStart(4, "0")}`;
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
  const [showActions, setShowActions] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [commentText, setCommentText] = useState("");

  const handleAcknowledge = () => {
    if (lead) {
      updateLead(lead.id, { isViewed: true });
      toast.success("Lead acknowledged");
    }
  };

  if (!lead) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/leads")} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-lg font-bold text-card-foreground">Leads not found</h2>
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

  const saveComment = () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    const newComment = { id: `CMT-${Date.now()}`, text: commentText.trim(), createdAt: new Date().toISOString() };
    updateLead(lead.id, { comments: [...(lead.comments ?? []), newComment] });
    setCommentText("");
    toast.success("Comment saved");
  };

  const deleteReminder = (remId: string) => {
    updateLead(lead.id, { reminders: (lead.reminders ?? []).filter((r) => r.id !== remId) });
  };

  const fields: [string, string][] = [
    ["Leads ID", formatLeadId(lead.id)],
    ["Customer Name", lead.name],
    ["Phone", lead.phone],
    ["Address", lead.address],
    ["Urgency Level", lead.urgencyLevel],
    ["Amount", typeof lead.amount === "number" ? `₹ ${lead.amount.toLocaleString()}` : "—"],
    ["Leads Source", lead.leadSource || "—"],
    ["Branch", lead.branch || "—"],
    ["Leads Incharge", lead.leadIncharge || "—"],
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
          {/* Sales Executive Info */}
          {!lead.isViewed && (lead.salesExecutive || lead.assignedOwner) && (
            <div className="">
              <span className="text-sm font-bold text-primary">Sales Executive : </span>
              <span className="text-sm font-bold text-primary">{lead.salesExecutive || lead.assignedOwner}</span>
            </div>
          )}
          {/* Acknowledge Button */}
          {!lead.isViewed && (
            <button
              onClick={handleAcknowledge}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              Accept
            </button>
          )}
          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(v => !v)}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              Actions
              <ChevronDown className={`w-4 h-4 transition-transform ${showActions ? "rotate-180" : ""}`} />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-12 z-20 w-56 bg-card border border-border rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { setShowActions(false); setShowReminders(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Add Reminder
                    {(lead.reminders?.length ?? 0) > 0 && (
                      <span className="ml-auto w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">{lead.reminders?.length}</span>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowActions(false); setShowComment(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    Add Comment
                  </button>
                  <div className="h-px bg-border mx-2 my-1" />
                  <button
                    onClick={() => { setShowActions(false); setShowEdit(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                    Edit Leads
                  </button>
                  {lead.status !== "Converted" && lead.status !== "Lost" && (
                    <>
                      <button
                        onClick={() => { setShowActions(false); navigate("/create-work-order", { state: { leadData: lead, isQuotation: true } }); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Convert to Quotation
                      </button>
                      <button
                        onClick={() => { setShowActions(false); navigate("/create-work-order", { state: { leadData: lead } }); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
                      >
                        <FolderKanban className="w-4 h-4 text-muted-foreground" />
                        Convert to Work Order
                      </button>
                    </>
                  )}
                  {lead.status === "Converted" && (
                    <div className="px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-success">
                      <CheckCircle className="w-4 h-4" /> Converted
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

          {showReminders && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
              <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-bold text-card-foreground">Add Reminder</h3>
                  <button onClick={() => setShowReminders(false)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Date *</label>
                    <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Time (Optional)</label>
                    <TimeInput12Hour value={reminderTime} onChange={(e) => setReminderTime(e)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Reminder Text *</label>
                    <textarea value={reminderText} onChange={(e) => setReminderText(e.target.value)} placeholder="Enter reminder details..." rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                  </div>
                </div>
                <div className="p-6 border-t border-border flex gap-3">
                  <button onClick={() => setShowReminders(false)} className="flex-1 h-10 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => { saveReminder(); setShowReminders(false); }}
                    className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white rounded-lg transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                    style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                  >
                    Save Reminder
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Comment modal */}
          {showComment && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
              <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-bold text-card-foreground">Add Comment</h3>
                  <button onClick={() => { setShowComment(false); setCommentText(""); }} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-6">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Comment *</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter your comment..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <div className="p-6 border-t border-border flex gap-3">
                  <button onClick={() => { setShowComment(false); setCommentText(""); }} className="flex-1 h-10 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => { saveComment(); setShowComment(false); }}
                    className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white rounded-lg transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                    style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                  >
                    Save Comment
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

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
        comments={lead.comments ?? []}
        onDelete={(id) => updateLead(lead.id, { comments: (lead.comments ?? []).filter((c) => c.id !== id) })}
      />

      <LeadDetailsModal open={showEdit} lead={lead} initialEdit onClose={() => setShowEdit(false)} />
    </div>
  );
};

export default LeadDetailPage;
