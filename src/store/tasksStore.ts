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
  status: "Pending" | "In Progress" | "Completed" | "Overdue" | "Verified";
  unitPrice?: number;
  quantity?: number;
  amount?: number;
  gst?: string;
  cgst?: string;
  igst?: string;
  fromTime?: string;
  toTime?: string;
  attachments?: Array<{ name: string; size: number; data: string }>;
  branch?: string;
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
  // WO-2001 - Rajesh Menon - Comprehensive Pest Control (AMC)
  { id: "TASK-101", workOrderId: "WO-2001", title: "Comprehensive Pest Control (AMC - Monthly)", description: "Monthly AMC pest control treatment for residential property", startDate: "2026-04-10", endDate: "2026-04-10", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },
  { id: "TASK-102", workOrderId: "WO-2001", title: "Initial Site Inspection", description: "Inspect all areas before treatment begins", startDate: "2026-04-10", endDate: "2026-04-10", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },

  // WO-2002 - Green Valley Resort - Resort Pest Management
  { id: "TASK-103", workOrderId: "WO-2002", title: "Resort Pest Management (AMC - Bi-Weekly)", description: "Bi-weekly pest management for resort premises", startDate: "2026-04-12", endDate: "2026-04-12", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },
  { id: "TASK-104", workOrderId: "WO-2002", title: "Kitchen & Restaurant Treatment", description: "Specialized treatment for food service areas", startDate: "2026-04-12", endDate: "2026-04-12", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },
  { id: "TASK-105", workOrderId: "WO-2002", title: "Guest Room Inspection", description: "Inspect and treat all guest rooms", startDate: "2026-04-13", endDate: "2026-04-13", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },

  // WO-2003 - Tech Park Solutions - Office Complex Pest Control
  { id: "TASK-106", workOrderId: "WO-2003", title: "Office Pest Control (AMC - Quarterly)", description: "Quarterly pest control for office complex", startDate: "2026-04-15", endDate: "2026-04-15", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },
  { id: "TASK-107", workOrderId: "WO-2003", title: "Server Room Treatment", description: "Safe treatment for IT infrastructure areas", startDate: "2026-04-15", endDate: "2026-04-15", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },

  // WO-2004 - Sunrise Apartments - Termite Control
  { id: "TASK-108", workOrderId: "WO-2004", title: "Termite Control (One-Time)", description: "Full termite treatment for residential complex", startDate: "2026-04-08", endDate: "2026-04-08", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },
  { id: "TASK-109", workOrderId: "WO-2004", title: "Post-Treatment Inspection", description: "Verify treatment effectiveness after 7 days", startDate: "2026-04-15", endDate: "2026-04-15", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },

  // WO-1001 - Praveen Kumar - Cockroach Control (AMC)
  { id: "TASK-110", workOrderId: "WO-1001", title: "Cockroach Control (AMC - 4/Year)", description: "Quarterly cockroach control treatment", startDate: "2026-01-10", endDate: "2026-01-10", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Completed" },
  { id: "TASK-111", workOrderId: "WO-1001", title: "Follow-up Inspection", description: "Check treatment effectiveness", startDate: "2026-04-10", endDate: "2026-04-10", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Pending" },

  // WO-1002 - Praveen Kumar - Termite Control (One-Time)
  { id: "TASK-112", workOrderId: "WO-1002", title: "Termite Control (One-Time)", description: "Wood treatment for furniture and flooring", startDate: "2026-02-05", endDate: "2026-02-05", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Completed" },

  // WO-1003 - Praveen Kumar - Mosquito Fogging
  { id: "TASK-113", workOrderId: "WO-1003", title: "Mosquito Fogging (One-Time)", description: "Garden and terrace fogging treatment", startDate: "2026-03-01", endDate: "2026-03-01", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },

  // WO-1004 - Praveen Kumar - Rat Control (AMC)
  { id: "TASK-114", workOrderId: "WO-1004", title: "Rat Control (AMC - Bi-Monthly)", description: "Kitchen and store room rat control", startDate: "2026-03-20", endDate: "2026-03-20", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "In Progress" },
  { id: "TASK-115", workOrderId: "WO-1004", title: "Bait Station Setup", description: "Install and monitor bait stations", startDate: "2026-03-20", endDate: "2026-03-21", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Completed" },

  // WO-1005 - Hotel Grand - Bed Bug Treatment (AMC)
  { id: "TASK-116", workOrderId: "WO-1005", title: "Bed Bug Treatment (AMC - Monthly)", description: "Full hotel bed bug treatment", startDate: "2026-01-15", endDate: "2026-01-16", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Completed" },
  { id: "TASK-117", workOrderId: "WO-1005", title: "Room-by-Room Inspection", description: "Inspect all guest rooms for bed bugs", startDate: "2026-04-15", endDate: "2026-04-15", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Pending" },

  // WO-1006 - Hotel Grand - Cockroach Control (AMC)
  { id: "TASK-118", workOrderId: "WO-1006", title: "Cockroach Control (AMC - Monthly)", description: "Kitchen and restaurant area treatment", startDate: "2026-02-10", endDate: "2026-02-10", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Completed" },
  { id: "TASK-119", workOrderId: "WO-1006", title: "Monthly Follow-up Treatment", description: "Scheduled monthly cockroach control", startDate: "2026-04-10", endDate: "2026-04-10", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Pending" },

  // WO-1007 - Hotel Grand - Rodent Control (One-Time)
  { id: "TASK-120", workOrderId: "WO-1007", title: "Rodent Control (One-Time)", description: "Basement and storage area treatment", startDate: "2026-03-05", endDate: "2026-03-05", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Completed" },

  // WO-1008 - Hotel Grand - Mosquito Control (AMC)
  { id: "TASK-121", workOrderId: "WO-1008", title: "Mosquito Control (AMC - Monthly)", description: "Outdoor areas, pool side, and garden treatment", startDate: "2026-03-25", endDate: "2026-03-25", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },
  { id: "TASK-122", workOrderId: "WO-1008", title: "Fogging Treatment", description: "Thermal fogging for mosquito control", startDate: "2026-04-25", endDate: "2026-04-25", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },

  // WO-1009 - Lakshmi Stores - Termite Control (One-Time)
  { id: "TASK-123", workOrderId: "WO-1009", title: "Termite Control (One-Time)", description: "Store perimeter and wooden shelving treatment", startDate: "2026-01-20", endDate: "2026-01-20", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Completed" },

  // WO-1010 - Lakshmi Stores - Cockroach Control (AMC)
  { id: "TASK-124", workOrderId: "WO-1010", title: "Cockroach Control (AMC - Quarterly)", description: "Quarterly treatment before business hours", startDate: "2026-02-15", endDate: "2026-02-15", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Completed" },
  { id: "TASK-125", workOrderId: "WO-1010", title: "Next Quarterly Treatment", description: "Scheduled quarterly cockroach control", startDate: "2026-05-15", endDate: "2026-05-15", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Pending" },

  // WO-1011 - Lakshmi Stores - Rat Control (One-Time)
  { id: "TASK-126", workOrderId: "WO-1011", title: "Rat Control (One-Time)", description: "Warehouse and storage area treatment", startDate: "2026-03-08", endDate: "2026-03-08", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Completed" },

  // WO-1012 - Lakshmi Stores - Fly Control (AMC)
  { id: "TASK-127", workOrderId: "WO-1012", title: "Fly Control (AMC - Monthly)", description: "Food storage and display area fly control", startDate: "2026-03-28", endDate: "2026-03-28", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },
  { id: "TASK-128", workOrderId: "WO-1012", title: "UV Trap Installation", description: "Install UV fly traps in key areas", startDate: "2026-03-28", endDate: "2026-03-28", assignedTo: "Unassigned", assignedEmployees: [], status: "Pending" },

  // Legacy tasks (kept for backward compatibility)
  { id: "TASK-001", workOrderId: "WO-1025", title: "Initial Site Survey", description: "Conduct initial survey of the apartment", startDate: "2026-02-01", endDate: "2026-02-02", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Completed" },
  { id: "TASK-002", workOrderId: "WO-1025", title: "Treatment Application", description: "Apply cockroach control treatment", startDate: "2026-02-03", endDate: "2026-02-05", assignedTo: "Mani", assignedEmployees: ["Mani", "Safeeq"], status: "In Progress" },
  { id: "TASK-003", workOrderId: "WO-1025", title: "Follow-up Inspection", description: "Inspect treatment effectiveness", startDate: "2026-02-10", endDate: "2026-02-10", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Pending" },
  { id: "TASK-004", workOrderId: "WO-1027", title: "Kitchen Treatment", description: "Treat kitchen area for bed bugs", startDate: "2026-01-15", endDate: "2026-01-16", assignedTo: "Safeeq", assignedEmployees: ["Safeeq"], status: "Completed" },
  { id: "TASK-005", workOrderId: "WO-1027", title: "Room Treatment", description: "Treat all guest rooms", startDate: "2026-01-17", endDate: "2026-01-19", assignedTo: "Safeeq", assignedEmployees: ["Safeeq", "Rajesh"], status: "Completed" },
  { id: "TASK-006", workOrderId: "WO-1026", title: "Urgent Pest Control", description: "Emergency pest control needed", startDate: "2026-04-20", endDate: "2026-04-22", assignedTo: "Mani", assignedEmployees: ["Mani"], status: "Pending" },
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
    { name: "tasks-store", version: 1 }
  )
);
