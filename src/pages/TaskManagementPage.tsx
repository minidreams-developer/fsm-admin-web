import { useState } from "react";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronDown, X, Upload, File, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { showToast } from "@/lib/toast";
import { useTasksStore, type Task } from "@/store/tasksStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useBranchesStore } from "@/store/branchesStore";
import { StatusBadge } from "@/components/StatusBadge";
import { PaginationControls } from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { DataTable } from "@/components/table/DataTable";

const PAGE_SIZE = 10;
const STATUSES = ["Pending", "In Progress", "Completed", "Overdue", "Verified"] as const;
const MANUAL_STATUSES = ["Pending", "In Progress", "Completed", "Overdue", "Verified"] as const;

type TaskStatus = typeof STATUSES[number];

const statusVariant: Record<TaskStatus, "warning" | "info" | "success" | "error" | "neutral"> = {
  "Pending": "warning",
  "In Progress": "info",
  "Completed": "success",
  "Overdue": "error",
  "Verified": "neutral",
};

// Helper function to determine if a task is overdue
const getTaskStatus = (task: Task): TaskStatus => {
  // If task is already completed or verified, return as-is
  if (task.status === "Completed" || task.status === "Verified") {
    return task.status;
  }
  
  // Check if task is overdue based on end date
  if (task.endDate) {
    const endDate = new Date(task.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < today) {
      return "Overdue";
    }
  }
  
  // Return the task's current status (Pending, In Progress, etc.)
  return task.status as TaskStatus;
};

