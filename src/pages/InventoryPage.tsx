import { StatusBadge } from "@/components/StatusBadge";
import { Plus, AlertTriangle, Edit2, Trash2, Eye, Package, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useBranchesStore } from "@/store/branchesStore";
import { useProductsStore } from "@/store/productsStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { InventoryFormModal } from "@/components/InventoryFormModal";
import { InventoryDetailsModal } from "@/components/InventoryDetailsModal";
import { toast } from "sonner";

const statusMap = { OK: "success", Low: "warning", Critical: "error" } as const;

const InventoryPage = () => {
  const { branches } = useBranchesStore();
  const { products } = useProductsStore();
  const { inventory: inventoryItems, updateItem, deleteItem } = useInventoryStore();
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsItem, setDetailsItem] = useState<any>(null);

  const branchNames = ["All", ...Array.from(new Set(inventoryItems.map((i) => i.branch).filter(Boolean)))];

  const filtered = inventoryItems.filter((i) =>
    (branchFilter === "All" || i.branch === branchFilter) &&
    (statusFilter === "All" || i.status === statusFilter)
  );

  const totalItems = inventoryItems.length;
  const okItems = inventoryItems.filter((i) => i.status === "OK").length;
  const lowItems = inventoryItems.filter((i) => i.status === "Low").length;
  const criticalItems = inventoryItems.filter((i) => i.status === "Critical").length;

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setModalMode("edit");
    setEditingId(item.id);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setModalMode("create");
    setEditingId(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Branch-wise chemical stock management</p>
        </div>
        <button onClick={handleAddNew} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Plus className="w-4 h-4" /> Add Inventory
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Items</p>
              <p className="text-2xl font-bold text-card-foreground">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">OK</p>
              <p className="text-2xl font-bold text-card-foreground">{okItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-card-foreground">{lowItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Critical</p>
              <p className="text-2xl font-bold text-card-foreground">{criticalItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {(lowItems + criticalItems) > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-card-foreground"><strong>{lowItems + criticalItems} items</strong> are below reorder level and need restocking.</p>
        </div>
      )}

      <InventoryFormModal
        open={editingId !== null}
        mode={modalMode}
        item={selectedItem}
        onClose={() => setEditingId(null)}
      />
      <InventoryDetailsModal open={showDetails} item={detailsItem} onClose={() => setShowDetails(false)} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-full sm:max-w-xs">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
          >
            {branchNames.map((b) => (
              <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "OK", "Low", "Critical"] as const).map((s) => {
            const count = s === "All" ? inventoryItems.length : inventoryItems.filter((i) => i.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${statusFilter === s ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card border border-border text-muted-foreground hover:text-card-foreground"}`}
                style={statusFilter === s ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
              >{s} ({count})</button>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["Product", "Branch", "Stock", "Unit", "Reorder Level", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((i) => {
              const product = products.find((p) => p.name === i.name);
              return (
                <tr key={i.id} onClick={() => { setDetailsItem(i); setShowDetails(true); }} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                  <td className="px-3 py-3 font-medium text-card-foreground text-xs">{product?.name || i.name}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{i.branch}</td>
                  <td className="px-3 py-3 font-bold text-card-foreground text-xs">{i.stock}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{i.unit}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{i.reorder}</td>
                  <td className="px-3 py-3">
                    <StatusBadge label={i.status} variant={statusMap[i.status as keyof typeof statusMap] || "neutral"} />
                  </td>
                  <td className="px-3 py-3 flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(i); }} className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem(i.id); toast.success("Inventory item deleted"); }} className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No inventory items for this branch.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
