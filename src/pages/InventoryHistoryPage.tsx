import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInventoryStore } from "@/store/inventoryStore";
import { History, TrendingUp, Plus, UserCheck, Package, Calendar } from "lucide-react";
import { format } from "date-fns";

const formatDate = (timestamp: string) => {
  try {
    return format(new Date(timestamp), "MMM dd, yyyy HH:mm");
  } catch {
    return timestamp;
  }
};

const InventoryHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // "inventory" | "allocate" | null (show both)
  const { history, inventory } = useInventoryStore();

  // Split into two categories
  const inventoryHistory = history.filter((h) => h.action !== "Allocated");
  const allocationHistory = history.filter((h) => h.action === "Allocated");

  // Filters for inventory history
  const [invBranch, setInvBranch] = useState("All");
  const [invProduct, setInvProduct] = useState("All");

  // Filters for allocation history
  const [allocBranch, setAllocBranch] = useState("All");
  const [allocEmployee, setAllocEmployee] = useState("All");

  const invBranches = ["All", ...Array.from(new Set(inventoryHistory.map((h) => h.branch)))];
  const invProducts = ["All", ...Array.from(new Set(inventoryHistory.map((h) => h.itemName)))];

  const allocBranches = ["All", ...Array.from(new Set(allocationHistory.map((h) => h.branch)))];
  const allocEmployees = ["All", ...Array.from(new Set(allocationHistory.map((h) => h.performedBy).filter(Boolean) as string[]))];

  const filteredInv = inventoryHistory.filter((h) => {
    if (invBranch !== "All" && h.branch !== invBranch) return false;
    if (invProduct !== "All" && h.itemName !== invProduct) return false;
    return true;
  });

  const filteredAlloc = allocationHistory.filter((h) => {
    if (allocBranch !== "All" && h.branch !== allocBranch) return false;
    if (allocEmployee !== "All" && h.performedBy !== allocEmployee) return false;
    return true;
  });

  const selectCls = "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";
  const thCls = "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider";
  const tdCls = "px-4 py-3 text-xs";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
          {type === "inventory" ? "Inventory History" : type === "allocate" ? "Allocate Stock History" : "Inventory History"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {type === "allocate" ? "Stock allocated to employees" : "Stock additions, restocks and updates"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-card-foreground">{history.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg flex-shrink-0">
              <Plus className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Stock Changes</p>
              <p className="text-2xl font-bold text-card-foreground">{inventoryHistory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-info/10 rounded-lg flex-shrink-0">
              <UserCheck className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Allocations</p>
              <p className="text-2xl font-bold text-card-foreground">{allocationHistory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Restocks</p>
              <p className="text-2xl font-bold text-card-foreground">{history.filter((h) => h.action === "Restocked").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── INVENTORY HISTORY ── */}
      {type !== "allocate" && <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-card-foreground">Inventory History</h3>
              <p className="text-xs text-muted-foreground">Stock additions, restocks and updates</p>
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select value={invBranch} onChange={(e) => setInvBranch(e.target.value)} className={`${selectCls} w-auto`}>
              {invBranches.map((b) => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
            </select>
            <select value={invProduct} onChange={(e) => setInvProduct(e.target.value)} className={`${selectCls} w-auto`}>
              {invProducts.map((p) => <option key={p} value={p}>{p === "All" ? "All Products" : p}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className={thCls}>Date</th>
                <th className={thCls}>Product</th>
                <th className={thCls}>Quantity (Stock)</th>
                <th className={thCls}>Unit</th>
                <th className={thCls}>Branch</th>
                <th className={thCls}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInv.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No inventory history found</p>
                  </td>
                </tr>
              ) : filteredInv.map((entry) => {
                const stockDisplay = entry.newStock !== undefined
                  ? entry.previousStock !== undefined
                    ? `${entry.previousStock} → ${entry.newStock}`
                    : `${entry.newStock}`
                  : entry.quantityChanged !== undefined
                    ? (entry.quantityChanged > 0 ? `+${entry.quantityChanged}` : `${entry.quantityChanged}`)
                    : "—";

                const actionColors: Record<string, string> = {
                  Added: "bg-success/10 text-success",
                  Restocked: "bg-primary/10 text-primary",
                  Updated: "bg-warning/10 text-warning",
                  Deleted: "bg-destructive/10 text-destructive",
                };

                return (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className={`${tdCls} text-muted-foreground whitespace-nowrap`}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </td>
                    <td className={`${tdCls} font-medium text-card-foreground`}>{entry.itemName}</td>
                    <td className={`${tdCls} font-semibold`}>
                      <span className={entry.quantityChanged !== undefined && entry.quantityChanged < 0 ? "text-destructive" : "text-success"}>
                        {stockDisplay}
                      </span>
                    </td>
                    <td className={`${tdCls} text-muted-foreground`}>{entry.unit}</td>
                    <td className={`${tdCls} text-muted-foreground`}>{entry.branch}</td>
                    <td className={tdCls}>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${actionColors[entry.action] || "bg-secondary text-muted-foreground"}`}>
                        {entry.action}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredInv.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-secondary/10">
            <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-card-foreground">{filteredInv.length}</span> records</p>
          </div>
        )}
      </div>}

      {/* ── ALLOCATE STOCK HISTORY ── */}
      {type !== "inventory" && <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-info" />
            <div>
              <h3 className="text-base font-bold text-card-foreground">Allocate Stock History</h3>
              <p className="text-xs text-muted-foreground">Stock allocated to employees</p>
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select value={allocBranch} onChange={(e) => setAllocBranch(e.target.value)} className={`${selectCls} w-auto`}>
              {allocBranches.map((b) => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
            </select>
            <select value={allocEmployee} onChange={(e) => setAllocEmployee(e.target.value)} className={`${selectCls} w-auto`}>
              {allocEmployees.map((e) => <option key={e} value={e}>{e === "All" ? "All Employees" : e}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className={thCls}>Date</th>
                <th className={thCls}>Employee</th>
                <th className={thCls}>Branch</th>
                <th className={thCls}>Product</th>
                <th className={thCls}>Quantity</th>
                <th className={thCls}>Remaining Stock</th>
                <th className={thCls}>Unit</th>
                <th className={thCls}>Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlloc.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <UserCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No allocation history found</p>
                  </td>
                </tr>
              ) : filteredAlloc.map((entry) => {
                const allocated = entry.quantityChanged !== undefined ? Math.abs(entry.quantityChanged) : "—";
                const remaining = entry.newStock !== undefined ? entry.newStock : "—";
                const unitPrice = entry.unitPrice !== undefined
                  ? `₹ ${entry.unitPrice.toLocaleString()}`
                  : (() => {
                      const item = inventory.find((i) => i.id === entry.itemId);
                      return item?.unitPrice ? `₹ ${item.unitPrice.toLocaleString()}` : "—";
                    })();

                return (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className={`${tdCls} text-muted-foreground whitespace-nowrap`}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </td>
                    <td className={`${tdCls} font-medium text-card-foreground`}>{entry.performedBy || "—"}</td>
                    <td className={`${tdCls} text-muted-foreground`}>{entry.branch}</td>
                    <td className={`${tdCls} font-medium text-card-foreground`}>{entry.itemName}</td>
                    <td className={`${tdCls} font-semibold text-destructive`}>−{allocated} {entry.unit}</td>
                    <td className={`${tdCls} font-semibold text-card-foreground`}>{remaining !== "—" ? `${remaining} ${entry.unit}` : "—"}</td>
                    <td className={`${tdCls} text-muted-foreground`}>{entry.unit}</td>
                    <td className={`${tdCls} font-semibold text-primary`}>{unitPrice}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAlloc.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-secondary/10">
            <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-card-foreground">{filteredAlloc.length}</span> records</p>
          </div>
        )}
      </div>}
    </div>
  );
};

export default InventoryHistoryPage;
