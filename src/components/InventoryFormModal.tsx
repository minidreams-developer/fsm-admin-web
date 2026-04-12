import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useInventoryStore, type InventoryItem } from "@/store/inventoryStore";
import { useBranchesStore } from "@/store/branchesStore";
import { useProductsStore } from "@/store/productsStore";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  item?: InventoryItem;
  onClose: () => void;
  onSaved?: (item: InventoryItem) => void;
};

const LABELS = {
  title: "Inventory Item",
  product: "Product",
  branch: "Branch",
  stock: "Stock Quantity",
  unit: "Unit",
  reorder: "Reorder Level",
  status: "Status",
} as const;

export function InventoryFormModal({ open, mode, item, onClose, onSaved }: Props) {
  const { addItem, updateItem } = useInventoryStore();
  const { branches } = useBranchesStore();
  const { products } = useProductsStore();

  const [form, setForm] = useState<InventoryItem>({
    id: 0,
    name: "",
    branch: "",
    stock: 0,
    unit: "Liters",
    reorder: 0,
    status: "OK",
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && item) {
      setForm(item);
      return;
    }
    setForm({
      id: Date.now(),
      name: "",
      branch: "",
      stock: 0,
      unit: "Liters",
      reorder: 0,
      status: "OK",
    });
  }, [open, mode, item]);

  const setField = <K extends keyof InventoryItem>(key: K, value: InventoryItem[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error(`${LABELS.product} is required`);
      return;
    }
    if (!form.branch.trim()) {
      toast.error(`${LABELS.branch} is required`);
      return;
    }
    if (form.stock < 0) {
      toast.error(`${LABELS.stock} cannot be negative`);
      return;
    }
    if (form.reorder < 0) {
      toast.error(`${LABELS.reorder} cannot be negative`);
      return;
    }

    if (mode === "edit") {
      updateItem(form.id, form);
      toast.success(`Inventory updated: ${form.name}`);
      onSaved?.(form);
      onClose();
      return;
    }

    addItem(form);
    toast.success(`Inventory added: ${form.name}`);
    onSaved?.(form);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">{LABELS.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "create" ? "Add a new inventory item" : "Update inventory information"}
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
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.product}</label>
              <select
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.branch}</label>
              <select
                value={form.branch}
                onChange={(e) => setField("branch", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.stock}</label>
              <input
                value={form.stock}
                onChange={(e) => setField("stock", Number(e.target.value))}
                type="number"
                min="0"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.unit}</label>
              <input
                value={form.unit}
                onChange={(e) => setField("unit", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.reorder}</label>
              <input
                value={form.reorder}
                onChange={(e) => setField("reorder", Number(e.target.value))}
                type="number"
                min="0"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            {mode === "create" ? "Add Item" : "Update Item"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
