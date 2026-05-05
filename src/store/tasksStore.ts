import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Task = {
  id: string;
  workOrderId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  assignedEmployees: string[];
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
};

interface TasksStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  getTasksByWorkOrder: (workOrderId: string) => Task[];
  getNextTaskId: () => string;
}

const initialTasks: Task[] = [
  { id: "TASK-001", workOrderId: "WO-1025", title: "Initial Site Survey", description: "Conduct initial survey of the apartment", startDate: "2026-02-01", endDate: "2026-02-02", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Completed" },
  { id: "TASK-002", workOrderId: "WO-1025", title: "Treatment Application", description: "Apply cockroach control treatment", startDate: "2026-02-03", endDate: "2026-02-05", assignedTo: "Mani", assignedEmployees: ["Mani", "Safeeq"], status: "In Progress" },
  { id: "TASK-003", workOrderId: "WO-1025", title: "Follow-up Inspection", description: "Inspect treatment effectiveness", startDate: "2026-02-10", endDate: "2026-02-10", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Pending" },
  { id: "TASK-004", workOrderId: "WO-1027", title: "Kitchen Treatment", description: "Treat kitchen area for bed bugs", startDate: "2026-01-15", endDate: "2026-01-16", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Completed" },
  { id: "TASK-005", workOrderId: "WO-1027", title: "Room Treatment", description: "Treat all guest rooms", startDate: "2026-01-17", endDate: "2026-01-19", assignedTo: "Safeeq", assignedEmployees: ["Safeeq", "Rajesh"], status: "Completed" },
  { id: "TASK-006", workOrderId: "WO-1026", title: "Urgent Pest Control", description: "Emergency pest control needed", startDate: "2026-04-20", endDate: "2026-04-22", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Pending" }, // This will show as Overdue
];

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      getTask: (id) => get().tasks.find((task) => task.id === id),

      getTasksByWorkOrder: (workOrderId) =>
        get().tasks.filter((task) => task.workOrderId === workOrderId),

      getNextTaskId: () => {
        const nums = get().tasks.map(t => parseInt(t.id.replace("TASK-", ""))).filter(n => !isNaN(n));
        const next = nums.length ? Math.max(...nums) + 1 : 6;
        return `TASK-${String(next).padStart(3, "0")}`;
      },
    }),
    { name: "tasks-store", version: 0 }
  )
);
