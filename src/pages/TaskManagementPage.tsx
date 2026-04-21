import { useState } from "react";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronDown, X, Upload, File } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useTasksStore, type Task } from "@/store/tasksStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { StatusBadge } from "@/components/StatusBadge";

const PAGE_SIZE = 10;
const STATUSES = ["Pending", "In Progress", "Completed"] as const;

type TaskStatus = typeof STATUSES[number];

const statusVariant: Record<TaskStatus, "warning" | "info" | "success"> = {
  "Pending": "warning",
  "In Progress": "info",
  "Completed": "success",
};

function EmployeeMultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter(x => x !== name) : [...selected, name]);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
        <span className={selected.length === 0 ? "text-muted-foreground" : ""}>{selected.length === 0 ? "Select employees" : selected.join(", ")}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
          {options.map(name => (
            <label key={name} className="flex items-center gap-2.5 px-3 py-2 hover:bg-secondary cursor-pointer text-sm text-card-foreground">
              <input type="checkbox" checked={selected.includes(name)} onChange={() => toggle(name)} className="accent-primary" />
              {name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyForm = { title: "", description: "", workOrderId: "", startDate: "", endDate: "", assignedEmployees: [] as string[], status: "Pending" as TaskStatus, attachments: [] as File[] };

const TaskManagementPage = () => {
  const { tasks, addTask, updateTask, deleteTask, getNextTaskId } = useTasksStore();
  const { employees } = useEmployeesStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const employeeNames = employees.map(e => e.name);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.assignedEmployees?.join(", ").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditingTask(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (t: Task) => { setEditingTask(t); setForm({ title: t.title, description: t.description, workOrderId: t.workOrderId, startDate: t.startDate, endDate: t.endDate, assignedEmployees: t.assignedEmployees || [t.assignedTo], status: t.status, attachments: [] }); setShowModal(true); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error(`Some files exceed 10MB limit: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }

    setForm(f => ({ ...f, attachments: [...f.attachments, ...files] }));
    toast.success(`Added ${files.length} file${files.length !== 1 ? 's' : ''}`);
  };

  const removeFile = (index: number) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== index) }));
    toast.info("File removed");
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.startDate) { toast.error("Start date is required"); return; }
    if (!form.endDate) { toast.error("End date is required"); return; }
    if (form.assignedEmployees.length === 0) { toast.error("Assign at least one employee"); return; }

    if (editingTask) {
      updateTask(editingTask.id, { ...form, assignedTo: form.assignedEmployees[0] });
      toast.success("Task updated");
    } else {
      addTask({ id: getNextTaskId(), ...form, assignedTo: form.assignedEmployees[0] });
      toast.success("Task created");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    toast.success("Task deleted");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Task Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage tasks with employee assignments</p>
        </div>
        <button onClick={openCreate} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tasks..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", ...STATUSES] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s as any); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${statusFilter === s ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`}
              style={statusFilter === s ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Task ID", "Title", "Assigned Employees", "Start Date", "End Date", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-muted-foreground">No tasks found.</td></tr>
              ) : paginated.map(t => (
                <tr key={t.id} onClick={() => setSelectedTask(t)} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
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
                  <td className="px-3 py-2.5"><StatusBadge label={t.status} variant={statusVariant[t.status]} /></td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tasks</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? "text-white" : "border border-border bg-card text-muted-foreground hover:bg-secondary"}`}
                style={p === page ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Task Details Popup */}
      {selectedTask && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={() => setSelectedTask(null)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-card-foreground">{selectedTask.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedTask.id}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedTask.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-card-foreground">{selectedTask.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Start Date</p>
                  <p className="text-sm font-medium text-card-foreground">{selectedTask.startDate || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">End Date</p>
                  <p className="text-sm font-medium text-card-foreground">{selectedTask.endDate || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned Employees</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedTask.assignedEmployees || [selectedTask.assignedTo]).map(emp => (
                    <span key={emp} className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{emp}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                <StatusBadge label={selectedTask.status} variant={statusVariant[selectedTask.status]} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => { setSelectedTask(null); openEdit(selectedTask); }} className="flex-1 h-10 inline-flex items-center justify-center gap-2 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => { setSelectedTask(null); handleDelete(selectedTask.id); }} className="flex-1 h-10 inline-flex items-center justify-center gap-2 border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors rounded-lg">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <h3 className="text-base font-bold text-card-foreground">{editingTask ? "Edit Task" : "Create Task"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Task description" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date *</label>
                  <input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign Employees *</label>
                <EmployeeMultiSelect options={employeeNames} selected={form.assignedEmployees} onChange={v => setForm(f => ({ ...f, assignedEmployees: v }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Attachments</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-secondary border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-secondary/80 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload files</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="*/*"
                    />
                  </label>
                  {form.attachments.length > 0 && (
                    <div className="space-y-2">
                      {form.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-card-foreground truncate">{file.name}</p>
                              <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">Max file size: 10MB per file</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
              <button onClick={handleSave} className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white rounded-lg transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
                {editingTask ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TaskManagementPage;
