import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useProductsStore, type Product, type ProductCategory, type UnitType } from "@/store/productsStore";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  product?: Product;
  onClose: () => void;
  onSaved?: (product: Product) => void;
};

const LABELS = {
  title: "Product Information",
  productId: "Product ID (Auto Generated)",
  name: "Product Name",
  category: "Category",
  description: "Description",
  unitOfMeasurement: "Unit of Measurement",
  unitPrice: "Unit Price (₹)",
  reorderLevel: "Reorder Level",
  supplierName: "Supplier Name",
  supplierContact: "Supplier Contact",
  sku: "SKU/Code",
  status: "Status",
  notes: "Notes",
} as const;

const CATEGORIES: ProductCategory[] = ["Chemicals", "Equipment", "Supplies", "Services", "Other"];
const UNITS: UnitType[] = ["Liters", "Kg", "Pieces", "Boxes", "Cans", "Tubes", "Packs", "Gallons", "Meters"];

export function ProductFormModal({ open, mode, product, onClose, onSaved }: Props) {
  const { addProduct, updateProduct, getNextProductId } = useProductsStore();

  const [form, setForm] = useState<Product>({
    id: getNextProductId(),
    name: "",
    category: "Chemicals",
    description: "",
    unitOfMeasurement: "Liters",
    unitPrice: 0,
    reorderLevel: 0,
    supplierName: "",
    supplierContact: "",
    sku: "",
    status: "Active",
    notes: "",
    createdAt: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      setForm(product);
      return;
    }
    const nextId = getNextProductId();
    setForm({
      id: nextId,
      name: "",
      category: "Chemicals",
      description: "",
      unitOfMeasurement: "Liters",
      unitPrice: 0,
      reorderLevel: 0,
      supplierName: "",
      supplierContact: "",
      sku: "",
      status: "Active",
      notes: "",
      createdAt: new Date().toISOString().split("T")[0],
    });
  }, [open, mode, product, getNextProductId]);

  const setField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error(`${LABELS.name} is required`);
      return;
    }
    if (form.unitPrice <= 0) {
      toast.error(`${LABELS.unitPrice} must be greater than 0`);
      return;
    }
    if (form.reorderLevel < 0) {
      toast.error(`${LABELS.reorderLevel} cannot be negative`);
      return;
    }

    const normalized: Product = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      supplierName: form.supplierName.trim(),
      supplierContact: form.supplierContact.trim(),
      sku: form.sku.trim(),
    };

    if (mode === "edit") {
      updateProduct(normalized.id, normalized);
      toast.success(`Product updated: ${normalized.name}`);
      onSaved?.(normalized);
      onClose();
      return;
    }

    addProduct(normalized);
    toast.success(`Product added: ${normalized.name}`);
    onSaved?.(normalized);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">{LABELS.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "create" ? "Add a new product to your catalog" : "Update product information"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.productId}</label>
              <input
                value={form.id}
                readOnly
                className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-card-foreground focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.name}</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Enter product name"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.category}</label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value as ProductCategory)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.status}</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as "Active" | "Inactive")}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.description}</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.unitOfMeasurement}</label>
              <select
                value={form.unitOfMeasurement}
                onChange={(e) => setField("unitOfMeasurement", e.target.value as UnitType)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.unitPrice}</label>
              <input
                value={form.unitPrice}
                onChange={(e) => setField("unitPrice", Number(e.target.value))}
                placeholder="0"
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.reorderLevel}</label>
              <input
                value={form.reorderLevel}
                onChange={(e) => setField("reorderLevel", Number(e.target.value))}
                placeholder="0"
                type="number"
                min="0"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.supplierName}</label>
              <input
                value={form.supplierName}
                onChange={(e) => setField("supplierName", e.target.value)}
                placeholder="Enter supplier name"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.supplierContact}</label>
              <input
                value={form.supplierContact}
                onChange={(e) => setField("supplierContact", e.target.value)}
                placeholder="Enter contact number"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.sku}</label>
              <input
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                placeholder="Enter SKU/Code"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.notes}</label>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Enter any additional notes"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            {mode === "create" ? "Add Product" : "Update Product"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
