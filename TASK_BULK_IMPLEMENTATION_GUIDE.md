# Task Management - Bulk Assign Implementation Guide

## Quick Start: Add Bulk Assign to TaskManagementPage

This guide shows how to add bulk assignment functionality to the Task Management page.

---

## Step 1: Add State Variables

Add these after the existing state declarations in `TaskManagementPage`:

```typescript
// Multi-select state
const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

// Bulk operations state
const [showBulkAssign, setShowBulkAssign] = useState(false);
const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);

// Bulk data
const [bulkAssignData, setBulkAssignData] = useState({
  assignedEmployees: [] as string[],
  branch: "",
});
const [bulkStatus, setBulkStatus] = useState<TaskStatus>("Pending");
```

---

## Step 2: Add Handler Functions

Add these functions after the existing handlers:

```typescript
// Toggle individual task selection
const toggleSelectTask = (id: string, e: React.MouseEvent) => {
  e.stopPropagation();
  setSelectedTaskIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};

// Toggle select all on current page
const toggleSelectAll = () => {
  if (selectedTaskIds.size === paginated.length) {
    setSelectedTaskIds(new Set());
  } else {
    setSelectedTaskIds(new Set(paginated.map(t => t.id)));
  }
};

// Get selected tasks
const getSelectedTasks = () => {
  return paginated.filter(t => selectedTaskIds.has(t.id));
};

// Bulk assign handler
const handleBulkAssign = () => {
  if (bulkAssignData.assignedEmployees.length === 0) {
    toast.error("Select at least one employee");
    return;
  }

  selectedTaskIds.forEach(id => {
    updateTask(id, {
      assignedEmployees: bulkAssignData.assignedEmployees,
      assignedTo: bulkAssignData.assignedEmployees[0],
      branch: bulkAssignData.branch || undefined,
    });
  });

  toast.success(`${selectedTaskIds.size} task${selectedTaskIds.size === 1 ? "" : "s"} assigned`);
  setSelectedTaskIds(new Set());
  setShowBulkAssign(false);
  setBulkAssignData({ assignedEmployees: [], branch: "" });
};

// Bulk status update handler
const handleBulkStatusUpdate = () => {
  selectedTaskIds.forEach(id => {
    updateTask(id, { status: bulkStatus });
  });

  toast.success(`${selectedTaskIds.size} task${selectedTaskIds.size === 1 ? "" : "s"} status updated to ${bulkStatus}`);
  setSelectedTaskIds(new Set());
  setShowBulkStatusUpdate(false);
  setBulkStatus("Pending");
};
```

---

## Step 3: Update Table Header

Replace the table header with this version that includes checkbox:

```typescript
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-border">
      <th className="px-3 py-2.5 w-10">
        <input
          type="checkbox"
          checked={paginated.length > 0 && selectedTaskIds.size === paginated.length}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
        />
      </th>
      {["Task ID", "Title", "Assigned Employees", "Start Date", "End Date", "Status", "Actions"].map(h => (
        <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {paginated.length === 0 ? (
      <tr><td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">No tasks found.</td></tr>
    ) : paginated.map(t => {
      const taskStatus = getTaskStatus(t);
      return (
        <tr key={t.id} onClick={() => navigate(`/task-management/${t.id}`)} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
          <td className="px-3 py-2.5" onClick={e => toggleSelectTask(t.id, e)}>
            <input
              type="checkbox"
              checked={selectedTaskIds.has(t.id)}
              onChange={() => {}}
              className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
            />
          </td>
          <td className="px-3 py-2.5 font-semibold text-primary text-xs">{t.id}</td>
          <td className="px-3 py-2.5">
            <p className="font-medium text-card-foreground text-xs">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{t.description}</p>}
          </td>
          <td className="px-3 py-2.5">
            <div className="flex flex-wrap gap-1">
              {(t.assignedEmployees || [t.assignedTo]).map(emp => (
                <span key={emp} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{emp}</span>
              ))}
            </div>
          </td>
          <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.startDate}</td>
          <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.endDate}</td>
          <td className="px-3 py-2.5"><StatusBadge label={taskStatus} variant={statusVariant[taskStatus]} /></td>
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); openEdit(t); }} className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors" title="Edit">
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 transition-colors" title="Delete">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
```

---

## Step 4: Add Selection Bar

Add this before the table (after the filters section):

```typescript
{/* Selection Bar */}
{selectedTaskIds.size > 0 && (
  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
    <span className="text-sm font-semibold text-primary">
      {selectedTaskIds.size} task{selectedTaskIds.size === 1 ? "" : "s"} selected
    </span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowBulkAssign(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
      >
        <Users className="w-4 h-4" />
        Bulk Assign
      </button>

      <button
        onClick={() => setShowBulkStatusUpdate(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
      >
        <CheckCircle className="w-4 h-4" />
        Bulk Status
      </button>

      <button
        onClick={() => setSelectedTaskIds(new Set())}
        className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Clear
      </button>
    </div>
  </div>
)}
```

---

## Step 5: Add Bulk Assign Modal

Add this before the closing `</div>` of the return statement (after the Create/Edit Modal):

