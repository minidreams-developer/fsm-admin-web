import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Employee = {
  id: string;
  name: string;
  phone: string;
  role: string;
  branch: string[];
  projects: number;
  cashBalance: string;
  performance: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  serviceHours: number;
  breakHours: number;
  idleHours: number;
  servicesCompleted: number;
  avgServiceTime: number;
  profilePhoto?: string;
  aadharNumber?: string;
  aadharDocument?: string;
  isActive?: boolean;
  captain?: string; // Captain/Team Lead name
  inventoryItems?: Array<{
    itemName: string;
    quantity: number;
    assignedDate: string;
  }>;
};

interface EmployeesStore {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  getNextEmployeeId: () => string;
}

const initialEmployees: Employee[] = [
  {
    id: "EMP-1001",
    name: "Safeeq",
    phone: "9876543210",
    role: "Senior Technician",
    branch: ["Kochi"],
    performance: "92%",
    clockIn: "09:00 AM",
    clockOut: "06:30 PM",
    totalHours: 9.5,
    serviceHours: 7.5,
    breakHours: 1,
    idleHours: 1,
    servicesCompleted: 3,
    avgServiceTime: 2.5,
    captain: "Suresh Babu",
    inventoryItems: [
      { itemName: "Cleaning Solution - 5L", quantity: 2, assignedDate: "2026-04-10" },
      { itemName: "Microfiber Cloth Set", quantity: 5, assignedDate: "2026-04-10" },
      { itemName: "Spray Bottle", quantity: 3, assignedDate: "2026-04-12" },
    ],
  },
  {
    id: "EMP-1002",
    name: "Rajesh",
    phone: "9876543211",
    role: "Technician",
    branch: ["Calicut"],
    projects: 2,
    cashBalance: "₹ 2,100",
    performance: "88%",
    clockIn: "09:15 AM",
    clockOut: "06:00 PM",
    totalHours: 8.75,
    serviceHours: 6.5,
    breakHours: 1.5,
    idleHours: 0.75,
    servicesCompleted: 2,
    avgServiceTime: 3.25,
    captain: "Deepak Menon",
    inventoryItems: [
      { itemName: "Vacuum Cleaner", quantity: 1, assignedDate: "2026-04-08" },
      { itemName: "Mop & Bucket", quantity: 1, assignedDate: "2026-04-08" },
      { itemName: "Disinfectant Spray", quantity: 4, assignedDate: "2026-04-11" },
    ],
  },
  {
    id: "EMP-1003",
    name: "Arun",
    phone: "9876543212",
    role: "Technician",
    branch: ["Kochi"],
    projects: 2,
    cashBalance: "₹ 950",
    performance: "85%",
    clockIn: "09:30 AM",
    clockOut: "05:45 PM",
    totalHours: 8.25,
    serviceHours: 5.5,
    breakHours: 1.5,
    idleHours: 1.25,
    servicesCompleted: 2,
    avgServiceTime: 2.75,
    captain: "Suresh Babu",
    inventoryItems: [
      { itemName: "Floor Cleaner - 2L", quantity: 3, assignedDate: "2026-04-09" },
      { itemName: "Scrub Brush", quantity: 2, assignedDate: "2026-04-09" },
    ],
  },
  {
    id: "EMP-1004",
    name: "Vikram",
    phone: "9876543213",
    role: "Junior Technician",
    branch: ["Thrissur"],
    projects: 1,
    cashBalance: "₹ 0",
    performance: "78%",
    clockIn: "10:00 AM",
    clockOut: "05:30 PM",
    totalHours: 7.5,
    serviceHours: 4.5,
    breakHours: 1.5,
    idleHours: 1.5,
    servicesCompleted: 1,
    avgServiceTime: 4.5,
    captain: "Biju George",
    inventoryItems: [
      { itemName: "Gloves - Box of 50", quantity: 1, assignedDate: "2026-04-13" },
      { itemName: "Trash Bags - Roll", quantity: 2, assignedDate: "2026-04-13" },
    ],
  },
  { id: "EMP-1005", name: "Priya Nair", phone: "9876543214", role: "Technician", branch: ["Kochi"], projects: 3, cashBalance: "₹ 1,200", performance: "90%", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: 9, serviceHours: 7, breakHours: 1, idleHours: 1, servicesCompleted: 3, avgServiceTime: 2.3, captain: "Suresh Babu", inventoryItems: [{ itemName: "Window Cleaner", quantity: 2, assignedDate: "2026-04-10" }, { itemName: "Squeegee", quantity: 1, assignedDate: "2026-04-10" }] },
  { id: "EMP-1006", name: "Suresh Babu", phone: "9876543215", role: "Senior Technician", branch: ["Calicut", "Thrissur"], projects: 4, cashBalance: "₹ 3,400", performance: "94%", clockIn: "08:45 AM", clockOut: "06:15 PM", totalHours: 9.5, serviceHours: 8, breakHours: 1, idleHours: 0.5, servicesCompleted: 4, avgServiceTime: 2 },
  { id: "EMP-1007", name: "Meena Krishnan", phone: "9876543216", role: "Technician", branch: ["Thrissur"], projects: 2, cashBalance: "₹ 800", performance: "82%", clockIn: "09:30 AM", clockOut: "05:30 PM", totalHours: 8, serviceHours: 6, breakHours: 1.5, idleHours: 0.5, servicesCompleted: 2, avgServiceTime: 3, captain: "Biju George" },
  { id: "EMP-1008", name: "Rajan Thomas", phone: "9876543217", role: "Junior Technician", branch: ["Trivandrum"], projects: 1, cashBalance: "₹ 0", performance: "75%", clockIn: "10:00 AM", clockOut: "05:00 PM", totalHours: 7, serviceHours: 4, breakHours: 2, idleHours: 1, servicesCompleted: 1, avgServiceTime: 4, captain: "Prasad Nair" },
  { id: "EMP-1009", name: "Anitha Raj", phone: "9876543218", role: "Technician", branch: ["Kochi", "Calicut"], projects: 3, cashBalance: "₹ 2,200", performance: "88%", clockIn: "09:15 AM", clockOut: "06:00 PM", totalHours: 8.75, serviceHours: 6.5, breakHours: 1.5, idleHours: 0.75, servicesCompleted: 3, avgServiceTime: 2.2, captain: "Deepak Menon" },
  { id: "EMP-1010", name: "Deepak Menon", phone: "9876543219", role: "Senior Technician", branch: ["Calicut"], projects: 5, cashBalance: "₹ 4,100", performance: "96%", clockIn: "08:30 AM", clockOut: "06:30 PM", totalHours: 10, serviceHours: 8.5, breakHours: 1, idleHours: 0.5, servicesCompleted: 5, avgServiceTime: 1.7 },
  { id: "EMP-1011", name: "Kavitha Pillai", phone: "9876543220", role: "Technician", branch: ["Thrissur"], projects: 2, cashBalance: "₹ 1,500", performance: "83%", clockIn: "09:00 AM", clockOut: "05:45 PM", totalHours: 8.75, serviceHours: 6, breakHours: 1.5, idleHours: 1.25, servicesCompleted: 2, avgServiceTime: 3, captain: "Biju George" },
  { id: "EMP-1012", name: "Manoj Kumar", phone: "9876543221", role: "Junior Technician", branch: ["Trivandrum"], projects: 1, cashBalance: "₹ 500", performance: "77%", clockIn: "09:45 AM", clockOut: "05:15 PM", totalHours: 7.5, serviceHours: 4.5, breakHours: 2, idleHours: 1, servicesCompleted: 1, avgServiceTime: 4.5, captain: "Prasad Nair" },
  { id: "EMP-1013", name: "Sreeja Varma", phone: "9876543222", role: "Technician", branch: ["Kochi"], projects: 3, cashBalance: "₹ 1,800", performance: "87%", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: 9, serviceHours: 7, breakHours: 1, idleHours: 1, servicesCompleted: 3, avgServiceTime: 2.3, captain: "Suresh Babu" },
  { id: "EMP-1014", name: "Biju George", phone: "9876543223", role: "Senior Technician", branch: ["Palakkad", "Thrissur"], projects: 4, cashBalance: "₹ 3,000", performance: "91%", clockIn: "08:45 AM", clockOut: "06:15 PM", totalHours: 9.5, serviceHours: 7.5, breakHours: 1.5, idleHours: 0.5, servicesCompleted: 4, avgServiceTime: 1.9 },
  { id: "EMP-1015", name: "Nisha Mohan", phone: "9876543224", role: "Technician", branch: ["Calicut"], projects: 2, cashBalance: "₹ 900", performance: "80%", clockIn: "09:30 AM", clockOut: "05:30 PM", totalHours: 8, serviceHours: 5.5, breakHours: 1.5, idleHours: 1, servicesCompleted: 2, avgServiceTime: 2.75, captain: "Deepak Menon" },
  { id: "EMP-1016", name: "Ajith Soman", phone: "9876543225", role: "Junior Technician", branch: ["Thrissur"], projects: 1, cashBalance: "₹ 200", performance: "74%", clockIn: "10:00 AM", clockOut: "05:00 PM", totalHours: 7, serviceHours: 4, breakHours: 2, idleHours: 1, servicesCompleted: 1, avgServiceTime: 4, captain: "Biju George" },
  { id: "EMP-1017", name: "Reshma Das", phone: "9876543226", role: "Technician", branch: ["Trivandrum"], projects: 3, cashBalance: "₹ 2,000", performance: "86%", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: 9, serviceHours: 6.5, breakHours: 1.5, idleHours: 1, servicesCompleted: 3, avgServiceTime: 2.2, captain: "Prasad Nair" },
  { id: "EMP-1018", name: "Santhosh Pillai", phone: "9876543227", role: "Senior Technician", branch: ["Kochi", "Trivandrum"], projects: 4, cashBalance: "₹ 3,600", performance: "93%", clockIn: "08:30 AM", clockOut: "06:30 PM", totalHours: 10, serviceHours: 8, breakHours: 1, idleHours: 1, servicesCompleted: 4, avgServiceTime: 2 },
  { id: "EMP-1019", name: "Divya Nambiar", phone: "9876543228", role: "Technician", branch: ["Palakkad"], projects: 2, cashBalance: "₹ 1,100", performance: "84%", clockIn: "09:15 AM", clockOut: "05:45 PM", totalHours: 8.5, serviceHours: 6, breakHours: 1.5, idleHours: 1, servicesCompleted: 2, avgServiceTime: 3, captain: "Biju George" },
  { id: "EMP-1020", name: "Vineeth Rajan", phone: "9876543229", role: "Junior Technician", branch: ["Calicut"], projects: 1, cashBalance: "₹ 300", performance: "76%", clockIn: "09:45 AM", clockOut: "05:15 PM", totalHours: 7.5, serviceHours: 4.5, breakHours: 2, idleHours: 1, servicesCompleted: 1, avgServiceTime: 4.5, captain: "Deepak Menon" },
  { id: "EMP-1021", name: "Lekha Suresh", phone: "9876543230", role: "Technician", branch: ["Thrissur"], projects: 3, cashBalance: "₹ 1,700", performance: "89%", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: 9, serviceHours: 7, breakHours: 1, idleHours: 1, servicesCompleted: 3, avgServiceTime: 2.3, captain: "Biju George" },
  { id: "EMP-1022", name: "Prasad Nair", phone: "9876543231", role: "Senior Technician", branch: ["Trivandrum"], projects: 5, cashBalance: "₹ 4,500", performance: "95%", clockIn: "08:30 AM", clockOut: "06:30 PM", totalHours: 10, serviceHours: 8.5, breakHours: 1, idleHours: 0.5, servicesCompleted: 5, avgServiceTime: 1.7 },
  { id: "EMP-1023", name: "Geetha Krishnan", phone: "9876543232", role: "Technician", branch: ["Kochi"], projects: 2, cashBalance: "₹ 1,300", performance: "81%", clockIn: "09:30 AM", clockOut: "05:30 PM", totalHours: 8, serviceHours: 5.5, breakHours: 1.5, idleHours: 1, servicesCompleted: 2, avgServiceTime: 2.75, captain: "Suresh Babu" },
  { id: "EMP-1024", name: "Rahul Menon", phone: "9876543233", role: "Junior Technician", branch: ["Palakkad"], projects: 1, cashBalance: "₹ 400", performance: "79%", clockIn: "10:00 AM", clockOut: "05:30 PM", totalHours: 7.5, serviceHours: 5, breakHours: 1.5, idleHours: 1, servicesCompleted: 1, avgServiceTime: 5, captain: "Biju George" },
];

export const useEmployeesStore = create<EmployeesStore>()(
  persist(
    (set, get) => ({
      employees: initialEmployees,

      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, employee],
        })),

      updateEmployee: (id, updates) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),

      getEmployee: (id) => get().employees.find((e) => e.id === id),

      getNextEmployeeId: () => {
        const nums = get()
          .employees.map((e) => Number(e.id.split("-")[1]))
          .filter((n) => Number.isFinite(n));
        const nextNum = (nums.length ? Math.max(...nums) : 1000) + 1;
        return `EMP-${nextNum}`;
      },
    }),
    { name: "employees-store", version: 0 },
  ),
);