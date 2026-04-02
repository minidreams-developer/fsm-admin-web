import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductCategory = "Chemicals" | "Equipment" | "Supplies" | "Services" | "Other";
export type UnitType = "Liters" | "Kg" | "Pieces" | "Boxes" | "Cans" | "Tubes" | "Packs" | "Gallons" | "Meters";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  unitOfMeasurement: UnitType;
  unitPrice: number;
  reorderLevel: number;
  supplierName: string;
  supplierContact: string;
  sku: string;
  status: "Active" | "Inactive";
  notes: string;
  createdAt: string;
};

interface ProductsStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getNextProductId: () => string;
  getProductsByCategory: (category: ProductCategory) => Product[];
}

const initialProducts: Product[] = [
  {
    id: "PROD-1001",
    name: "Cypermethrin 10% EC",
    category: "Chemicals",
    description: "Broad spectrum insecticide for pest control",
    unitOfMeasurement: "Liters",
    unitPrice: 450,
    reorderLevel: 20,
    supplierName: "ABC Chemicals",
    supplierContact: "9876543210",
    sku: "CHEM-001",
    status: "Active",
    notes: "High demand item",
    createdAt: "2024-01-15",
  },
  {
    id: "PROD-1002",
    name: "Bifenthrin 2.5% SC",
    category: "Chemicals",
    description: "Selective insecticide for targeted pest control",
    unitOfMeasurement: "Liters",
    unitPrice: 520,
    reorderLevel: 20,
    supplierName: "ABC Chemicals",
    supplierContact: "9876543210",
    sku: "CHEM-002",
    status: "Active",
    notes: "Premium quality",
    createdAt: "2024-01-15",
  },
  {
    id: "PROD-1003",
    name: "Gel Bait (Maxforce)",
    category: "Chemicals",
    description: "Cockroach gel bait",
    unitOfMeasurement: "Tubes",
    unitPrice: 180,
    reorderLevel: 15,
    supplierName: "XYZ Supplies",
    supplierContact: "9876543220",
    sku: "CHEM-003",
    status: "Active",
    notes: "Fast acting",
    createdAt: "2024-01-15",
  },
  {
    id: "PROD-1004",
    name: "Spray Equipment",
    category: "Equipment",
    description: "Professional pest control spray equipment",
    unitOfMeasurement: "Pieces",
    unitPrice: 2500,
    reorderLevel: 5,
    supplierName: "Equipment Co",
    supplierContact: "9876543230",
    sku: "EQUIP-001",
    status: "Active",
    notes: "Durable and reliable",
    createdAt: "2024-01-15",
  },
  {
    id: "PROD-1005",
    name: "Safety Gloves",
    category: "Supplies",
    description: "Protective gloves for pest control work",
    unitOfMeasurement: "Packs",
    unitPrice: 50,
    reorderLevel: 50,
    supplierName: "Safety Supplies Ltd",
    supplierContact: "9876543240",
    sku: "SUPP-001",
    status: "Active",
    notes: "Pack of 10 pairs",
    createdAt: "2024-01-15",
  },
  {
    id: "PROD-1006",
    name: "Pest Control Service",
    category: "Services",
    description: "Professional pest control service",
    unitOfMeasurement: "Pieces",
    unitPrice: 500,
    reorderLevel: 0,
    supplierName: "Internal",
    supplierContact: "N/A",
    sku: "SERV-001",
    status: "Active",
    notes: "Standard service package",
    createdAt: "2024-01-15",
  },
  { id: "PROD-1007", name: "Termite Treatment", category: "Services", description: "Pre and post construction termite treatment", unitOfMeasurement: "Pieces", unitPrice: 3500, sku: "SERV-002", status: "Active", notes: "Annual contract available", createdAt: "2024-01-15" },
  { id: "PROD-1008", name: "Cockroach Control", category: "Services", description: "Gel and spray treatment for cockroach elimination", unitOfMeasurement: "Pieces", unitPrice: 1200, sku: "SERV-003", status: "Active", notes: "Includes follow-up visit", createdAt: "2024-01-15" },
  { id: "PROD-1009", name: "Rodent Control", category: "Services", description: "Trapping and baiting for rodent management", unitOfMeasurement: "Pieces", unitPrice: 2000, sku: "SERV-004", status: "Active", notes: "Monthly service available", createdAt: "2024-01-15" },
  { id: "PROD-1010", name: "Bed Bug Treatment", category: "Services", description: "Heat and chemical treatment for bed bugs", unitOfMeasurement: "Pieces", unitPrice: 2500, sku: "SERV-005", status: "Active", notes: "Guaranteed results", createdAt: "2024-01-15" },
];

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      products: initialProducts,

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      getProduct: (id) => get().products.find((p) => p.id === id),

      getNextProductId: () => {
        const nums = get()
          .products.map((p) => Number(p.id.split("-")[1]))
          .filter((n) => Number.isFinite(n));
        const nextNum = (nums.length ? Math.max(...nums) : 1000) + 1;
        return `PROD-${nextNum}`;
      },

      getProductsByCategory: (category) =>
        get().products.filter((p) => p.category === category),
    }),
    { name: "products-store", version: 0 },
  ),
);
