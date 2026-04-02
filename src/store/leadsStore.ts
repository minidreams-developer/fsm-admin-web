import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LeadStatus = "New" | "Contacted" | "Quote Sent" | "Follow Up" | "Converted" | "Lost";

export type UrgencyLevel = "Low" | "Medium" | "High";

export type Lead = {
  id: number;
  name: string;
  phone: string;
  address: string;
  services: string[];
  amount: number | null;
  expectedDateTime?: string;
  leadSource: string;
  urgencyLevel: UrgencyLevel;
  branch: string;
  salesExecutive: string;
  notes: string;
  status: LeadStatus;
  date: string;
  quoteIsViewed: boolean;
  quoteViewedAt: string | null;
  quoteAmount?: number;
  quoteContract?: string;
  quoteNotes?: string;
  quoteLost?: boolean;
  assignedOwner?: string;
  leadIncharge?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  reminders?: { id: string; date: string; text: string; createdAt: string }[];
};

interface LeadsStore {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (id: number, updates: Partial<Lead>) => void;
  deleteLead: (id: number) => void;
  getLead: (id: number) => Lead | undefined;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
}

const initialLeads: Lead[] = [
  { id: 1, name: "Arun Sharma", phone: "9876543210", address: "12 MG Road, Kochi", services: ["Termite Treatment"], amount: 5000, expectedDateTime: "", leadSource: "Referral", urgencyLevel: "Medium", branch: "Kochi", salesExecutive: "—", notes: "", status: "Quote Sent", date: "Mar 5", quoteIsViewed: true, quoteViewedAt: "Mar 13, 2:30 PM", quoteAmount: 5000, quoteContract: "3 Months" },
  { id: 2, name: "safeeq", phone: "5555555555", address: "fffffffffffff", services: ["Pest Control", "Fumigation", "Termite Treatment"], amount: 8000, expectedDateTime: "", leadSource: "Call", urgencyLevel: "Medium", branch: "", salesExecutive: "—", notes: "", status: "Quote Sent", date: "Mar 13, 2026", quoteIsViewed: true, quoteViewedAt: null, quoteAmount: 8000, quoteContract: "One-Time" },
  { id: 3, name: "kkkkkk", phone: "78987", address: "jkjio", services: ["General Pest"], amount: 3000, expectedDateTime: "", leadSource: "Website", urgencyLevel: "Low", branch: "", salesExecutive: "—", notes: "", status: "Quote Sent", date: "Mar 13, 2026", quoteIsViewed: false, quoteViewedAt: null, quoteAmount: 3000, quoteContract: "3 Months" },
  { id: 4, name: "Priya Nair", phone: "9876543211", address: "45 NH Bypass, Thrissur", services: ["General Pest"], amount: null, expectedDateTime: "", leadSource: "Walk-in", urgencyLevel: "Medium", branch: "Thrissur", salesExecutive: "—", notes: "", status: "Contacted", date: "Mar 4", quoteIsViewed: false, quoteViewedAt: null },
  { id: 5, name: "Hotel Sunrise", phone: "9876543212", address: "Beach Road, Calicut", services: ["Commercial Pest Control", "Kitchen Deep Clean", "Fumigation Service"], amount: 45000, expectedDateTime: "", leadSource: "Referral", urgencyLevel: "High", branch: "Calicut", salesExecutive: "—", notes: "", status: "Converted", date: "Mar 3", quoteIsViewed: true, quoteViewedAt: "Mar 4, 2:30 PM", quoteAmount: 45000, quoteContract: "3 Months" },
  { id: 6, name: "Deepak M", phone: "9876543213", address: "Sector 5, Trivandrum", services: ["Rodent Control"], amount: 12000, expectedDateTime: "", leadSource: "Website", urgencyLevel: "Medium", branch: "Trivandrum", salesExecutive: "—", notes: "", status: "Converted", date: "Mar 1", quoteIsViewed: true, quoteViewedAt: "Mar 2, 10:15 AM", quoteAmount: 12000, quoteContract: "One-Time" },
  { id: 7, name: "Fatima Begum", phone: "9876543214", address: "Old Town, Palakkad", services: ["Cockroach Control"], amount: null, expectedDateTime: "", leadSource: "Call", urgencyLevel: "Low", branch: "Palakkad", salesExecutive: "—", notes: "", status: "Lost", date: "Feb 28", quoteIsViewed: false, quoteViewedAt: null },
  { id: 8, name: "Rajesh Pillai", phone: "9876543215", address: "Hill View, Munnar", services: ["Bed Bug Treatment", "Preventive Spray"], amount: null, expectedDateTime: "", leadSource: "Website", urgencyLevel: "Medium", branch: "Munnar", salesExecutive: "—", notes: "", status: "New", date: "Mar 6", quoteIsViewed: false, quoteViewedAt: null },
];

