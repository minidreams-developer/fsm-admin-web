import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, X, Upload, File, Download, Eye, UserCheck } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useTasksStore, type Task } from "@/store/tasksStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { StatusBadge } from "@/components/StatusBadge";
import { createPortal } from "react-dom";

// IndexedDB utilities for storing large files
const DB_NAME = "fsm-attachments";
const STORE_NAME = "files";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
  });
};

const saveToIndexedDB = async (data: string): Promise<string> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({ data, timestamp: Date.now() });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(String(request.result));
  });
};

const getFromIndexedDB = async (id: string): Promise<string | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(Number(id));
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.data || null);
  });
};

const deleteFromIndexedDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(Number(id));
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

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
  const [loadingAttachment, setLoadingAttachment] = useState(false);

  // Direct document upload by assigned person
  const [uploadingAs, setUploadingAs] = useState<string>("");
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

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

  // Direct document upload handler
  const handleUploadFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const maxSize = 10 * 1024 * 1024;
    const invalid = files.filter(f => f.size > maxSize);
    if (invalid.length > 0) {
      toast.error(`File(s) exceed 10MB: ${invalid.map(f => f.name).join(", ")}`);
      return;
    }
    setUploadingFiles(prev => [...prev, ...files]);
    toast.success(`Added ${files.length} file${files.length !== 1 ? 's' : ''}`);
    // Reset input so same file can be re-selected
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    const maxSize = 10 * 1024 * 1024;
    const invalid = files.filter(f => f.size > maxSize);
    if (invalid.length > 0) {
      toast.error(`File(s) exceed 10MB: ${invalid.map(f => f.name).join(", ")}`);
      return;
    }
    setUploadingFiles(prev => [...prev, ...files]);
    toast.success(`Added ${files.length} file${files.length !== 1 ? 's' : ''}`);
  };

  const handleRemoveUploadingFile = (idx: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitUpload = async () => {
    if (!uploadingAs) { toast.error("Select your name before uploading"); return; }
    if (uploadingFiles.length === 0) { toast.error("Select at least one file"); return; }
    setIsUploading(true);
    try {
      const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      const newAttachments = await Promise.all(
        uploadingFiles.map(async (file) => {
          return new Promise<any>((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Data = e.target?.result as string;
              const sizeInMB = file.size / (1024 * 1024);
              
              // If file is larger than 1MB, store in IndexedDB instead of localStorage
              if (sizeInMB > 1) {
                try {
                  const dataId = await saveToIndexedDB(base64Data);
                  resolve({
                    name: file.name,
                    size: file.size,
                    dataId,
                    uploadedBy: uploadingAs,
                    uploadedAt: now
                  });
                } catch (error) {
                  console.error("Failed to save to IndexedDB:", error);
                  toast.error(`Failed to save ${file.name} to storage`);
                  resolve(null);
                }
              } else {
                // Small files stay in localStorage as base64
                resolve({
                  name: file.name,
                  size: file.size,
                  data: base64Data,
                  uploadedBy: uploadingAs,
                  uploadedAt: now
                });
              }
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      const validAttachments = newAttachments.filter(a => a !== null);
      if (validAttachments.length > 0) {
        updateTask(task.id, { attachments: [...(task.attachments || []), ...validAttachments] });
        setUploadingFiles([]);
        setUploadingAs("");
        toast.success(`${validAttachments.length} document${validAttachments.length !== 1 ? "s" : ""} uploaded successfully`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = (idx: number) => {
    const updated = (task.attachments || []).filter((_, i) => i !== idx);
    updateTask(task.id, { attachments: updated });
    toast.success("Document removed");
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
        <>
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
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h1 className="text-base font-bold text-card-foreground">Documents</h1>
            {/* <p className="text-xs text-muted-foreground mt-0.5">
              {task.attachments && task.attachments.length > 0
                ? `${task.attachments.length} document${task.attachments.length !== 1 ? "s" : ""} uploaded`
                : "No documents yet"}
            </p> */}
          </div>

          {/* Uploaded documents list */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="px-6 pt-4 pb-2 space-y-2">
              {task.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between gap-3 px-4 py-3 bg-secondary/40 border border-border rounded-xl hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <File className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{attachment.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</span>
                        {attachment.uploadedBy && (
                          <>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                              <UserCheck className="w-3 h-3" />
                              {attachment.uploadedBy}
                            </span>
                          </>
                        )}
                        {attachment.uploadedAt && (
                          <>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">{attachment.uploadedAt}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={async () => {
                        try {
                          const data = attachment.data || (attachment.dataId ? await getFromIndexedDB(attachment.dataId) : null);
                          if (data) {
                            setViewingAttachment({ name: attachment.name, data });
                          } else {
                            toast.error("Could not load file");
                          }
                        } catch (error) {
                          console.error("Failed to load attachment:", error);
                          toast.error("Failed to load file");
                        }
                      }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const data = attachment.data || (attachment.dataId ? await getFromIndexedDB(attachment.dataId) : null);
                          if (data) {
                            const link = document.createElement('a');
                            link.href = data;
                            link.download = attachment.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            toast.error("Could not download file");
                          }
                        } catch (error) {
                          console.error("Failed to download attachment:", error);
                          toast.error("Failed to download file");
                        }
                      }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (attachment.dataId) {
                            await deleteFromIndexedDB(attachment.dataId);
                          }
                          handleDeleteAttachment(index);
                        } catch (error) {
                          console.error("Failed to delete attachment:", error);
                          toast.error("Failed to delete file");
                        }
                      }}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload by assigned person */}
          <div className="px-6 py-5 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Upload Document</p>

            {/* Who is uploading */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Uploading as *</label>
              <select
                value={uploadingAs}
                onChange={e => setUploadingAs(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">— Select your name —</option>
                {employeeNames
                  .filter(n => n && n !== "Unassigned")
                  .map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
              </select>
            </div>

            {/* File drop zone */}
            <label
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center gap-2 w-full px-4 py-6 rounded-xl bg-secondary border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-secondary/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-card-foreground">Drag files here or click to select</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">PDF, images, Word, Excel — max 10MB each</p>
              </div>
              <input ref={uploadInputRef} type="file" multiple onChange={handleUploadFileSelect} className="hidden" accept="*/*" />
            </label>

            {/* Selected files preview */}
            {uploadingFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadingFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-card-foreground truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const data = e.target?.result as string;
                              setViewingAttachment({ name: file.name, data });
                            };
                            reader.readAsDataURL(file);
                          } catch (error) {
                            console.error("Failed to load file:", error);
                            toast.error("Failed to view file");
                          }
                        }}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const link = document.createElement('a');
                              link.href = e.target?.result as string;
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            };
                            reader.readAsDataURL(file);
                          } catch (error) {
                            console.error("Failed to download file:", error);
                            toast.error("Failed to download file");
                          }
                        }}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5 text-primary" />
                      </button>
                      <button onClick={() => handleRemoveUploadingFile(idx)} className="p-1 hover:bg-destructive/10 rounded transition-colors">
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleSubmitUpload}
                  disabled={isUploading || !uploadingAs}
                  className="mt-2 w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : `Upload ${uploadingFiles.length} file${uploadingFiles.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            )}
          </div>
        </div>
        </>
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
