import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { WorkOrder } from "@/store/projectsStore";

type Props = {
  open: boolean;
  workOrder?: WorkOrder;
  onClose: () => void;
};

export function WorkOrderDetailsModal({ open, workOrder, onClose }: Props) {
  if (!open || !workOrder) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Work Order Details</h3>
            <p className="text-xs text-muted-foreground mt-1">{workOrder.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Work Order ID</label>
              <p className="text-sm font-semibold text-primary">{workOrder.id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <p className="text-sm text-card-foreground">{workOrder.status}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer</label>
              <p className="text-sm text-card-foreground">{workOrder.customer}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone</label>
              <p className="text-sm text-card-foreground">{workOrder.phone}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
              <p className="text-sm text-card-foreground">{workOrder.email || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Address</label>
              <p className="text-sm text-card-foreground">{workOrder.address}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject</label>
              <p className="text-sm text-card-foreground">{workOrder.subject || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Type</label>
              <p className="text-sm text-card-foreground">{workOrder.serviceType || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
              <p className="text-sm text-card-foreground">{workOrder.frequency || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date</label>
              <p className="text-sm text-card-foreground">{workOrder.start}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date</label>
              <p className="text-sm text-card-foreground">{workOrder.end || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Total Value</label>
              <p className="text-sm text-card-foreground">{workOrder.totalValue}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount</label>
              <p className="text-sm text-card-foreground">{workOrder.paidAmount}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Assigned Tech</label>
              <p className="text-sm text-card-foreground">{workOrder.assignedTech}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Next Service</label>
              <p className="text-sm text-card-foreground">{workOrder.nextService}</p>
            </div>
            {workOrder.notes && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
                <p className="text-sm text-card-foreground whitespace-pre-wrap">{workOrder.notes}</p>
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
