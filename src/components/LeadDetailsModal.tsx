import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Lead } from "@/store/leadsStore";

type Props = {
  open: boolean;
  lead?: Lead;
  onClose: () => void;
};

function formatLeadId(id: number) {
  return `LEAD-${String(id).padStart(4, "0")}`;
}

export function LeadDetailsModal({ open, lead, onClose }: Props) {
  if (!open || !lead) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Lead Details</h3>
            <p className="text-xs text-muted-foreground mt-1">{lead.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Lead ID</label>
              <p className="text-sm font-semibold text-primary">{formatLeadId(lead.id)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name</label>
              <p className="text-sm text-card-foreground">{lead.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone</label>
              <p className="text-sm text-card-foreground">{lead.phone}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Address</label>
              <p className="text-sm text-card-foreground">{lead.address}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <p className="text-sm text-card-foreground">{lead.status}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Urgency Level</label>
              <p className="text-sm text-card-foreground">{lead.urgencyLevel}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Expected Date & Time</label>
              <p className="text-sm text-card-foreground">{lead.expectedDateTime ? new Date(lead.expectedDateTime).toLocaleString() : "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Lead Source</label>
              <p className="text-sm text-card-foreground">{lead.leadSource || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch</label>
              <p className="text-sm text-card-foreground">{lead.branch || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Sales Executive</label>
              <p className="text-sm text-card-foreground">{lead.salesExecutive || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Amount</label>
              <p className="text-sm font-semibold text-primary">{typeof lead.amount === "number" ? `₹ ${lead.amount.toLocaleString()}` : "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Date</label>
              <p className="text-sm text-card-foreground">{lead.date}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Services</label>
              <div className="flex flex-wrap gap-2">
                {lead.services.map((service, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                    {service}
                  </span>
                ))}
              </div>
            </div>
            {lead.notes && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
                <p className="text-sm text-card-foreground whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