export const useLeadsStore = create<LeadsStore>()(
  persist(
    (set, get) => ({
      leads: initialLeads,
      
      addLead: (lead) => set((state) => ({
        leads: [...state.leads, { ...lead, id: Math.max(...state.leads.map(l => l.id), 0) + 1 }]
      })),
      
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map(lead => lead.id === id ? { ...lead, ...updates } : lead)
      })),
      
      deleteLead: (id) => set((state) => ({
        leads: state.leads.filter(lead => lead.id !== id)
      })),
      
      getLead: (id) => get().leads.find(lead => lead.id === id),
      
      getLeadsByStatus: (status) => get().leads.filter(lead => lead.status === status),
    }),
    {
      name: 'leads-store',
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 3) {
          return { leads: initialLeads };
        }
        if (typeof persistedState === "object" && persistedState !== null && "leads" in persistedState) {
          const state = persistedState as { leads: Array<Partial<Lead> & { id: number }> };
          const migratedLeads: Lead[] = state.leads.map((l) => {
            const rawQuoteIsViewed = (l as { quoteIsViewed?: unknown }).quoteIsViewed;
            const rawDate = (l as { date?: unknown }).date;
            return {
              id: l.id,
              name: l.name ?? "",
              phone: l.phone ?? "",
              address: l.address ?? "",
              services: Array.isArray(l.services) ? (l.services as string[]) : [],
              amount: typeof l.amount === "number" ? l.amount : typeof l.quoteAmount === "number" ? l.quoteAmount : null,
              expectedDateTime: typeof l.expectedDateTime === "string" ? l.expectedDateTime : "",
              leadSource: typeof l.leadSource === "string" ? l.leadSource : "",
              urgencyLevel: l.urgencyLevel === "Low" || l.urgencyLevel === "Medium" || l.urgencyLevel === "High" ? l.urgencyLevel : "Medium",
              branch: typeof l.branch === "string" ? l.branch : "",
              salesExecutive: typeof l.salesExecutive === "string" ? l.salesExecutive : "",
              notes: typeof l.notes === "string" ? l.notes : "",
              status: (l.status as LeadStatus) ?? "New",
              date: typeof rawDate === "string" ? rawDate : "",
              quoteIsViewed: rawQuoteIsViewed === true || rawQuoteIsViewed === "true" || rawQuoteIsViewed === 1 || rawQuoteIsViewed === "1",
              quoteViewedAt: typeof l.quoteViewedAt === "string" || l.quoteViewedAt === null ? l.quoteViewedAt : null,
              quoteAmount: typeof l.quoteAmount === "number" ? l.quoteAmount : undefined,
              quoteContract: typeof l.quoteContract === "string" ? l.quoteContract : undefined,
              quoteNotes: typeof l.quoteNotes === "string" ? l.quoteNotes : undefined,
              quoteLost: typeof l.quoteLost === "boolean" ? l.quoteLost : undefined,
            };
          });
          return { leads: migratedLeads };
        }
        return { leads: initialLeads };
      },
    }
  )
);
