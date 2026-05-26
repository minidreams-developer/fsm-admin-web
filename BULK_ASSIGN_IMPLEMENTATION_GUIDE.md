# Bulk Assign Implementation Guide

## Quick Start: Add Bulk Status Update Feature

This guide shows how to add bulk status update functionality to the existing LeadsPage.

### Step 1: Add State Variables

Add these to the LeadsPage component (after existing bulk transfer state):

```typescript
// Bulk status update state
const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
const [bulkStatus, setBulkStatus] = useState<LeadStatus>("New");
```

### Step 2: Add Handler Function

Add this function after `handleBulkTransfer`:

```typescript
const handleBulkStatusUpdate = () => {
  if (selectedLeadIds.size === 0) {
    toast.error("Please select at least one lead");
    return;
  }
  
  selectedLeadIds.forEach(id => {
    updateLead(id, { status: bulkStatus });
  });
  
  toast.success(
    `${selectedLeadIds.size} lead${selectedLeadIds.size === 1 ? "" : "s"} status updated to ${bulkStatus}`
  );
  
  setSelectedLeadIds(new Set());
  setShowBulkStatusUpdate(false);
  setBulkStatus("New");
};
```

### Step 3: Add Button to Selection Bar

Find the bulk transfer bar section and add this button after the "Bulk Transfer" button:

```typescript
{selectedLeadIds.size > 0 && (
  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/5 border-b border-primary/20">
    <span className="text-sm font-semibold text-primary">
      {selectedLeadIds.size} enquir{selectedLeadIds.size === 1 ? "y" : "ies"} selected
    </span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowBulkTransfer(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
      >
        <ArrowRightLeft className="w-4 h-4" />
        Bulk Transfer
      </button>
      
      {/* ADD THIS NEW BUTTON */}
      <button
        onClick={() => setShowBulkStatusUpdate(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
      >
        <CheckCircle className="w-4 h-4" />
        Bulk Status
      </button>
      
      <button
        onClick={() => setSelectedLeadIds(new Set())}
        className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Clear
      </button>
    </div>
  </div>
)}
```

### Step 4: Add Modal Component

Add this modal before the closing `</div>` of the return statement (after the Bulk Transfer Modal):

```typescript
{/* Bulk Status Update Modal */}
{showBulkStatusUpdate && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
    <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-card-foreground">Bulk Status Update</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedLeadIds.size} lead{selectedLeadIds.size === 1 ? "" : "s"} selected
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowBulkStatusUpdate(false)} 
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Selected Leads Preview */}
        <div className="bg-secondary/30 rounded-lg border border-border p-3 max-h-36 overflow-y-auto space-y-1">
          {filtered.filter(l => selectedLeadIds.has(l.id)).map(l => (
            <div key={l.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-card-foreground">{l.name}</span>
              <span className="text-muted-foreground">{formatLeadId(l.id)}</span>
            </div>
          ))}
        </div>
        
        {/* Status Selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Update Status To *
          </label>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as LeadStatus)}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        
        {/* Info Message */}
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
          <p className="text-xs text-warning font-medium">
            This will update the status for all {selectedLeadIds.size} selected lead{selectedLeadIds.size === 1 ? "" : "s"}.
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 p-6 border-t border-border">
        <button
          onClick={() => {
            setShowBulkStatusUpdate(false);
            setBulkStatus("New");
          }}
          className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleBulkStatusUpdate}
          className="flex-1 h-10 text-white text-sm font-semibold hover:opacity-90 transition-all rounded-lg shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          Update Status
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
```

### Step 5: Update Imports

Make sure `CheckCircle` is imported at the top:

```typescript
import { Plus, Search, Eye, EyeOff, X, Clock, CheckCircle2, Edit2, Users, TrendingUp, CheckCircle, XCircle, Bell, ArrowRightLeft } from "lucide-react";
```

---

## Advanced: Bulk Assign Multiple Fields

For a more powerful feature, create a reusable bulk assign modal:

### Create New Component: `BulkAssignModal.tsx`