```typescript
{/* Bulk Assign Modal */}
{showBulkAssign && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
    <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-card-foreground">Bulk Assign Tasks</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedTaskIds.size} task{selectedTaskIds.size === 1 ? "" : "s"} selected</p>
          </div>
        </div>
        <button onClick={() => setShowBulkAssign(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Selected Tasks Preview */}
        <div className="bg-secondary/30 rounded-lg border border-border p-3 max-h-36 overflow-y-auto space-y-1">
          {getSelectedTasks().map(t => (
            <div key={t.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-card-foreground">{t.title}</span>
              <span className="text-muted-foreground">{t.id}</span>
            </div>
          ))}
        </div>

        {/* Branch Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch</label>
          <select
            value={bulkAssignData.branch}
            onChange={e => setBulkAssignData(prev => ({ ...prev, branch: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Branches</option>
            {allBranches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Employee Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Employees *</label>
          <EmployeeMultiSelect
            options={bulkAssignData.branch ? filteredEmployeeNames : employeeNames}
            selected={bulkAssignData.assignedEmployees}
            onChange={v => setBulkAssignData(prev => ({ ...prev, assignedEmployees: v }))}
          />
        </div>

        {/* Info Message */}
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
          <p className="text-xs text-warning font-medium">
            This will assign {selectedTaskIds.size} task{selectedTaskIds.size === 1 ? "" : "s"} to the selected employees.
          </p>
        </div>
      </div>

      <div className="flex gap-3 p-6 border-t border-border">
        <button
          onClick={() => setShowBulkAssign(false)}
          className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleBulkAssign}
          className="flex-1 h-10 text-white text-sm font-semibold hover:opacity-90 transition-all rounded-lg shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          Assign
        </button>
      </div>
    </div>
  </div>,
  document.body
)}

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
            <p className="text-xs text-muted-foreground mt-0.5">{selectedTaskIds.size} task{selectedTaskIds.size === 1 ? "" : "s"} selected</p>
          </div>
        </div>
        <button onClick={() => setShowBulkStatusUpdate(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Selected Tasks Preview */}
        <div className="bg-secondary/30 rounded-lg border border-border p-3 max-h-36 overflow-y-auto space-y-1">
          {getSelectedTasks().map(t => (
            <div key={t.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-card-foreground">{t.title}</span>
              <span className="text-muted-foreground">{t.id}</span>
            </div>
          ))}
        </div>

        {/* Status Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Update Status To *</label>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {MANUAL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Info Message */}
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
          <p className="text-xs text-warning font-medium">
            This will update the status for all {selectedTaskIds.size} selected task{selectedTaskIds.size === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      <div className="flex gap-3 p-6 border-t border-border">
        <button
          onClick={() => setShowBulkStatusUpdate(false)}
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

---

## Step 6: Update Imports

Make sure these icons are imported at the top:

```typescript
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronDown, X, Upload, File, Users, CheckCircle } from "lucide-react";
```

---

## Step 7: Test the Implementation

### Test Checklist
- [ ] Click checkbox to select single task
- [ ] Click "Select All" checkbox to select all tasks on page
- [ ] Selection bar appears when tasks selected
- [ ] Click "Bulk Assign" button
- [ ] Modal opens with selected tasks preview
- [ ] Select branch and employees
- [ ] Click "Assign" button
- [ ] Tasks are assigned successfully
- [ ] Toast notification appears
- [ ] Selection clears after operation
- [ ] Repeat for "Bulk Status" button

---

## Complete Modified TaskManagementPage Structure

```typescript
const TaskManagementPage = () => {
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask, getNextTaskId } = useTasksStore();
  const { employees } = useEmployeesStore();

  // Existing state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // NEW: Multi-select state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
  const [bulkAssignData, setBulkAssignData] = useState({
    assignedEmployees: [] as string[],
    branch: "",
  });
  const [bulkStatus, setBulkStatus] = useState<TaskStatus>("Pending");

  // ... rest of existing code ...

  // NEW: Selection functions
  const toggleSelectTask = (id: string, e: React.MouseEvent) => { /* ... */ };
  const toggleSelectAll = () => { /* ... */ };
  const getSelectedTasks = () => { /* ... */ };
  const handleBulkAssign = () => { /* ... */ };
  const handleBulkStatusUpdate = () => { /* ... */ };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ... existing header and filters ... */}

      {/* NEW: Selection Bar */}
      {selectedTaskIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          {/* ... selection bar content ... */}
        </div>
      )}

      {/* Table with NEW checkbox column */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* ... table with checkbox column ... */}
          </table>
        </div>
      </div>

      {/* ... existing pagination ... */}

      {/* ... existing modals ... */}

      {/* NEW: Bulk Assign Modal */}
      {showBulkAssign && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
          {/* ... modal content ... */}
        </div>,
        document.body
      )}

      {/* NEW: Bulk Status Update Modal */}
      {showBulkStatusUpdate && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
          {/* ... modal content ... */}
        </div>,
        document.body
      )}
    </div>
  );
};
```

---

## Troubleshooting

### Issue: Selection not persisting
**Solution:** Ensure `setSelectedTaskIds` is called correctly in toggle functions

### Issue: Modal not opening
**Solution:** Check that `setShowBulkAssign(true)` is called in button onClick

### Issue: Updates not saving
**Solution:** Verify `updateTask` is being called with correct parameters

### Issue: Toast not showing
**Solution:** Ensure `toast` is imported from 'sonner'

### Issue: Styles don't match
**Solution:** Copy exact Tailwind classes and gradient values from existing buttons

---

## Performance Tips

1. **Use Set for selections** - Already implemented ✅
2. **Batch updates** - Consider debouncing if updating 1000+ tasks
3. **Pagination** - Only show selected tasks from current page in preview
4. **Memoization** - Consider useMemo for filtered tasks

---

## Next Steps

1. Implement Bulk Assign (this guide)
2. Implement Bulk Status Update (similar pattern)
3. Add Bulk Date Update
4. Add Bulk Delete with confirmation
5. Add Bulk Export (CSV/Excel)

