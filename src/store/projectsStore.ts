import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkOrderStatus = "Open" | "Scheduled" | "Completed";

export type ExecutiveSignature = {
  name: string;
  signedAt: string;
};

export type CustomerConfirmationMethod = "Signature" | "OTP";

export type CustomerConfirmation = {
  method: CustomerConfirmationMethod;
  confirmedAt: string;
  otpCode?: string;
  customerName?: string;
};

export type WorkOrder = {
  id: string;
  customer: string;
  address: string;
  siteAddress?: string;
  billingAddress?: string;
  workOrderDateTime?: string;
  salesExecutive?: string;
  subject?: string;
  reference?: string;
  period?: string;
  preferredServiceDateTimes?: string;
  termsAndConditions?: string;
  executiveSignature?: ExecutiveSignature;
  customerConfirmation?: CustomerConfirmation;
  start: string;
  end: string;
  status: WorkOrderStatus;
  phone: string;
  email: string;
  serviceType: string;
  frequency: string;
  totalValue: string;
  paidAmount: string;
  nextService: string;
  assignedTech: string;
  notes: string;
  leadId?: number;
};

interface ProjectsStore {
  workOrders: WorkOrder[];
  addWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
  getWorkOrder: (id: string) => WorkOrder | undefined;
  getWorkOrdersByStatus: (status: WorkOrderStatus) => WorkOrder[];
  getNextWorkOrderId: () => string;
}

