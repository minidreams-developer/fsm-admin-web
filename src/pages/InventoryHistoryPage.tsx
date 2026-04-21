import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { History, TrendingUp, TrendingDown, Plus, Trash2, UserCheck, Edit, Package, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";

const InventoryHistoryPage = () => {
  const { history, inventory } = useInventoryStore();
  const [filterAction, setFilterAction] = useState<string>("All");
  const [filterBranch, setFilterBranch] = useState<string>("All");
  const [filterProduct, setFilterProduct] = useState<string>("All");

  // Get unique branches and products for filters
  const branches = ["All", ...Array.from(new Set(history.map((h) => h.branch)))];
  const products = ["All", ...Array.from(new Set(history.map((h) => h.itemName)))];

  // Filter history
  const filteredHistory = history.filter((entry) => {
    if (filterAction !== "All" && entry.action !== filterAction) return false;
    if (filterBranch !== "All" && entry.branch !== filterBranch) return false;
    if (filterProduct !== "All" && entry.itemName !== filterProduct) return false;
    return true;
  });

  // Get action icon and color
  const getActionDetails = (action: string) => {
    switch (action) {
      case "Added":
        return { icon: Plus, color: "text-success", bg: "bg-success/10" };
      case "Restocked":
        return { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" };
      case "Updated":
        return { icon: Edit, color: "text-warning", bg: "bg-warning/10" };
      case "Deleted":
        return { icon: Trash2, color: "text-destructive", bg: "bg-destructive/10" };
      case "Allocated":
        return { icon: UserCheck, color: "text-info", bg: "bg-info/10" };
      default:
        return { icon: Package, color: "text-muted-foreground", bg: "bg-secondary" };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM dd, yyyy HH:mm");
    } catch {
      return timestamp;
    }
  };

  // Stats
  const totalTransactions = history.length;
  const restockCount = history.filter((h) => h.action === "Restocked").length;
  const allocationCount = history.filter((h) => h.action === "Allocated").length;
  const addedCount = history.filter((h) => h.action === "Added").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Inventory History</h2>
          <p className="text-sm text-muted-foreground">Complete transaction log of all inventory activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-card-foreground">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg flex-shrink-0">
              <Plus className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Items Added</p>
              <p className="text-2xl font-bold text-card-foreground">{addedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Restocks</p>
              <p className="text-2xl font-bold text-card-foreground">{restockCount}</p>
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
              <p className="text-2xl font-bold text-card-foreground">{allocationCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 card-shadow border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-card-foreground">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Actions</option>
              <option value="Added">Added</option>
              <option value="Restocked">Restocked</option>
              <option value="Updated">Updated</option>
              <option value="Allocated">Allocated</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Branch</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch === "All" ? "All Branches" : branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {products.map((product) => (
                <option key={product} value={product}>
                  {product === "All" ? "All Products" : product}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Branch
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Previous Stock
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Change
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  New Stock
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((entry) => {
                const { icon: Icon, color, bg } = getActionDetails(entry.action);
                return (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <span className={`text-xs font-semibold ${color}`}>{entry.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-card-foreground">{entry.itemName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{entry.branch}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {entry.previousStock !== undefined ? `${entry.previousStock} ${entry.unit}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">
                      {entry.quantityChanged !== undefined ? (
                        <span className={entry.quantityChanged > 0 ? "text-success" : "text-destructive"}>
                          {entry.quantityChanged > 0 ? "+" : ""}
                          {entry.quantityChanged} {entry.unit}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-card-foreground">
                      {entry.newStock !== undefined ? `${entry.newStock} ${entry.unit}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {entry.notes || "-"}
                      {entry.performedBy && (
                        <span className="block text-xs text-primary mt-0.5">By: {entry.performedBy}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <History className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No history records found</p>
                      <p className="text-xs text-muted-foreground">
                        {filterAction !== "All" || filterBranch !== "All" || filterProduct !== "All"
                          ? "Try adjusting your filters"
                          : "Inventory transactions will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredHistory.length > 0 && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-card-foreground">{filteredHistory.length}</span> of{" "}
            <span className="font-semibold text-card-foreground">{totalTransactions}</span> transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryHistoryPage;
