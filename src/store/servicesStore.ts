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
            };
          });
          return { appointments: migratedAppointments.length ? migratedAppointments : initialAppointments };
        }
        return { appointments: initialAppointments };
      },
    }
  )
);
