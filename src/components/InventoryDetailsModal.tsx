import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { InventoryItem } from "@/store/inventoryStore";
import { useProductsStore } from "@/store/productsStore";
import { useBranchesStore } from "@/store/branchesStore";

type Props = {
  open: boolean;
  item?: InventoryItem;
  onClose: () => void;
};

export function InventoryDetailsModal({ open, item, onClose }: Props) {
  const { products } = useProductsStore();
  const { branches } = useBranchesStore();

  if (!open || !item) return null;

  const product = products.find((p) => p.name === item.name);
  const branch = branches.find((b) => b.name === item.branch);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Inventory Details</h3>
            <p className="text-xs text-muted-foreground mt-1">{item.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Product Name</label>
              <p className="text-sm text-card-foreground">{item.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch</label>
              <p className="text-sm text-card-foreground">{item.branch}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Stock Quantity</label>
              <p className="text-sm text-card-foreground">{item.stock}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Unit</label>
              <p className="text-sm text-card-foreground">{item.unit}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Reorder Level</label>
              <p className="text-sm text-card-foreground">{item.reorder}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <p className="text-sm text-card-foreground">{item.status}</p>
            </div>
            {product && (
              <>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Product Category</label>
                  <p className="text-sm text-card-foreground">{product.category}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Unit Price</label>
                  <p className="text-sm text-card-foreground">₹{product.unitPrice}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">SKU</label>
                  <p className="text-sm text-card-foreground">{product.sku}</p>
                </div>
              </>
            )}
            {branch && (
              <>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch Address</label>
                  <p className="text-sm text-card-foreground">{branch.address}, {branch.city}, {branch.state}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch Contact</label>
                  <p className="text-sm text-card-foreground">{branch.contactNumber}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