const initialWorkOrders: WorkOrder[] = [
  {
    id: "WO-1025",
    customer: "Kumar",
    address: "Tambaram, Chennai",
    siteAddress: "Tambaram, Chennai",
    billingAddress: "Tambaram, Chennai",
    workOrderDateTime: "2026-02-01T10:00:00.000Z",
    salesExecutive: "—",
    subject: "Cockroach Control (AMC)",
    reference: "REF-WO-1025",
    period: "Feb 1, 2026 - Jan 31, 2027",
    preferredServiceDateTimes: "Weekdays • Morning",
    termsAndConditions: "Standard terms apply.",
    start: "Feb 1, 2026",
    end: "Jan 31, 2027",
    status: "Scheduled",
    phone: "9876543210",
    email: "kumar@email.com",
    serviceType: "Cockroach Control (AMC - 4/Year)",
    frequency: "Quarterly",
    totalValue: "₹ 12,000",
    paidAmount: "₹ 4,000",
    nextService: "Mar 15, 2026",
    assignedTech: "Mani",
    notes: "Residential apartment treatment. Customer prefers morning slots."
  },
  {
    id: "WO-1026",
    customer: "Lakshmi Stores",
    address: "12 MG Road, Coimbatore",
    siteAddress: "12 MG Road, Coimbatore",
    billingAddress: "12 MG Road, Coimbatore",
    workOrderDateTime: "2026-03-10T09:30:00.000Z",
    salesExecutive: "—",
    subject: "Termite Control (One-Time)",
    reference: "REF-WO-1026",
    period: "Mar 10, 2026",
    preferredServiceDateTimes: "Avoid 10 AM - 6 PM",
    termsAndConditions: "Standard terms apply.",
    start: "Mar 10, 2026",
    end: "Mar 10, 2026",
    status: "Open",
    phone: "9876543211",
    email: "lakshmi.stores@email.com",
    serviceType: "Termite Control (One-Time)",
    frequency: "One-Time",
    totalValue: "₹ 8,000",
    paidAmount: "₹ 0",
    nextService: "Unassigned",
    assignedTech: "Unassigned",
    notes: "Store perimeter treatment. Avoid peak business hours (10 AM - 6 PM)."
  },
  {
    id: "WO-1027",
    customer: "Hotel Grand",
    address: "Beach Road, Calicut",
    siteAddress: "Beach Road, Calicut",
    billingAddress: "Beach Road, Calicut",
    workOrderDateTime: "2026-01-15T11:00:00.000Z",
    salesExecutive: "—",
    subject: "Bed Bug Treatment (AMC)",
    reference: "REF-WO-1027",
    period: "Jan 15, 2026 - Jan 15, 2027",
    preferredServiceDateTimes: "Monthly • Afternoon",
    termsAndConditions: "Standard terms apply.",
    start: "Jan 15, 2026",
    end: "Jan 15, 2027",
    status: "Scheduled",
    phone: "9876543212",
    email: "manager@hotelgrand.com",
    serviceType: "Bed Bug Treatment (AMC - Monthly)",
    frequency: "Monthly",
    totalValue: "₹ 96,000",
    paidAmount: "₹ 48,000",
    nextService: "Mar 20, 2026",
    assignedTech: "Safeeq",
    notes: "Full hotel treatment including kitchen, rooms, and common areas."
  }
];

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      workOrders: initialWorkOrders,
      
      addWorkOrder: (workOrder) => set((state) => ({
        workOrders: [...state.workOrders, workOrder]
      })),
      
      updateWorkOrder: (id, updates) => set((state) => ({
        workOrders: state.workOrders.map(wo => wo.id === id ? { ...wo, ...updates } : wo)
      })),
      
      deleteWorkOrder: (id) => set((state) => ({
        workOrders: state.workOrders.filter(wo => wo.id !== id)
      })),
      
      getWorkOrder: (id) => get().workOrders.find(wo => wo.id === id),
      
      getWorkOrdersByStatus: (status) => get().workOrders.filter(wo => wo.status === status),
      
      getNextWorkOrderId: () => {
        const ids = get().workOrders.map(wo => parseInt(wo.id.split('-')[1]));
        const nextNum = Math.max(...ids, 1024) + 1;
        return `WO-${nextNum}`;
      }
    }),
    {
      name: 'projects-store',
      version: 2,
      migrate: (persistedState: unknown) => {
        if (
          typeof persistedState === "object" &&
          persistedState !== null &&
          "workOrders" in persistedState &&
          Array.isArray((persistedState as { workOrders?: unknown }).workOrders)
        ) {
          const state = persistedState as { workOrders: Array<Partial<WorkOrder>> };
          const migrated = state.workOrders.map((wo, idx) => ({
            id: typeof wo.id === "string" ? wo.id : `WO-${idx + 1}`,
            customer: typeof wo.customer === "string" ? wo.customer : "",
            address: typeof wo.address === "string" ? wo.address : "",
            siteAddress: typeof wo.siteAddress === "string" ? wo.siteAddress : typeof wo.address === "string" ? wo.address : "",
            billingAddress: typeof wo.billingAddress === "string" ? wo.billingAddress : "",
            workOrderDateTime: typeof wo.workOrderDateTime === "string" ? wo.workOrderDateTime : undefined,
            salesExecutive: typeof wo.salesExecutive === "string" ? wo.salesExecutive : undefined,
            subject: typeof wo.subject === "string" ? wo.subject : undefined,
            reference: typeof wo.reference === "string" ? wo.reference : undefined,
            period: typeof wo.period === "string" ? wo.period : undefined,
            preferredServiceDateTimes: typeof wo.preferredServiceDateTimes === "string" ? wo.preferredServiceDateTimes : undefined,
            termsAndConditions: typeof wo.termsAndConditions === "string" ? wo.termsAndConditions : undefined,
            executiveSignature: wo.executiveSignature as ExecutiveSignature | undefined,
            customerConfirmation: wo.customerConfirmation as CustomerConfirmation | undefined,
            start: typeof wo.start === "string" ? wo.start : "",
            end: typeof wo.end === "string" ? wo.end : "",
            status: wo.status === "Open" || wo.status === "Scheduled" || wo.status === "Completed" ? wo.status : "Open",
            phone: typeof wo.phone === "string" ? wo.phone : "",
            email: typeof wo.email === "string" ? wo.email : "",
            serviceType: typeof wo.serviceType === "string" ? wo.serviceType : "",
            frequency: typeof wo.frequency === "string" ? wo.frequency : "",
            totalValue: typeof wo.totalValue === "string" ? wo.totalValue : "₹ 0",
            paidAmount: typeof wo.paidAmount === "string" ? wo.paidAmount : "₹ 0",
            nextService: typeof wo.nextService === "string" ? wo.nextService : "Unassigned",
            assignedTech: typeof wo.assignedTech === "string" ? wo.assignedTech : "Unassigned",
            notes: typeof wo.notes === "string" ? wo.notes : "",
            leadId: typeof wo.leadId === "number" ? wo.leadId : undefined,
          }));
          return { workOrders: migrated.length ? migrated : initialWorkOrders };
        }
        return { workOrders: initialWorkOrders };
      },
    }
  )
);