```typescript
import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Lead, LeadStatus } from "@/store/leadsStore";

interface BulkAssignModalProps {
  isOpen: boolean;
  selectedLeads: Lead[];
  onClose: () => void;
  onAssign: (updates: Partial<Lead>) => void;
  statuses: LeadStatus[];
  employees: Array<{ id: string; name: string; role: string }>;
  branches: Array<{ id: string; name: string }>;
}

export const BulkAssignModal = ({
  isOpen,
  selectedLeads,
  onClose,
  onAssign,
  statuses,
  employees,
  branches,
}: BulkAssignModalProps) => {
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [assignedOwner, setAssignedOwner] = useState("");
  const [branch, setBranch] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<"" | "Low" | "Medium" | "High">("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");

  const handleAssign = () => {
    const updates: Partial<Lead> = {};
    
    if (status) updates.status = status as LeadStatus;
    if (assignedOwner) updates.assignedOwner = assignedOwner;
    if (branch) updates.branch = branch;
    if (urgencyLevel) updates.urgencyLevel = urgencyLevel;
    if (nextFollowUpDate) updates.nextFollowUpDate = nextFollowUpDate;

    if (Object.keys(updates).length === 0) {
      alert("Please select at least one field to update");
      return;
    }

    onAssign(updates);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-base font-bold text-card-foreground">Bulk Assign</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as LeadStatus)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            >
              <option value="">— No change —</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Assigned Owner */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Sales Executive</label>
            <select
              value={assignedOwner}
              onChange={e => setAssignedOwner(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            >
              <option value="">— No change —</option>
              {employees.map(e => (
                <option key={e.id} value={e.name}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch</label>
            <select
              value={branch}
              onChange={e => setBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            >
              <option value="">— No change —</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Urgency Level</label>
            <select
              value={urgencyLevel}
              onChange={e => setUrgencyLevel(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            >
              <option value="">— No change —</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Next Follow-up Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Next Follow-up Date</label>
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={e => setNextFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            />
          </div>

          {/* Summary */}
          <div className="bg-secondary/30 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground font-medium">
              Updating {selectedLeads.length} lead{selectedLeads.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border text-sm font-medium rounded-lg hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 h-10 text-white text-sm font-semibold rounded-lg hover:opacity-90"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
```

### Usage in LeadsPage

```typescript
const [showBulkAssign, setShowBulkAssign] = useState(false);

const handleBulkAssign = (updates: Partial<Lead>) => {
  selectedLeadIds.forEach(id => updateLead(id, updates));
  toast.success(`${selectedLeadIds.size} lead(s) updated`);
  setSelectedLeadIds(new Set());
};

// In JSX:
<BulkAssignModal
  isOpen={showBulkAssign}
  selectedLeads={filtered.filter(l => selectedLeadIds.has(l.id))}
  onClose={() => setShowBulkAssign(false)}
  onAssign={handleBulkAssign}
  statuses={statuses}
  employees={activeEmployees}
  branches={branchList}
/>
```

---

## Testing Checklist

- [ ] Select single lead and perform bulk operation
- [ ] Select multiple leads and perform bulk operation
- [ ] Select all leads on current page
- [ ] Verify selection persists across pagination
- [ ] Test with different filters applied
- [ ] Verify toast notifications appear
- [ ] Test modal cancel button
- [ ] Verify data updates in store
- [ ] Test with empty selection
- [ ] Verify UI updates after operation

---

## Performance Tips

1. **Use Set for selections** - Already implemented ✅
2. **Batch updates** - Consider debouncing if updating 1000+ leads
3. **Pagination** - Only show selected leads from current page in preview
4. **Memoization** - Consider useMemo for filtered leads

---

## Common Issues & Solutions

### Issue: Selection clears after operation
**Solution:** Ensure `setSelectedLeadIds(new Set())` is called after successful update

### Issue: Modal doesn't close
**Solution:** Check that `setShowBulkStatusUpdate(false)` is called in handler

### Issue: Toast doesn't show
**Solution:** Verify `toast` is imported from 'sonner'

### Issue: Styles don't match
**Solution:** Use exact gradient and shadow values from existing buttons

