import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AttachmentKind = "Photo" | "Video" | "Audio" | "Document";

export type Attachment = {
  id: string;
  name: string;
  kind: AttachmentKind;
};

export type DigitalSignature = {
  name: string;
  signedAt: string;
};

export type PaymentMode = "Cash" | "Card" | "UPI" | "Bank Transfer" | "Other";

export type PaymentDetails = {
  mode: PaymentMode;
  amount: number | null;
  regularBilling: boolean;
};

export type ServiceAppointment = {
  id: string;
  workOrderId: string;
  date: string;
  time: string;
  employeeId: string;
  employeeName: string;
  inTime?: string;
  outTime?: string;
  subject?: string;
  salesExecutive?: string;
  refNo?: string;
  warrantyPeriod?: string;
  unitPrice?: string;
  state?: string;
  gst?: string;
  igst?: string;
  cgst?: string;
  technicians?: string[];
  serviceDescription?: string;
  customerSignature?: DigitalSignature;
  technicianSignature?: DigitalSignature;
  payment?: PaymentDetails;
  beforeProof?: Attachment[];
  afterProof?: Attachment[];
  instructions: string;
  tasks: Task[];
  status: "Scheduled" | "Unscheduled" | "Completed" | "Cancelled";
  completedAt?: string;
  completionNotes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  profilePhoto?: string;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  closingDateTime?: string;
  attachments?: Attachment[];
  branch?: string;
  staff?: string;
};

