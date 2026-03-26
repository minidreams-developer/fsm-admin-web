import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, AlertTriangle, Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useBranchesStore } from "@/store/branchesStore";
import { useProductsStore } from "@/store/productsStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { InventoryFormModal } from "@/components/InventoryFormModal";
import { InventoryDetailsModal } from "@/components/InventoryDetailsModal";
import { toast } from "sonner";

const inventory = [
  { id: 1, name: "Cypermethrin 10% EC", branch: "Kochi", stock: 45, unit: "Liters", reorder: 20, status: "OK" },
  { id: 2, name: "Bifenthrin 2.5% SC", branch: "Kochi", stock: 12, unit: "Liters", reorder: 20, status: "Low" },
  { id: 3, name: "Gel Bait (Maxforce)", branch: "Kochi", stock: 8, unit: "Tubes", reorder: 15, status: "Low" },
  { id: 4, name: "Termiticide (Imida)", branch: "Calicut", stock: 32, unit: "Liters", reorder: 10, status: "OK" },
  { id: 5, name: "Rodent Blocks", branch: "Kochi", stock: 5, unit: "Packs", reorder: 10, status: "Critical" },
  { id: 6, name: "Pyrethrin Spray", branch: "Calicut", stock: 28, unit: "Cans", reorder: 10, status: "OK" },
];

const statusMap = { OK: "success", Low: "warning", Critical: "error" } as const;

const InventoryPage = () => {
  const { branches } = useBranchesStore();
  const { products } = useProductsStore();
  const { inventory: inventoryItems, updateItem, deleteItem } = useInventoryStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsItem, setDetailsItem] = useState<any>(null);
  const filtered = inventoryItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setModalMode("edit");
    setEditingId(item.id);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setModalMode("create");
    setEditingId(1); // Set to a truthy value to open modal
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Branch-wise chemical stock management</p>
        </div>
        <button onClick={() => handleAddNew()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Plus className="w-4 h-4" /> Add Inventory
        </button>
      </div>

      {/* Low stock alert */}
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
        <p className="text-sm text-card-foreground"><strong>3 items</strong> are below reorder level and need restocking.</p>
      </div>

      <InventoryFormModal
        open={editingId !== null}
        mode={modalMode}
        item={selectedItem}
        onClose={() => setEditingId(null)}
      />
      <InventoryDetailsModal open={showDetails} item={detailsItem} onClose={() => setShowDetails(false)} />

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chemicals..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead><tr className="border-b border-border">
              {["Product", "Branch", "Stock", "Unit", "Reorder Level", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((i) => {
                const product = products.find((p) => p.name === i.name);
                return (
                  <tr key={i.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{product?.name || i.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{i.branch}</td>
                    <td className="px-5 py-3.5 font-bold text-card-foreground">{i.stock}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{i.unit}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{i.reorder}</td>
                    <td className="px-5 py-3.5 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDetailsItem(i);
                          setShowDetails(true);
                        }}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(i)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          deleteItem(i.id);
                          toast.success("Inventory item deleted");
                        }}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
