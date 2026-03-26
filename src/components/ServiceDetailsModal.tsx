import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ServiceAppointment } from "@/store/servicesStore";

type Props = {
  open: boolean;
  service?: ServiceAppointment;
  onClose: () => void;
};

export function ServiceDetailsModal({ open, service, onClose }: Props) {
  if (!open || !service) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Service Details</h3>
            <p className="text-xs text-muted-foreground mt-1">{service.subject}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Reference No</label>
              <p className="text-sm font-semibold text-primary">{service.refNo || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject</label>
              <p className="text-sm text-card-foreground">{service.subject || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Employee</label>
              <p className="text-sm text-card-foreground">{service.employeeName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <p className="text-sm text-card-foreground">{service.status}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Date</label>
              <p className="text-sm text-card-foreground">{service.date}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Time</label>
              <p className="text-sm text-card-foreground">{service.time}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Warranty Period</label>
              <p className="text-sm text-card-foreground">{service.warrantyPeriod || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Work Order ID</label>
              <p className="text-sm text-card-foreground">{service.workOrderId}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Description</label>
              <p className="text-sm text-card-foreground whitespace-pre-wrap">{service.serviceDescription || "—"}</p>
            </div>
            {service.instructions && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Instructions</label>
                <p className="text-sm text-card-foreground whitespace-pre-wrap">{service.instructions}</p>
              </div>
            )}
            {service.tasks && service.tasks.length > 0 && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Tasks</label>
                <div className="space-y-2">
                  {service.tasks.map((task, idx) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{task.title}</p>
                        {task.completed && (
                          <p className="text-xs text-success">✓ Completed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
