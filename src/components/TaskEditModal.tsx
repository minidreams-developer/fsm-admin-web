import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTasksStore, type Task } from "@/store/tasksStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useState } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  assignedEmployees: z.array(z.string()).min(1, "At least one person must be assigned"),
  status: z.enum(["Pending", "In Progress", "Completed"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function TaskEditModal({ task, isOpen, onClose, onSave }: TaskEditModalProps) {
  const { updateTask } = useTasksStore();
  const { employees } = useEmployeesStore();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(task.assignedEmployees || []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      startTime: task.startDate || "",
      endTime: task.endDate || "",
      assignedEmployees: task.assignedEmployees || [],
      status: task.status,
    },
  });

  const removeEmployee = (employeeName: string) => {
    setSelectedEmployees((prev) => {
      const newSelection = prev.filter((name) => name !== employeeName);
      setValue("assignedEmployees", newSelection);
      return newSelection;
    });
  };

  const onSubmit = (data: TaskFormData) => {
    try {
      updateTask(task.id, {
        title: data.title,
        description: data.description || "",
        startDate: data.startTime,
        endDate: data.endTime,
        assignedTo: data.assignedEmployees[0] || "", // Primary assignee
        assignedEmployees: data.assignedEmployees,
        status: data.status,
      });
      toast.success("Service updated successfully!");
      onSave();
      onClose();
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative z-[10000]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold text-card-foreground">Edit Service</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Title *</label>
            <input
              type="text"
              {...register("title")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
            <textarea
              rows={2}
              {...register("description")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Time *</label>
            <input
              type="time"
              {...register("startTime")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">End Time *</label>
            <input
              type="time"
              {...register("endTime")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Assigned To *</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const empName = e.target.value;
                  if (!selectedEmployees.includes(empName)) {
                    const newSelection = [...selectedEmployees, empName];
                    setSelectedEmployees(newSelection);
                    setValue("assignedEmployees", newSelection);
                  }
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground mb-2"
              defaultValue=""
            >
              <option value="" disabled>
                {employees.length === 0 ? "No employees available" : "Select employees..."}
              </option>
              {employees.map((emp) => (
                <option 
                  key={emp.id} 
                  value={emp.name} 
                  disabled={selectedEmployees.includes(emp.name)}
                >
                  {emp.name} — {emp.role}{selectedEmployees.includes(emp.name) ? " ✓" : ""}
                </option>
              ))}
            </select>

            {/* Selected Employees Tags */}
            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEmployees.map((name) => {
                  const emp = employees.find(e => e.name === name);
                  return (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20"
                    >
                      {name}
                      {emp && <span className="text-primary/70">• {emp.role}</span>}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeEmployee(name);
                        }}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            {errors.assignedEmployees && (
              <p className="text-xs text-red-500 mt-1">{errors.assignedEmployees.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
