import { useState } from "react";
import { Package, UserCheck, Search, ArrowRight, CheckCircle } from "lucide-react";
import { useInventoryStore } from "@/store/inventoryStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useBranchesStore } from "@/store/branchesStore";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";

const StockAllocationPage = () => {
  const { inventory, updateItem } = useInventoryStore();
  const { employees } = useEmployeesStore();
  const { branches } = useBranchesStore();
  
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allocations, setAllocations] = useState<Record<number, number>>({});

  const activeEmployees = employees.filter(e => e.isActive !== false);
  const branchNames = ["All", ...Array.from(new Set(inventory.map(i => i.branch)))];
  
  const filteredInventory = inventory.filter(item => {
    const matchesBranch = selectedBranch === "All" || item.branch === selectedBranch;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch && item.stock > 0;
  });

  const selectedEmp = employees.find(e => e.id === selectedEmployee);
  const employeeBranches = selectedEmp?.branch || [];

  const handleAllocationChange = (itemId: number, quantity: number) => {
    setAllocations(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const handleAllocate = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    const allocationEntries = Object.entries(allocations).filter(([_, qty]) => qty > 0);
    
    if (allocationEntries.length === 0) {
      toast.error("Please enter allocation quantities");
      return;
    }

    let hasError = false;
    allocationEntries.forEach(([itemId, quantity]) => {
      const item = inventory.find(i => i.id === Number(itemId));
      if (item && quantity > item.stock) {
        toast.error(`Insufficient stock for ${item.name}`);
        hasError = true;
      }
    });

    if (hasError) return;

    allocationEntries.forEach(([itemId, quantity]) => {
      const item = inventory.find(i => i.id === Number(itemId));
      if (item) {
        const newStock = item.stock - quantity;
        let newStatus = item.status;
        
        if (newStock <= 0) {
          newStatus = "Critical";
        } else if (newStock < item.reorder) {
          newStatus = "Low";
        }
        
        updateItem(Number(itemId), { 
          stock: newStock,
          status: newStatus
        });
      }
    });

    toast.success(`${allocationEntries.length} item(s) allocated to ${selectedEmp?.name}`);
    setAllocations({});
    setSelectedEmployee("");
  };

  const totalAllocating = Object.values(allocations).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Stock Allocation</h2>
          <p className="text-sm text-muted-foreground">Allocate inventory items to field employees</p>
        </div>
      </div>

      {/* Employee Selection Card */}
      <div className="bg-card rounded-xl p-6 card-shadow border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Select Employee</h3>
            <p className="text-xs text-muted-foreground">Choose the employee to allocate stock</p>
          </div>
        </div>
        
        <select
          value={selectedEmployee}
          onChange={(e) => {
            setSelectedEmployee(e.target.value);
            const emp = employees.find(em => em.id === e.target.value);
            if (emp && emp.branch.length > 0) {
              setSelectedBranch(emp.branch[0]);
            }
          }}
          className="w-full px-4 py-3 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
        >
          <option value="">-- Select Employee --</option>
          {activeEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.id}) - {emp.branch.join(", ")}
            </option>
          ))}
        </select>

        {selectedEmp && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Employee</p>
                <p className="font-semibold text-card-foreground">{selectedEmp.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Role</p>
                <p className="font-semibold text-card-foreground">{selectedEmp.role}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Branch(es)</p>
                <p className="font-semibold text-card-foreground">{selectedEmp.branch.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="font-semibold text-card-foreground">{selectedEmp.phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:max-w-xs">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            disabled={!selectedEmployee}
          >
            {branchNames.map(b => (
              <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>
            ))}
          </select>
        </div>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
            disabled={!selectedEmployee}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Available Stock</h3>
          </div>
          {totalAllocating > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Total items allocating: </span>
              <span className="font-bold text-primary">{totalAllocating}</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Branch</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Available</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Allocate Qty</th>
              </tr>
            </thead>
            <tbody>
              {!selectedEmployee ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-secondary/30 rounded-full">
                        <UserCheck className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Please select an employee to start allocation</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No inventory items available</p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isEmployeeBranch = employeeBranches.includes(item.branch);
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-border last:border-0 hover:bg-secondary/20 transition-colors ${!isEmployeeBranch ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground">{item.name}</p>
                          {!isEmployeeBranch && (
                            <span className="text-xs text-warning">(Different branch)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.branch}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-card-foreground">{item.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          label={item.status} 
                          variant={item.status === "OK" ? "success" : item.status === "Low" ? "warning" : "error"} 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={item.stock}
                          value={allocations[item.id] || ""}
                          onChange={(e) => handleAllocationChange(item.id, Number(e.target.value))}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Button */}
      {selectedEmployee && filteredInventory.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleAllocate}
            disabled={totalAllocating === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            <CheckCircle className="w-4 h-4" />
            Allocate Stock to {selectedEmp?.name}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StockAllocationPage;
