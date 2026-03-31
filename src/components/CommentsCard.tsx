import { createPortal } from "react-dom";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";

type Comment = {
  id: string;
  date: string;
  text: string;
  createdAt: string;
};

type Props = {
  comments: Comment[];
  onDelete: (id: string) => void;
};

function ConfirmDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-card-foreground">Delete Comment</h3>
        <p className="text-sm text-muted-foreground">Are you sure you want to delete this comment? This action cannot be undone.</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="flex-1 h-10 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-all bg-destructive">Delete</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function CommentsCard({ comments, onDelete }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (comments.length === 0) return null;

  return (
    <>
      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments.length})
        </h3>
        <div className="space-y-3">
          {[...comments].sort((a, b) => a.date.localeCompare(b.date)).map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary mb-1">{r.date}{(r as any).time ? ` • ${(r as any).time}` : ""}</p>
                <p className="text-sm text-card-foreground">{r.text}</p>
              </div>
              <button
                onClick={() => setConfirmId(r.id)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {confirmId && (
        <ConfirmDeleteModal
          onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}