const getTaskAssignees = (task: Task) => {
  const fromList = task.assignedEmployees?.filter(n => n && n !== "Unassigned") ?? [];
  if (fromList.length > 0) return fromList;
  if (task.assignedTo && task.assignedTo !== "Unassigned") return [task.assignedTo];
  return [];
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

const emptyForm = { title: "", description: "", workOrderId: "", startDate: "", endDate: "", branch: "", assignedEmployees: [] as string[], status: "Pending" as TaskStatus, attachments: [] as File[] };

const TaskManagementPage = () => {
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask, getNextTaskId } = useTasksStore();
  const { employees } = useEmployeesStore();
  const { branches: branchList } = useBranchesStore();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Bulk assign state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkAssignData, setBulkAssignData] = useState({
    assignedEmployees: [] as string[],
    branch: "",
  });

  const employeeNames = employees.map(e => e.name);
  const activeEmployees = employees.filter(e => e.isActive !== false);
  const activeBranches = branchList.filter(b => b.status === "Active");

  // All unique branches from employees (create/edit modals)
  const allBranches = Array.from(
    new Set(employees.flatMap(e => e.branch))
  ).sort();

  const filterEmployeeOptions =
    branchFilter === "All"
      ? activeEmployees
      : activeEmployees.filter(e => e.branch.includes(branchFilter));

  const taskMatchesBranch = (task: Task, branch: string) => {
    if (task.branch === branch) return true;
    return getTaskAssignees(task).some(name => {
      const emp = employees.find(e => e.name === name);
      return emp?.branch.includes(branch);
    });
  };

  // Employees filtered by selected branch (create/edit form)
  const filteredEmployeeNames = form.branch
    ? employees.filter(e => e.branch.includes(form.branch)).map(e => e.name)
    : employeeNames;

  // Employees filtered by bulk-assign branch
  const bulkFilteredEmployeeNames = bulkAssignData.branch
    ? employees.filter(e => e.branch.includes(bulkAssignData.branch)).map(e => e.name)
    : employeeNames;

    // Toggle individual task selection
    const toggleSelectTask = (id: string) => {
      setSelectedTaskIds((prev) => {
        const next = new Set(prev);
        
        next.has(id) ? next.delete(id) : next.add(id);
        
        return next;
      });
    };
    // Toggle select all on current page
    const toggleSelectAll = () => {
      const currentPageTasks = pagination.paginatedItems;
      if (currentPageTasks.length > 0 && currentPageTasks.every(t => selectedTaskIds.has(t.id))) {
        setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(prev => {
        const next = new Set(prev);
        currentPageTasks.forEach(t => next.add(t.id));
        return next;
      });
    }
  };
  
  // Get selected tasks
  const getSelectedTasks = () => {
    return pagination.paginatedItems.filter(t => selectedTaskIds.has(t.id));
  };
  
  // Bulk assign handler
  const handleBulkAssign = () => {
    if (bulkAssignData.assignedEmployees.length === 0) {
      showToast.error("Select at least one employee");
      return;
    }
    
    selectedTaskIds.forEach(id => {
      updateTask(id, {
        assignedEmployees: bulkAssignData.assignedEmployees,
        assignedTo: bulkAssignData.assignedEmployees[0],
        branch: bulkAssignData.branch || undefined,
      });
    });
    
    showToast.success(`${selectedTaskIds.size} task${selectedTaskIds.size === 1 ? "" : "s"} assigned`);
    setSelectedTaskIds(new Set());
    setShowBulkAssign(false);
    setBulkAssignData({ assignedEmployees: [], branch: "" });
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.assignedEmployees?.join(", ").toLowerCase().includes(search.toLowerCase());
    const taskStatus = getTaskStatus(t);
    const matchStatus = statusFilter === "All" || taskStatus === statusFilter;
    const matchBranch = branchFilter === "All" || taskMatchesBranch(t, branchFilter);
    const assignees = getTaskAssignees(t);
    const matchEmployee = employeeFilter === "All" || assignees.includes(employeeFilter);
    return matchSearch && matchStatus && matchBranch && matchEmployee;
  });
  
  const pagination = usePagination({
    items: filtered,
    itemsPerPage: 10,
  });

  const openCreate = () => { setEditingTask(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (t: Task) => { setEditingTask(t); setForm({ title: t.title, description: t.description, workOrderId: t.workOrderId, startDate: t.startDate, endDate: t.endDate, branch: (t as any).branch || "", assignedEmployees: t.assignedEmployees || [t.assignedTo], status: t.status, attachments: [] }); setShowModal(true); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      showToast.error(`Some files exceed 10MB limit: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }

    setForm(f => ({ ...f, attachments: [...f.attachments, ...files] }));
    showToast.success(`Added ${files.length} file${files.length !== 1 ? 's' : ''}`);
  };

  const removeFile = (index: number) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== index) }));
    showToast.info("File removed");
  };

  const handleSave = () => {
    if (!form.title.trim()) { showToast.error("Title is required"); return; }
    if (!form.startDate) { showToast.error("Start date is required"); return; }
    if (!form.endDate) { showToast.error("End date is required"); return; }
    if (form.assignedEmployees.length === 0) { showToast.error("Assign at least one employee"); return; }

    // Convert File objects to base64 for storage
    const convertFilesToBase64 = async () => {
      const attachments = await Promise.all(
        form.attachments.map(file => 
          new Promise<{ name: string; size: number; data: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                size: file.size,
                data: e.target?.result as string
              });
            };
            reader.readAsDataURL(file);
          })
        )
      );
      return attachments;
    };

    convertFilesToBase64().then(attachments => {
      if (editingTask) {
        updateTask(editingTask.id, { ...form, assignedTo: form.assignedEmployees[0], attachments });
        showToast.success("Task updated");
      } else {
        addTask({ id: getNextTaskId(), ...form, assignedTo: form.assignedEmployees[0], attachments });
        showToast.success("Task created");
      }
      setShowModal(false);
    });
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    showToast.success("Task deleted");
  };

const taskColumns = [
  {
    key: "id",
    header: "Task ID",
    render: (t: any) => (
      <span className="font-semibold text-primary text-xs">{t.id}</span>
    ),
  },
  {
    key: "title",
    header: "Title",
    render: (t: any) => (
      <div>
        <p className="font-medium text-card-foreground text-xs">{t.title}</p>
        {t.description && (
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
            {t.description}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "assignedEmployees",
    header: "Assigned Employees",
    render: (t: any) => (
      <div className="flex flex-wrap gap-1">
        {(t.assignedEmployees || [t.assignedTo]).map((emp: string) => (
          <span
            key={emp}
            className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold"
          >
            {emp}
          </span>
        ))}
      </div>
    ),
  },
  {
    key: "startDate",
    header: "Start Date",
    render: (t: any) => (
      <span className="text-xs text-muted-foreground">{t.startDate}</span>
    ),
  },
  {
    key: "endDate",
    header: "End Date",
    render: (t: any) => (
      <span className="text-xs text-muted-foreground">{t.endDate}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (t: any) => {
      const taskStatus = getTaskStatus(t);

      return (
        <StatusBadge
          label={taskStatus}
          variant={statusVariant[taskStatus]}
        />
      );
    },
  },
  {
    key: "actions",
    header: "Actions",
    render: (t: any) => (
      <div
        className="flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => openEdit(t)}
          className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <button
          onClick={() => handleDelete(t.id)}
          className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
    ),
  },
];

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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            value={branchFilter}
            onChange={e => {
              const next = e.target.value;
              setBranchFilter(next);
              setPage(1);
              if (employeeFilter !== "All" && next !== "All") {
                const emp = employees.find(x => x.name === employeeFilter);
                if (!emp?.branch.includes(next)) setEmployeeFilter("All");
              }
            }}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Branches</option>
            {activeBranches.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          <select
            value={employeeFilter}
            onChange={e => { setEmployeeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Employees</option>
            {filterEmployeeOptions.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name} — {emp.role}</option>
            ))}
          </select>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tasks..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
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
              onClick={() => setSelectedTaskIds(new Set())}
              className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
  <DataTable
    columns={taskColumns}
    data={pagination.paginatedItems}
    getRowKey={(task) => task.id}
    selectable
    selectedIds={selectedTaskIds}
    onSelectRow={(task) => toggleSelectTask(task.id)}
    onSelectAll={toggleSelectAll}
    onRowClick={(task) => navigate(`/task-management/${task.id}`)}
    emptyMessage="No tasks found."
  />
</div>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={filtered.length}
        onPageChange={pagination.setCurrentPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
      />

      {/* Task Details Popup */}
      {/* Removed - now opens in a new page */}

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
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Branch</label>
                <select
                  value={form.branch}
                  onChange={e => setForm(f => ({ ...f, branch: e.target.value, assignedEmployees: [] }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Branches</option>
                  {allBranches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {form.branch && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Showing {filteredEmployeeNames.length} employee{filteredEmployeeNames.length !== 1 ? "s" : ""} in <span className="font-semibold text-primary">{form.branch}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign Employees *</label>
                <EmployeeMultiSelect options={filteredEmployeeNames} selected={form.assignedEmployees} onChange={v => setForm(f => ({ ...f, assignedEmployees: v }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {MANUAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
                  options={bulkFilteredEmployeeNames}
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
    </div>
  );
};

export default TaskManagementPage;
