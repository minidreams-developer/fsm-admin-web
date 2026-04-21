import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CustomerType = "Residential" | "Commercial";

export type CustomerDocument = {
  id: string;
  fileName: string;
};

export type ContactPerson = {
  name: string;
  email: string;
  city: string;
  pincode: string;
  address: string;
};

export type Customer = {
  id: string;
  customerType: CustomerType;
  firstName: string;
  lastName: string;
  emailAddress: string;
  landline: string;
  mobile: string;
  gstNumber: string;
  placeOfSupply: string;
  paymentTerms: string;
  billingAddress: string;
  siteAddress: string;
  locationUrl?: string;
  contactPersonsDetails: ContactPerson[];
  customerDocuments: CustomerDocument[];
};

interface CustomersStore {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  getNextCustomerId: () => string;
}

const initialCustomers: Customer[] = [
  {
    id: "CUST-1001",
    customerType: "Residential",
    firstName: "Praveen",
    lastName: "Kumar",
    emailAddress: "",
    landline: "",
    mobile: "9876543210",
    gstNumber: "",
    placeOfSupply: "",
    paymentTerms: "",
    billingAddress: "",
    siteAddress: "12 MG Road, Kochi",
    contactPersonsDetails: [],
    customerDocuments: [],
  },
  {
    id: "CUST-1002",
    customerType: "Commercial",
    firstName: "Hotel",
    lastName: "Grand",
    emailAddress: "manager@hotelgrand.com",
    landline: "",
    mobile: "9876543220",
    gstNumber: "",
    placeOfSupply: "",
    paymentTerms: "",
    billingAddress: "",
    siteAddress: "Beach Road, Calicut",
    contactPersonsDetails: [],
    customerDocuments: [],
  },
  {
    id: "CUST-1003",
    customerType: "Commercial",
    firstName: "Lakshmi",
    lastName: "Stores",
    emailAddress: "lakshmi.stores@email.com",
    landline: "",
    mobile: "9876543240",
    gstNumber: "",
    placeOfSupply: "",
    paymentTerms: "",
    billingAddress: "",
    siteAddress: "Market Road, Ernakulam",
    contactPersonsDetails: [],
    customerDocuments: [],
  },
];

export const useCustomersStore = create<CustomersStore>()(
  persist(
    (set, get) => ({
      customers: initialCustomers,

      addCustomer: (customer) =>
        set((state) => ({
          customers: [...state.customers, customer],
        })),

      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      getCustomer: (id) => get().customers.find((c) => c.id === id),

      getNextCustomerId: () => {
        const nums = get()
          .customers.map((c) => Number(c.id.split("-")[1]))
          .filter((n) => Number.isFinite(n));
        const nextNum = (nums.length ? Math.max(...nums) : 1000) + 1;
        return `CUST-${nextNum}`;
      },
    }),
    { name: "customers-store", version: 0 },
  ),
);

