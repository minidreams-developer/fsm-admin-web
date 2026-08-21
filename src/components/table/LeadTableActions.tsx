import { useState } from "react";
import { Bell, Edit2 } from "lucide-react";
import type { Lead } from "@/store/leadsStore";

interface LeadTableActionsProps {
  lead: Lead;
  onEdit: () => void;
  onSaveReminder: (
    leadId: number,
    date: string,
    text: string
  ) => void;
}

export function LeadTableActions({
  lead,
  onEdit,
  onSaveReminder,
}: LeadTableActionsProps) {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderText, setReminderText] = useState("");

  const saveReminder = () => {
    if (!reminderDate || !reminderText.trim()) return;

    onSaveReminder(
      lead.id,
      reminderDate,
      reminderText.trim()
    );

    setReminderDate("");
    setReminderText("");
    setShowReminder(false);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Edit */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
        title="Edit Lead"
      >
        <Edit2 className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Reminder */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowReminder(!showReminder);
          }}
          className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
          title="Add Reminder"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />

          {(lead.reminders?.length ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">
              {lead.reminders?.length}
            </span>
          )}
        </button>

        {showReminder && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-10 z-50 w-72 bg-card border border-border rounded-xl shadow-2xl p-4 space-y-2"
          >
            <p className="text-xs font-semibold text-card-foreground">
              Add Reminder
            </p>

            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <input
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              placeholder="Reminder text..."
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex gap-2">
              <button
                onClick={saveReminder}
                className="flex-1 h-8 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all"
                style={{
                  background:
                    "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)",
                }}
              >
                Save
              </button>

              <button
                onClick={() => setShowReminder(false)}
                className="flex-1 h-8 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}