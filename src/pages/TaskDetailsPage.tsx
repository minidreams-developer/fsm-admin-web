import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, X, Upload, File, Download, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTasksStore, type Task } from "@/store/tasksStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { StatusBadge } from "@/components/StatusBadge";
import { createPortal } from "react-dom";

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

const getTaskStatus = (task: Task): TaskStatus => {
  if (task.status === "Completed" || task.status === "Verified") {
    return task.status;
  }
  
  if (task.endDate) {
    const endDate = new Date(task.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < today) {
      return "Overdue";
    }
  }
  
  return task.status as TaskStatus;
};

function EmployeeMultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter(x => x !== name) : [...selected, name]);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
        <span className={selected.length === 0 ? "text-muted-foreground" : ""}>{selected.length === 0 ? "Select employees" : selected.join(", ")}</span>
        <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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

const TaskDetailsPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask } = useTasksStore();
  const { employees } = useEmployeesStore();

  const task = tasks.find(t => t.id === taskId);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{ name: string; data: string } | null>(null);

  if (!task) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/task-management")} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="bg-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground">Task not found</p>
        </div>
      </div>
    );
  }

  const taskStatus = getTaskStatus(task);
  const employeeNames = employees.map(e => e.name);
  const allBranches = Array.from(new Set(employees.flatMap(e => e.branch))).sort();
  const filteredEmployeeNames = form?.branch
    ? employees.filter(e => e.branch.includes(form.branch)).map(e => e.name)
    : employeeNames;

  const handleEdit = () => {
    setForm({
      title: task.title,
      description: task.description,
      workOrderId: task.workOrderId,
      startDate: task.startDate,
      endDate: task.endDate,
      branch: (task as any).branch || "",
      assignedEmployees: task.assignedEmployees || [task.assignedTo],
      status: task.status,
      attachments: task.attachments || []
    });
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error(`Some files exceed 10MB limit: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }

    setForm(f => ({ ...f, attachments: [...(f.attachments || []), ...files] }));
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

    // Separate File objects from already stored attachments
    const newFiles = form.attachments.filter(a => a && typeof a === 'object' && 'slice' in a) as any[];
    const existingAttachments = form.attachments.filter(a => !(a && typeof a === 'object' && 'slice' in a)) as any[];

    if (newFiles.length === 0) {
      // No new files, just update with existing attachments
      updateTask(task.id, { ...form, assignedTo: form.assignedEmployees[0], attachments: existingAttachments });
      toast.success("Task updated");
      setIsEditing(false);
      return;
    }

    // Convert new File objects to base64
    const convertFilesToBase64 = async () => {
      const newAttachments = await Promise.all(
        newFiles.map(file => 
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
      return [...existingAttachments, ...newAttachments];
    };

    convertFilesToBase64().then(attachments => {
      updateTask(task.id, { ...form, assignedTo: form.assignedEmployees[0], attachments });
      toast.success("Task updated");
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success("Task deleted");
    navigate("/task-management");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate("/task-management")} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        {!isEditing && (
          <div className="flex items-center gap-2">
            {taskStatus === "Completed" && (
              <button 
                onClick={() => {
                  updateTask(task.id, { status: "Verified" });
                  toast.success("Task marked as verified");
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-semibold text-primary"
              >
                ✓ Verify
              </button>
            )}
            <button onClick={handleEdit} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button onClick={handleDelete} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors text-sm font-semibold text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">{task.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{task.id}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {task.description && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-card-foreground leading-relaxed">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Start Date</p>
                <p className="text-sm font-medium text-card-foreground">{task.startDate || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">End Date</p>
                <p className="text-sm font-medium text-card-foreground">{task.endDate || "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned Employees</p>
              <div className="flex flex-wrap gap-2">
                {(task.assignedEmployees || [task.assignedTo]).map(emp => (
                  <span key={emp} className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{emp}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
              <StatusBadge label={taskStatus} variant={statusVariant[taskStatus]} />
            </div>

            {task.workOrderId && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Work Order ID</p>
                <p className="text-sm font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate(`/work-order/${task.workOrderId}`)}>{task.workOrderId}</p>
              </div>
            )}

            {(task as any).branch && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Branch</p>
                <p className="text-sm font-medium text-card-foreground">{(task as any).branch}</p>
              </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Attachments</p>
                <div className="space-y-2">
                  {task.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-card-foreground truncate">{attachment.name}</p>
                          <p className="text-[10px] text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setViewingAttachment(attachment)}
                          className="p-1.5 hover:bg-primary/10 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = attachment.data;
                            link.download = attachment.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="p-1.5 hover:bg-primary/10 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-card-foreground">Edit Task</h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Task description" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Work Order ID</label>
              <input value={form.workOrderId} onChange={e => setForm(f => ({ ...f, workOrderId: e.target.value }))} placeholder="e.g. WO-001" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign Employees *</label>
              <EmployeeMultiSelect options={filteredEmployeeNames} selected={form.assignedEmployees} onChange={v => setForm(f => ({ ...f, assignedEmployees: v }))} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                {MANUAL_STATUSES.map(s => {
                  // If current status is Completed, only allow Completed or Verified
                  if (form.status === "Completed" && s !== "Completed" && s !== "Verified") {
                    return null;
                  }
                  // If current status is Verified, only allow Verified
                  if (form.status === "Verified" && s !== "Verified") {
                    return null;
                  }
                  return <option key={s} value={s}>{s}</option>;
                })}
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
                {form.attachments && form.attachments.length > 0 && (
                  <div className="space-y-2">
                    {form.attachments.map((file, index) => {
                      const isFile = file && typeof file === 'object' && 'slice' in file;
                      const fileName = isFile ? (file as any).name : (file as any).name;
                      const fileSize = isFile ? (file as any).size : (file as any).size;
                      return (
                        <div key={index} className="flex items-center justify-between gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-card-foreground truncate">{fileName}</p>
                              <p className="text-[10px] text-muted-foreground">{(fileSize / 1024).toFixed(1)} KB</p>
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
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">Max file size: 10MB per file</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-border">
            <button onClick={() => setIsEditing(false)} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
            <button onClick={handleSave} className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white rounded-lg transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
              Update Task
            </button>
          </div>
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {viewingAttachment && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={() => setViewingAttachment(null)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-card-foreground">{viewingAttachment.name}</h3>
              </div>
              <button onClick={() => setViewingAttachment(null)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {viewingAttachment.data.startsWith('data:image/') ? (
                <img src={viewingAttachment.data} alt={viewingAttachment.name} className="max-w-full h-auto mx-auto" />
              ) : viewingAttachment.data.startsWith('data:application/pdf') ? (
                <iframe src={viewingAttachment.data} className="w-full h-full min-h-[500px]" title={viewingAttachment.name} />
              ) : viewingAttachment.data.startsWith('data:text/') ? (
                <pre className="bg-secondary p-4 rounded-lg overflow-auto text-xs text-card-foreground whitespace-pre-wrap break-words">
                  {atob(viewingAttachment.data.split(',')[1])}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <File className="w-16 h-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = viewingAttachment.data;
                      link.download = viewingAttachment.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                    style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = viewingAttachment.data;
                  link.download = viewingAttachment.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button onClick={() => setViewingAttachment(null)} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TaskDetailsPage;
