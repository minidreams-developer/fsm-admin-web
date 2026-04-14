import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Product } from "@/store/productsStore";

type Props = {
  open: boolean;
  product?: Product;
  onClose: () => void;
};

export function ProductDetailsModal({ open, product, onClose }: Props) {
  if (!open || !product) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Product Details</h3>
            <p className="text-xs text-muted-foreground mt-1">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Product ID</label>
              <p className="text-sm text-card-foreground">{product.id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Name</label>
              <p className="text-sm text-card-foreground">{product.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
              <p className="text-sm text-card-foreground">{product.category}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <p className="text-sm text-card-foreground">{product.status}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
              <p className="text-sm text-card-foreground">{product.description}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Unit of Measurement</label>
              <p className="text-sm text-card-foreground">{product.unitOfMeasurement}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Unit Price</label>
              <p className="text-sm text-card-foreground">₹{product.unitPrice}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Reorder Level</label>
              <p className="text-sm text-card-foreground">{product.reorderLevel}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">SKU</label>
              <p className="text-sm text-card-foreground">{product.sku}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Supplier Name</label>
              <p className="text-sm text-card-foreground">{product.supplierName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Supplier Contact</label>
              <p className="text-sm text-card-foreground">{product.supplierContact}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Created Date</label>
              <p className="text-sm text-card-foreground">{product.createdAt}</p>
            </div>
            {product.notes && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
                <p className="text-sm text-card-foreground">{product.notes}</p>
              </div>
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
