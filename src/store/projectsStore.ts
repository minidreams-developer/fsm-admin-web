import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkOrderStatus = "Authorization Pending" | "Open" | "Scheduled" | "Completed" | "Converted";

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
  customerSignature?: string;
  start: string;
  end: string;
  status: WorkOrderStatus;
  phone: string;
  email: string;
  serviceType: string;
  serviceTypes?: string[];
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
  // Authorization Pending Work Orders
  {
    id: "WO-2001",
    customer: "Rajesh Menon",
    address: "45 Park Avenue, Trivandrum",
    siteAddress: "45 Park Avenue, Trivandrum",
    billingAddress: "45 Park Avenue, Trivandrum",
    workOrderDateTime: "2026-04-10T10:00:00.000Z",
    salesExecutive: "Anand",
    subject: "Comprehensive Pest Control (AMC)",
    reference: "REF-WO-2001",
    period: "Apr 10, 2026 - Apr 9, 2027",
    preferredServiceDateTimes: "Weekdays • Morning",
    termsAndConditions: "Standard terms apply. Payment terms: 50% advance, 50% on completion.",
    start: "Apr 10, 2026",
    end: "Apr 9, 2027",
    status: "Authorization Pending",
    phone: "9876543250",
    email: "rajesh.menon@email.com",
    serviceType: "Comprehensive Pest Control (AMC - Monthly)",
    frequency: "Monthly",
    totalValue: "₹ 36,000",
    paidAmount: "₹ 0",
    nextService: "Unassigned",
    assignedTech: "Unassigned",
    notes: "New customer. Requires authorization signature before proceeding."
  },
  {
    id: "WO-2002",
    customer: "Green Valley Resort",
    address: "Munnar Hills, Idukki",
    siteAddress: "Munnar Hills, Idukki",
    billingAddress: "Munnar Hills, Idukki",
    workOrderDateTime: "2026-04-12T09:00:00.000Z",
    salesExecutive: "Priya",
    subject: "Resort Pest Management Package",
    reference: "REF-WO-2002",
    period: "Apr 12, 2026 - Apr 11, 2027",
    preferredServiceDateTimes: "Early Morning • Before Guest Hours",
    termsAndConditions: "Premium service package. Includes all pest control services.",
    start: "Apr 12, 2026",
    end: "Apr 11, 2027",
    status: "Authorization Pending",
    phone: "9876543260",
    email: "manager@greenvalleyresort.com",
    serviceType: "Resort Pest Management (AMC - Bi-Weekly)",
    frequency: "Bi-Weekly",
    totalValue: "₹ 1,20,000",
    paidAmount: "₹ 0",
    nextService: "Unassigned",
    assignedTech: "Unassigned",
    notes: "Large resort property. Awaiting management signature for contract approval."
  },
  {
    id: "WO-2003",
    customer: "Tech Park Solutions",
    address: "InfoPark, Kochi",
    siteAddress: "InfoPark, Kochi",
    billingAddress: "InfoPark, Kochi",
    workOrderDateTime: "2026-04-15T14:00:00.000Z",
    salesExecutive: "Ravi",
    subject: "Office Complex Pest Control",
    reference: "REF-WO-2003",
    period: "Apr 15, 2026 - Apr 14, 2027",
    preferredServiceDateTimes: "Weekends • After Office Hours",
    termsAndConditions: "Corporate package with quarterly inspections.",
    start: "Apr 15, 2026",
    end: "Apr 14, 2027",
    status: "Authorization Pending",
    phone: "9876543270",
    email: "admin@techparksolutions.com",
    serviceType: "Office Pest Control (AMC - Quarterly)",
    frequency: "Quarterly",
    totalValue: "₹ 48,000",
    paidAmount: "₹ 0",
    nextService: "Unassigned",
    assignedTech: "Unassigned",
    notes: "Corporate client. Pending signature from facility manager."
  },
  {
    id: "WO-2004",
    customer: "Sunrise Apartments",
    address: "Marine Drive, Ernakulam",
    siteAddress: "Marine Drive, Ernakulam",
    billingAddress: "Marine Drive, Ernakulam",
    workOrderDateTime: "2026-04-08T11:00:00.000Z",
    salesExecutive: "Anand",
    subject: "Residential Complex Pest Control",
    reference: "REF-WO-2004",
    period: "Apr 8, 2026",
    preferredServiceDateTimes: "Morning",
    termsAndConditions: "One-time service with 3-month warranty.",
    start: "Apr 8, 2026",
    end: "Apr 8, 2026",
    status: "Authorization Pending",
    phone: "9876543280",
    email: "secretary@sunriseapts.com",
    serviceType: "Termite Control (One-Time)",
    frequency: "One-Time",
    totalValue: "₹ 15,000",
    paidAmount: "₹ 0",
    nextService: "Unassigned",
    assignedTech: "Unassigned",
    notes: "Apartment association. Awaiting secretary's authorization."
  },

  // Praveen Kumar (CUST-1001) - 4 work orders
  {
    id: "WO-1001",
    customer: "Praveen Kumar",
    address: "12 MG Road, Kochi",
    siteAddress: "12 MG Road, Kochi",
    billingAddress: "12 MG Road, Kochi",
    workOrderDateTime: "2026-01-10T10:00:00.000Z",
    salesExecutive: "Ravi",
    subject: "Cockroach Control (AMC)",
    reference: "REF-WO-1001",
    period: "Jan 10, 2026 - Jan 9, 2027",
    preferredServiceDateTimes: "Weekdays • Morning",
    termsAndConditions: "Standard terms apply.",
    start: "Jan 10, 2026",
    end: "Jan 9, 2027",
    status: "Scheduled",
    phone: "9876543210",
    email: "",
    serviceType: "Cockroach Control (AMC - 4/Year)",
    frequency: "Quarterly",
    totalValue: "₹ 12,000",
    paidAmount: "₹ 4,000",
    nextService: "Apr 10, 2026",
    assignedTech: "Mani",
    notes: "Residential apartment. Customer prefers morning slots."
  },
  {
    id: "WO-1002",
    customer: "Praveen Kumar",
    address: "12 MG Road, Kochi",
    siteAddress: "12 MG Road, Kochi",
    billingAddress: "12 MG Road, Kochi",
    workOrderDateTime: "2026-02-05T09:00:00.000Z",
    salesExecutive: "Ravi",
    subject: "Termite Control (One-Time)",
    reference: "REF-WO-1002",
    period: "Feb 5, 2026",
    preferredServiceDateTimes: "Weekend • Morning",
    termsAndConditions: "Standard terms apply.",
    start: "Feb 5, 2026",
    end: "Feb 5, 2026",
    status: "Completed",
    phone: "9876543210",
    email: "",
    serviceType: "Termite Control (One-Time)",
    frequency: "One-Time",
    totalValue: "₹ 6,500",
    paidAmount: "₹ 6,500",
    nextService: "Unassigned",
    assignedTech: "Safeeq",
    notes: "Wood treatment for furniture and flooring."
  },
  {
    id: "WO-1003",
    customer: "Praveen Kumar",
    address: "12 MG Road, Kochi",
    siteAddress: "12 MG Road, Kochi",
    billingAddress: "12 MG Road, Kochi",
    workOrderDateTime: "2026-03-01T11:00:00.000Z",
    salesExecutive: "Ravi",
    subject: "Mosquito Fogging",
    reference: "REF-WO-1003",
    period: "Mar 1, 2026",
    preferredServiceDateTimes: "Evening",
    termsAndConditions: "Standard terms apply.",
    start: "Mar 1, 2026",
    end: "Mar 1, 2026",
    status: "Open",
    phone: "9876543210",
    email: "",
    serviceType: "Mosquito Fogging (One-Time)",
    frequency: "One-Time",
    totalValue: "₹ 3,000",
    paidAmount: "₹ 0",
    nextService: "Unassigned",
    assignedTech: "Unassigned",
    notes: "Garden and terrace fogging."
  },
  {
    id: "WO-1004",
    customer: "Praveen Kumar",
    address: "12 MG Road, Kochi",
    siteAddress: "12 MG Road, Kochi",
    billingAddress: "12 MG Road, Kochi",
    workOrderDateTime: "2026-03-20T10:00:00.000Z",
    salesExecutive: "Ravi",
    subject: "Rat Control (AMC)",
    reference: "REF-WO-1004",
    period: "Mar 20, 2026 - Mar 19, 2027",
    preferredServiceDateTimes: "Weekdays • Morning",
    termsAndConditions: "Standard terms apply.",
    start: "Mar 20, 2026",
    end: "Mar 19, 2027",
    status: "Scheduled",
    phone: "9876543210",
    email: "",
    serviceType: "Rat Control (AMC - Bi-Monthly)",
    frequency: "Bi-Monthly",
    totalValue: "₹ 9,000",
    paidAmount: "₹ 3,000",
    nextService: "May 20, 2026",
    assignedTech: "Mani",
    notes: "Kitchen and store room focus."
  },

  // Hotel Grand (CUST-1002) - 4 work orders
  {
    id: "WO-1005",
    customer: "Hotel Grand",
    address: "Beach Road, Calicut",
    siteAddress: "Beach Road, Calicut",
    billingAddress: "Beach Road, Calicut",
    workOrderDateTime: "2026-01-15T11:00:00.000Z",
    salesExecutive: "Anand",
    subject: "Bed Bug Treatment (AMC)",
    reference: "REF-WO-1005",
    period: "Jan 15, 2026 - Jan 15, 2027",
    preferredServiceDateTimes: "Monthly • Afternoon",
    termsAndConditions: "Standard terms apply.",
    start: "Jan 15, 2026",
    end: "Jan 15, 2027",
    status: "Scheduled",
    phone: "9876543220",
    email: "manager@hotelgrand.com",
    serviceType: "Bed Bug Treatment (AMC - Monthly)",
    frequency: "Monthly",
    totalValue: "₹ 96,000",
    paidAmount: "₹ 48,000",
    nextService: "Apr 15, 2026",
    assignedTech: "Safeeq",
    notes: "Full hotel treatment including kitchen, rooms, and common areas."
  },
  {
    id: "WO-1006",
    customer: "Hotel Grand",
    address: "Beach Road, Calicut",
    siteAddress: "Beach Road, Calicut",
    billingAddress: "Beach Road, Calicut",
    workOrderDateTime: "2026-02-10T09:00:00.000Z",
    salesExecutive: "Anand",
    subject: "Cockroach Control (AMC)",
    reference: "REF-WO-1006",
    period: "Feb 10, 2026 - Feb 9, 2027",
    preferredServiceDateTimes: "Weekdays • Morning",
    termsAndConditions: "Standard terms apply.",
    start: "Feb 10, 2026",
    end: "Feb 9, 2027",
    status: "Scheduled",
    phone: "9876543220",
    email: "manager@hotelgrand.com",
    serviceType: "Cockroach Control (AMC - Monthly)",
    frequency: "Monthly",
    totalValue: "₹ 24,000",
    paidAmount: "₹ 8,000",
    nextService: "Apr 10, 2026",
    assignedTech: "Mani",
    notes: "Kitchen and restaurant area focus."
  },
  {
    id: "WO-1007",
    customer: "Hotel Grand",
    address: "Beach Road, Calicut",
    siteAddress: "Beach Road, Calicut",
    billingAddress: "Beach Road, Calicut",
    workOrderDateTime: "2026-03-05T14:00:00.000Z",
    salesExecutive: "Anand",
    subject: "Rodent Control (One-Time)",
    reference: "REF-WO-1007",
    period: "Mar 5, 2026",
    preferredServiceDateTimes: "Afternoon",
    termsAndConditions: "Standard terms apply.",
    start: "Mar 5, 2026",
    end: "Mar 5, 2026",
    status: "Completed",
    phone: "9876543220",
    email: "manager@hotelgrand.com",
    serviceType: "Rodent Control (One-Time)",
    frequency: "One-Time",
    totalValue: "₹ 5,000",
    paidAmount: "₹ 5,000",
    nextService: "Unassigned",
    assignedTech: "Safeeq",
    notes: "Basement and storage area treatment."
  },
  {
    id: "WO-1008",
    customer: "Hotel Grand",
    address: "Beach Road, Calicut",
    siteAddress: "Beach Road, Calicut",
    billingAddress: "Beach Road, Calicut",
    workOrderDateTime: "2026-03-25T10:00:00.000Z",
    salesExecutive: "Anand",
    subject: "Mosquito Control (AMC)",
    reference: "REF-WO-1008",
    period: "Mar 25, 2026 - Mar 24, 2027",
    preferredServiceDateTimes: "Evening",
    termsAndConditions: "Standard terms apply.",
    start: "Mar 25, 2026",
    end: "Mar 24, 2027",
    status: "Open",
    phone: "9876543220",
    email: "manager@hotelgrand.com",
    serviceType: "Mosquito Control (AMC - Monthly)",
    frequency: "Monthly",
    totalValue: "₹ 18,000",
    paidAmount: "₹ 0",
    nextService: "Apr 25, 2026",
    assignedTech: "Unassigned",
    notes: "Outdoor areas, pool side, and garden."
  },

  // Lakshmi Stores (CUST-1003) - 4 work orders
  {
    id: "WO-1009",
    customer: "Lakshmi Stores",
    address: "Market Road, Ernakulam",
    siteAddress: "Market Road, Ernakulam",
    billingAddress: "Market Road, Ernakulam",
    workOrderDateTime: "2026-01-20T10:00:00.000Z",
    salesExecutive: "Priya",
    subject: "Termite Control (One-Time)",
    reference: "REF-WO-1009",
    period: "Jan 20, 2026",
    preferredServiceDateTimes: "Before 10 AM",
    termsAndConditions: "Standard terms apply.",
    start: "Jan 20, 2026",
    end: "Jan 20, 2026",
    status: "Completed",
    phone: "9876543240",
    email: "lakshmi.stores@email.com",
    serviceType: "Termite Control (One-Time)",
    frequency: "One-Time",
    totalValue: "₹ 8,000",
    paidAmount: "₹ 8,000",
    nextService: "Unassigned",
    assignedTech: "Mani",
    notes: "Store perimeter and wooden shelving treatment."
  },
  {
    id: "WO-1010",
    customer: "Lakshmi Stores",
    address: "Market Road, Ernakulam",
    siteAddress: "Market Road, Ernakulam",
    billingAddress: "Market Road, Ernakulam",
    workOrderDateTime: "2026-02-15T09:00:00.000Z",
    salesExecutive: "Priya",
    subject: "Cockroach Control (AMC)",
    reference: "REF-WO-1010",
    period: "Feb 15, 2026 - Feb 14, 2027",
    preferredServiceDateTimes: "Before 10 AM",
    termsAndConditions: "Standard terms apply.",
    start: "Feb 15, 2026",
    end: "Feb 14, 2027",
    status: "Scheduled",
    phone: "9876543240",
    email: "lakshmi.stores@email.com",
    serviceType: "Cockroach Control (AMC - Quarterly)",
    frequency: "Quarterly",
    totalValue: "₹ 10,000",
    paidAmount: "₹ 2,500",
    nextService: "May 15, 2026",
    assignedTech: "Safeeq",
    notes: "Avoid peak business hours 10 AM - 6 PM."
  },
  {
    id: "WO-1011",
    customer: "Lakshmi Stores",
    address: "Market Road, Ernakulam",
    siteAddress: "Market Road, Ernakulam",
    billingAddress: "Market Road, Ernakulam",
    workOrderDateTime: "2026-03-08T08:00:00.000Z",
    salesExecutive: "Priya",
    subject: "Rat Control (One-Time)",
    reference: "REF-WO-1011",
    period: "Mar 8, 2026",
    preferredServiceDateTimes: "Early Morning",
    termsAndConditions: "Standard terms apply.",
    start: "Mar 8, 2026",
    end: "Mar 8, 2026",
    status: "Completed",
    phone: "9876543240",
    email: "lakshmi.stores@email.com",
    serviceType: "Rat Control (One-Time)",
    frequency: "One-Time",
    totalValue: "₹ 4,500",
    paidAmount: "₹ 4,500",
    nextService: "Unassigned",
    assignedTech: "Mani",
    notes: "Warehouse and storage area."
  },
  {
    id: "WO-1012",
    customer: "Lakshmi Stores",
    address: "Market Road, Ernakulam",
    siteAddress: "Market Road, Ernakulam",
    billingAddress: "Market Road, Ernakulam",
    workOrderDateTime: "2026-03-28T09:00:00.000Z",
    salesExecutive: "Priya",
    subject: "Fly Control (AMC)",
    reference: "REF-WO-1012",
    period: "Mar 28, 2026 - Mar 27, 2027",
    preferredServiceDateTimes: "Before 10 AM",
    termsAndConditions: "Standard terms apply.",
    start: "Mar 28, 2026",
    end: "Mar 27, 2027",
    status: "Open",
    phone: "9876543240",
    email: "lakshmi.stores@email.com",
    serviceType: "Fly Control (AMC - Monthly)",
    frequency: "Monthly",
    totalValue: "₹ 15,000",
    paidAmount: "₹ 0",
    nextService: "Apr 28, 2026",
    assignedTech: "Unassigned",
    notes: "Food storage and display area focus."
  },
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
        const nextNum = Math.max(...ids, 1012) + 1;
        return `WO-${nextNum}`;
      }
    }),
    {
      name: 'projects-store',
      version: 3,
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
            status: wo.status === "Authorization Pending" || wo.status === "Open" || wo.status === "Scheduled" || wo.status === "Completed" ? wo.status : "Authorization Pending",
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
