import { X, UserPlus, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTasksStore, type Task } from "@/store/tasksStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useState, useRef, useEffect } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
      startDate: task.startDate,
      endDate: task.endDate,
      assignedEmployees: task.assignedEmployees || [],
      status: task.status,
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleEmployee = (employeeName: string) => {
    setSelectedEmployees((prev) => {
      const newSelection = prev.includes(employeeName)
        ? prev.filter((name) => name !== employeeName)
        : [...prev, employeeName];
      setValue("assignedEmployees", newSelection);
      return newSelection;
    });
  };

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
        startDate: data.startDate,
        endDate: data.endDate,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
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
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date *</label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date *</label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            />
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Assigned To *</label>
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground flex items-center justify-between hover:bg-secondary/80 transition-colors"
              >
                <span className={selectedEmployees.length === 0 ? "text-muted-foreground" : "text-card-foreground"}>
                  {selectedEmployees.length === 0
                    ? "Select employees..."
                    : `${selectedEmployees.length} employee${selectedEmployees.length > 1 ? "s" : ""} selected`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-[100] w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 p-3 hover:bg-secondary cursor-pointer transition-colors border-b border-border last:border-b-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.name)}
                          onChange={() => toggleEmployee(emp.name)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-card-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.role}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground p-3">No employees available</p>
                  )}
                </div>
              )}

              {/* Selected Employees Tags */}
              {selectedEmployees.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 p-2 bg-secondary/50 rounded-lg border border-border">
                  {selectedEmployees.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20"
                    >
                      {name}
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
                  ))}
                </div>
              )}
            </div>
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