interface ServicesStore {
  appointments: ServiceAppointment[];
  addAppointment: (appointment: ServiceAppointment) => void;
  updateAppointment: (id: string, updates: Partial<ServiceAppointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointment: (id: string) => ServiceAppointment | undefined;
  getAppointmentsByWorkOrder: (workOrderId: string) => ServiceAppointment[];
  getNextAppointmentId: () => string;
}

const initialAppointments: ServiceAppointment[] = [
  {
    id: "SA-1",
    workOrderId: "WO-1025",
    date: "2026-03-15",
    time: "10:30",
    employeeId: "Safeeq",
    employeeName: "Safeeq",
    subject: "Cockroach Control Visit 1",
    salesExecutive: "—",
    refNo: "REF-1001",
    warrantyPeriod: "3 Months",
    technicians: ["Safeeq"],
    serviceDescription: "Inspection + treatment for kitchen and wash areas.",
    payment: { mode: "UPI", amount: 4000, regularBilling: true },
    instructions: "Customer prefers morning slot. Carry gel bait.",
    tasks: [
      { id: "TSK-1", title: "Inspect affected areas", completed: true, closingDateTime: "2026-03-15T11:30:00.000Z", branch: "Kochi", staff: "Safeeq" },
      { id: "TSK-2", title: "Apply treatment", completed: false, closingDateTime: "2026-03-15T12:00:00.000Z", branch: "Kochi", staff: "Safeeq" },
    ],
    status: "Scheduled",
  },
  {
    id: "SA-2",
    workOrderId: "WO-1027",
    date: "2026-03-20",
    time: "14:00",
    employeeId: "Rajesh",
    employeeName: "Rajesh",
    subject: "Bed Bug Service",
    salesExecutive: "—",
    refNo: "REF-1002",
    warrantyPeriod: "1 Year",
    technicians: ["Rajesh"],
    serviceDescription: "Hotel rooms + kitchen check. Coordinate with manager.",
    instructions: "Hotel rooms + kitchen check. Coordinate with manager.",
    tasks: [{ id: "TSK-3", title: "Capture before/after photos", completed: false, branch: "Calicut", staff: "Rajesh" }],
    status: "Scheduled",
  },
  {
    id: "SA-3",
    workOrderId: "WO-1026",
    date: "2026-03-10",
    time: "16:30",
    employeeId: "Arun",
    employeeName: "Arun",
    subject: "Termite Control One-Time",
    salesExecutive: "—",
    refNo: "REF-1003",
    warrantyPeriod: "6 Months",
    inTime: "16:35",
    outTime: "18:10",
    technicians: ["Arun"],
    serviceDescription: "Perimeter inspection + termiticide application.",
    completionNotes: "All tasks done. Customer advised on prevention.",
    customerSignature: { name: "Customer", signedAt: "2026-03-10T18:12:00.000Z" },
    technicianSignature: { name: "Arun", signedAt: "2026-03-10T18:11:00.000Z" },
    beforeProof: [{ id: "ATT-1", name: "before.jpg", kind: "Photo" }],
    afterProof: [{ id: "ATT-2", name: "after.jpg", kind: "Photo" }],
    instructions: "Avoid peak hours (10 AM - 6 PM). Focus perimeter.",
    tasks: [
      { id: "TSK-4", title: "Perimeter inspection", completed: true },
      { id: "TSK-5", title: "Termiticide application", completed: true },
    ],
    status: "Completed",
    completedAt: "2026-03-10T18:15:00.000Z",
  },
  // WO-1002 - Praveen Kumar - Termite Control (Completed)
  {
    id: "SA-4",
    workOrderId: "WO-1002",
    date: "2026-02-05",
    time: "09:00",
    employeeId: "EMP-1001",
    employeeName: "Safeeq",
    inTime: "09:05",
    outTime: "12:30",
    subject: "Termite Control - Wood Treatment",
    salesExecutive: "Ravi",
    refNo: "REF-WO-1002",
    warrantyPeriod: "6 Months",
    unitPrice: "₹ 6,500",
    state: "Kerala",
    gst: "18%",
    cgst: "9%",
    igst: "0%",
    technicians: ["Safeeq"],
    serviceDescription: "Complete wood treatment for furniture and flooring. Applied termiticide solution to all wooden surfaces.",
    customerSignature: { name: "Praveen Kumar", signedAt: "2026-02-05T12:35:00.000Z" },
    technicianSignature: { name: "Safeeq", signedAt: "2026-02-05T12:33:00.000Z" },
    payment: { mode: "UPI", amount: 6500, regularBilling: false },
    beforeProof: [
      { id: "ATT-4", name: "termite_damage_before.jpg", kind: "Photo" },
      { id: "ATT-5", name: "furniture_inspection.jpg", kind: "Photo" }
    ],
    afterProof: [
      { id: "ATT-6", name: "treatment_complete.jpg", kind: "Photo" },
      { id: "ATT-7", name: "treated_areas.jpg", kind: "Photo" }
    ],
    instructions: "Weekend morning slot. Focus on furniture and flooring.",
    tasks: [
      { id: "TSK-6", title: "Inspect all wooden surfaces", completed: true, closingDateTime: "2026-02-05T09:45:00.000Z", branch: "Kochi", staff: "Safeeq" },
      { id: "TSK-7", title: "Apply termiticide solution", completed: true, closingDateTime: "2026-02-05T11:30:00.000Z", branch: "Kochi", staff: "Safeeq" },
      { id: "TSK-8", title: "Document treated areas", completed: true, closingDateTime: "2026-02-05T12:15:00.000Z", branch: "Kochi", staff: "Safeeq" },
    ],
    status: "Completed",
    completedAt: "2026-02-05T12:30:00.000Z",
    completionNotes: "All wooden furniture and flooring treated successfully. Customer advised to avoid water contact for 24 hours. Follow-up inspection scheduled after 3 months.",
  },
  // WO-1007 - Hotel Grand - Rodent Control (Completed)
  {
    id: "SA-5",
    workOrderId: "WO-1007",
    date: "2026-03-05",
    time: "14:00",
    employeeId: "EMP-1001",
    employeeName: "Safeeq",
    inTime: "14:10",
    outTime: "17:45",
    subject: "Rodent Control - Basement & Storage",
    salesExecutive: "Anand",
    refNo: "REF-WO-1007",
    warrantyPeriod: "3 Months",
    unitPrice: "₹ 5,000",
    state: "Kerala",
    gst: "18%",
    cgst: "9%",
    igst: "0%",
    technicians: ["Safeeq", "Rajesh"],
    serviceDescription: "Comprehensive rodent control for hotel basement and storage areas. Installed bait stations and sealed entry points.",
    customerSignature: { name: "Hotel Manager", signedAt: "2026-03-05T17:50:00.000Z" },
    technicianSignature: { name: "Safeeq", signedAt: "2026-03-05T17:48:00.000Z" },
    payment: { mode: "Bank Transfer", amount: 5000, regularBilling: false },
    beforeProof: [
      { id: "ATT-8", name: "rodent_evidence.jpg", kind: "Photo" },
      { id: "ATT-9", name: "entry_points.jpg", kind: "Photo" },
      { id: "ATT-10", name: "storage_area.jpg", kind: "Photo" }
    ],
    afterProof: [
      { id: "ATT-11", name: "bait_stations_installed.jpg", kind: "Photo" },
      { id: "ATT-12", name: "sealed_entry_points.jpg", kind: "Photo" },
      { id: "ATT-13", name: "treatment_complete_storage.jpg", kind: "Photo" }
    ],
    instructions: "Afternoon slot. Coordinate with hotel manager. Focus on basement and storage.",
    tasks: [
      { id: "TSK-9", title: "Inspect basement and storage areas", completed: true, closingDateTime: "2026-03-05T14:50:00.000Z", branch: "Calicut", staff: "Safeeq" },
      { id: "TSK-10", title: "Install rodent bait stations", completed: true, closingDateTime: "2026-03-05T16:00:00.000Z", branch: "Calicut", staff: "Safeeq" },
      { id: "TSK-11", title: "Seal entry points", completed: true, closingDateTime: "2026-03-05T17:00:00.000Z", branch: "Calicut", staff: "Rajesh" },
      { id: "TSK-12", title: "Document all work", completed: true, closingDateTime: "2026-03-05T17:30:00.000Z", branch: "Calicut", staff: "Safeeq" },
    ],
    status: "Completed",
    completedAt: "2026-03-05T17:45:00.000Z",
    completionNotes: "Installed 12 bait stations in strategic locations. Sealed 8 entry points. Hotel staff briefed on monitoring procedures. Follow-up visit recommended after 2 weeks.",
  },
  // WO-1009 - Lakshmi Stores - Termite Control (Completed)
  {
    id: "SA-6",
    workOrderId: "WO-1009",
    date: "2026-01-20",
    time: "08:00",
    employeeId: "EMP-1001",
    employeeName: "Mani",
    inTime: "08:05",
    outTime: "11:20",
    subject: "Termite Control - Store Perimeter",
    salesExecutive: "Priya",
    refNo: "REF-WO-1009",
    warrantyPeriod: "6 Months",
    unitPrice: "₹ 8,000",
    state: "Kerala",
    gst: "18%",
    cgst: "9%",
    igst: "0%",
    technicians: ["Mani"],
    serviceDescription: "Store perimeter treatment and wooden shelving protection. Applied anti-termite barrier around the building.",
    customerSignature: { name: "Lakshmi", signedAt: "2026-01-20T11:25:00.000Z" },
    technicianSignature: { name: "Mani", signedAt: "2026-01-20T11:23:00.000Z" },
    payment: { mode: "Cash", amount: 8000, regularBilling: false },
    beforeProof: [
      { id: "ATT-14", name: "store_perimeter_before.jpg", kind: "Photo" },
      { id: "ATT-15", name: "wooden_shelves_inspection.jpg", kind: "Photo" }
    ],
    afterProof: [
      { id: "ATT-16", name: "perimeter_treated.jpg", kind: "Photo" },
      { id: "ATT-17", name: "shelves_protected.jpg", kind: "Photo" },
      { id: "ATT-18", name: "barrier_complete.jpg", kind: "Photo" }
    ],
    instructions: "Early morning before store opens. Avoid peak hours.",
    tasks: [
      { id: "TSK-13", title: "Inspect store perimeter", completed: true, closingDateTime: "2026-01-20T08:30:00.000Z", branch: "Ernakulam", staff: "Mani" },
      { id: "TSK-14", title: "Treat wooden shelving", completed: true, closingDateTime: "2026-01-20T09:45:00.000Z", branch: "Ernakulam", staff: "Mani" },
      { id: "TSK-15", title: "Apply perimeter barrier", completed: true, closingDateTime: "2026-01-20T11:00:00.000Z", branch: "Ernakulam", staff: "Mani" },
    ],
    status: "Completed",
    completedAt: "2026-01-20T11:20:00.000Z",
    completionNotes: "Complete perimeter treatment applied. All wooden shelving treated with anti-termite solution. Store owner advised on maintenance. No disruption to business operations.",
  },
  // WO-1011 - Lakshmi Stores - Rat Control (Completed)
  {
    id: "SA-7",
    workOrderId: "WO-1011",
    date: "2026-03-08",
    time: "07:00",
    employeeId: "EMP-1001",
    employeeName: "Mani",
    inTime: "07:05",
    outTime: "09:30",
    subject: "Rat Control - Warehouse Treatment",
    salesExecutive: "Priya",
    refNo: "REF-WO-1011",
    warrantyPeriod: "3 Months",
    unitPrice: "₹ 4,500",
    state: "Kerala",
    gst: "18%",
    cgst: "9%",
    igst: "0%",
    technicians: ["Mani"],
    serviceDescription: "Warehouse and storage area rodent control. Installed traps and bait stations in key locations.",
    customerSignature: { name: "Lakshmi", signedAt: "2026-03-08T09:35:00.000Z" },
    technicianSignature: { name: "Mani", signedAt: "2026-03-08T09:33:00.000Z" },
    payment: { mode: "Cash", amount: 4500, regularBilling: false },
    beforeProof: [
      { id: "ATT-19", name: "warehouse_inspection.jpg", kind: "Photo" },
      { id: "ATT-20", name: "rodent_droppings.jpg", kind: "Photo" }
    ],
    afterProof: [
      { id: "ATT-21", name: "traps_installed.jpg", kind: "Photo" },
      { id: "ATT-22", name: "bait_stations_warehouse.jpg", kind: "Photo" }
    ],
    instructions: "Very early morning. Complete before store opens at 9 AM.",
    tasks: [
      { id: "TSK-16", title: "Inspect warehouse area", completed: true, closingDateTime: "2026-03-08T07:30:00.000Z", branch: "Ernakulam", staff: "Mani" },
      { id: "TSK-17", title: "Install rodent traps", completed: true, closingDateTime: "2026-03-08T08:30:00.000Z", branch: "Ernakulam", staff: "Mani" },
      { id: "TSK-18", title: "Set up bait stations", completed: true, closingDateTime: "2026-03-08T09:15:00.000Z", branch: "Ernakulam", staff: "Mani" },
    ],
    status: "Completed",
    completedAt: "2026-03-08T09:30:00.000Z",
    completionNotes: "Installed 8 traps and 6 bait stations in warehouse. All entry points identified and documented. Staff trained on monitoring. Weekly check recommended for first month.",
  },
];

export const useServicesStore = create<ServicesStore>()(
  persist(
    (set, get) => ({
      appointments: initialAppointments,
      
      addAppointment: (appointment) => set((state) => ({
        appointments: [...state.appointments, appointment]
      })),
      
      updateAppointment: (id, updates) => set((state) => ({
        appointments: state.appointments.map(apt => apt.id === id ? { ...apt, ...updates } : apt)
      })),
      
      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter(apt => apt.id !== id)
      })),
      
      getAppointment: (id) => get().appointments.find(apt => apt.id === id),
      
      getAppointmentsByWorkOrder: (workOrderId) => 
        get().appointments.filter(apt => apt.workOrderId === workOrderId),
      
      getNextAppointmentId: () => {
        const ids = get()
          .appointments
          .map((apt) => Number(apt.id.split("-")[1]))
          .filter((n) => Number.isFinite(n));
        const nextNum = (ids.length ? Math.max(...ids) : 0) + 1;
        return `SA-${nextNum}`;
      }
    }),
    {
      name: 'services-store',
      version: 3,
      migrate: (persistedState: unknown) => {
        if (
          typeof persistedState === "object" &&
          persistedState !== null &&
          "appointments" in persistedState &&
          Array.isArray((persistedState as { appointments?: unknown }).appointments)
        ) {
          const state = persistedState as { appointments: Array<Partial<ServiceAppointment>> };
          const migratedAppointments: ServiceAppointment[] = state.appointments.map((a, idx) => {
            const status =
              a.status === "Scheduled" || a.status === "Unscheduled" || a.status === "Completed" || a.status === "Cancelled"
                ? a.status
                : "Scheduled";
            const tasks = Array.isArray(a.tasks)
              ? a.tasks.map((t) => ({
                  id: typeof t.id === "string" ? t.id : `TSK-${Date.now()}-${Math.random()}`,
                  title: typeof t.title === "string" ? t.title : "",
                  completed: Boolean(t.completed),
                  closingDateTime: typeof (t as Task).closingDateTime === "string" ? (t as Task).closingDateTime : undefined,
                  attachments: Array.isArray((t as Task).attachments) ? (t as Task).attachments : undefined,
                  branch: typeof (t as Task).branch === "string" ? (t as Task).branch : undefined,
                  staff: typeof (t as Task).staff === "string" ? (t as Task).staff : undefined,
                }))
              : [];
            return {
              id: typeof a.id === "string" ? a.id : `SA-${idx + 1}`,
              workOrderId: typeof a.workOrderId === "string" ? a.workOrderId : "",
              date: typeof a.date === "string" ? a.date : "",
              time: typeof a.time === "string" ? a.time : "",
              employeeId: typeof a.employeeId === "string" ? a.employeeId : "",
              employeeName: typeof a.employeeName === "string" ? a.employeeName : "",
              inTime: typeof a.inTime === "string" ? a.inTime : undefined,
              outTime: typeof a.outTime === "string" ? a.outTime : undefined,
              subject: typeof a.subject === "string" ? a.subject : undefined,
              salesExecutive: typeof a.salesExecutive === "string" ? a.salesExecutive : undefined,
              refNo: typeof a.refNo === "string" ? a.refNo : undefined,
              warrantyPeriod: typeof a.warrantyPeriod === "string" ? a.warrantyPeriod : undefined,
              technicians: Array.isArray(a.technicians) ? (a.technicians as string[]) : undefined,
              serviceDescription: typeof a.serviceDescription === "string" ? a.serviceDescription : undefined,
              customerSignature: a.customerSignature as DigitalSignature | undefined,
              technicianSignature: a.technicianSignature as DigitalSignature | undefined,
              payment: a.payment as PaymentDetails | undefined,
              beforeProof: Array.isArray(a.beforeProof) ? (a.beforeProof as Attachment[]) : undefined,
              afterProof: Array.isArray(a.afterProof) ? (a.afterProof as Attachment[]) : undefined,
              instructions: typeof a.instructions === "string" ? a.instructions : "",
              tasks,
              status,
              completedAt: typeof a.completedAt === "string" ? a.completedAt : undefined,
              completionNotes: typeof a.completionNotes === "string" ? a.completionNotes : undefined,
              cancelledAt: typeof a.cancelledAt === "string" ? a.cancelledAt : undefined,
              cancellationReason: typeof a.cancellationReason === "string" ? a.cancellationReason : undefined,
              profilePhoto: typeof a.profilePhoto === "string" ? a.profilePhoto : undefined,
            };
          });
          return { appointments: migratedAppointments.length ? migratedAppointments : initialAppointments };
        }
        return { appointments: initialAppointments };
      },
    }
  )
);
