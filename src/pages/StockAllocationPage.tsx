import { useState } from "react";
import { Package, UserCheck, Search, ArrowRight, CheckCircle, History, Edit2, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventoryStore } from "@/store/inventoryStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useBranchesStore } from "@/store/branchesStore";
import { showToast } from "@/lib/toast";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/table/DataTable";

const StockAllocationPage = () => {
  const navigate = useNavigate();
  const { inventory, updateItem } = useInventoryStore();
  const { employees } = useEmployeesStore();
  const { branches } = useBranchesStore();
  
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedAllocatingUser, setSelectedAllocatingUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allocations, setAllocations] = useState<Record<number, number>>({});
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);
  const [detailsItem, setDetailsItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const activeEmployees = employees.filter(e => e.isActive !== false);
  const branchNames = Array.from(new Set(inventory.map(i => i.branch)));
  
  // Filter employees by selected branch
  const filteredEmployees = selectedBranch 
    ? activeEmployees.filter(emp => emp.branch.includes(selectedBranch))
    : activeEmployees;
  
  const filteredInventory = inventory.filter(item => {
    if (!selectedBranch) return false;
    const matchesBranch = item.branch === selectedBranch;
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
      showToast.error("Please select an employee");
      return;
    }

    if (!selectedAllocatingUser) {
      showToast.error("Please select who is allocating the stock");
      return;
    }

    const allocationEntries = Object.entries(allocations).filter(([_, qty]) => qty > 0);
    
    if (allocationEntries.length === 0) {
      showToast.error("Please enter allocation quantities");
      return;
    }

    let hasError = false;
    allocationEntries.forEach(([itemId, quantity]) => {
      const item = inventory.find(i => i.id === Number(itemId));
      if (item && quantity > item.stock) {
        showToast.error(`Insufficient stock for ${item.name}`);
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
        
        // Add allocatedBy information
        const updatedAllocations = (item.allocations || []).map(alloc => alloc.employeeId === selectedEmployee ? { ...alloc, allocatedBy: selectedAllocatingUser } : alloc);
        const newAllocation = {
          employeeId: selectedEmployee,
          employeeName: selectedEmp?.name || "",
          quantity,
          allocatedAt: new Date().toISOString(),
          allocatedBy: selectedAllocatingUser
        };
        
        updateItem(Number(itemId), { 
          stock: newStock,
          status: newStatus,
          allocations: [...updatedAllocations, newAllocation]
        });
      }
    });

    showToast.success(`${allocationEntries.length} item(s) allocated to ${selectedEmp?.name} by ${selectedAllocatingUser}`);
    setAllocations({});
    setSelectedEmployee("");
  };

  const totalAllocating = Object.values(allocations).reduce((sum, qty) => sum + qty, 0);

  const handleEditAllocation = (itemId: number, employeeId: string, currentQty: number) => {
    setEditingAllocationId(`${itemId}-${employeeId}`);
    setEditingQuantity(currentQty);
  };

  const handleSaveEditAllocation = (itemId: number, employeeId: string, oldQuantity: number) => {
    if (editingQuantity === oldQuantity) {
      setEditingAllocationId(null);
      return;
    }

    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const quantityDifference = editingQuantity - oldQuantity;
    const newStock = item.stock - quantityDifference;

    if (newStock < 0) {
      showToast.error(`Insufficient stock. Available: ${item.stock} ${item.unit}`);
      return;
    }

    // Update inventory stock
    let newStatus = item.status;
    if (newStock <= 0) {
      newStatus = "Critical";
    } else if (newStock < item.reorder) {
      newStatus = "Low";
    } else {
      newStatus = "OK";
    }

    updateItem(itemId, { 
      stock: newStock,
      status: newStatus
    });

    // Update allocation in the item's allocations array
    const updatedAllocations = item.allocations?.map(alloc => 
      alloc.employeeId === employeeId ? { ...alloc, quantity: editingQuantity } : alloc
    ) || [];

    updateItem(itemId, { allocations: updatedAllocations });

    showToast.success(`Allocation updated: ${editingQuantity} ${item.unit} for ${employees.find(e => e.id === employeeId)?.name}`);
    setEditingAllocationId(null);
    setEditingQuantity(0);
  };

  const handleRemoveAllocation = (itemId: number, employeeId: string, quantity: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newStock = item.stock + quantity;
    let newStatus = item.status;
    
    if (newStock > item.reorder) {
      newStatus = "OK";
    } else if (newStock > 0) {
      newStatus = "Low";
    }

    // Remove from allocations array
    const updatedAllocations = item.allocations?.filter(alloc => alloc.employeeId !== employeeId) || [];

    updateItem(itemId, { 
      stock: newStock,
      status: newStatus,
      allocations: updatedAllocations
    });

    showToast.success(`Allocation removed for ${employees.find(e => e.id === employeeId)?.name}`);
  };

  const inventoryTableData = filteredInventory.map((item, index) => ({
  ...item,
  serialNumber: index + 1,
}));

const inventoryColumns = [
  {
    key: "serialNumber",
    header: "#",
    render: (item: any) => (
      <span className="text-xs text-muted-foreground font-medium">
        {item.serialNumber}
      </span>
    ),
  },
  {
    key: "product",
    header: "Product",
    render: (item: any) => {
      const product = products.find((p) => p.name === item.name);

      return (
        <span className="font-medium text-card-foreground text-xs">
          {product?.name || item.name}
        </span>
      );
    },
  },
  {
    key: "branch",
    header: "Branch",
    render: (item: any) => (
      <span className="text-muted-foreground text-xs">
        {item.branch}
      </span>
    ),
  },
  {
    key: "previousQuantity",
    header: "Previous Qty",
    render: (item: any) => (
      <span className="font-semibold text-card-foreground text-xs">
        {item.previousQuantity || "-"}
      </span>
    ),
  },
  {
    key: "stock",
    header: "Stock",
    render: (item: any) => (
      <span className="font-bold text-card-foreground text-xs">
        {item.stock}
      </span>
    ),
  },
  {
    key: "unit",
    header: "Unit",
    render: (item: any) => (
      <span className="text-muted-foreground text-xs">
        {item.unit}
      </span>
    ),
  },
  {
    key: "reorder",
    header: "Reorder Level",
    render: (item: any) => (
      <span className="text-muted-foreground text-xs">
        {item.reorder}
      </span>
    ),
  },
  {
    key: "supplierName",
    header: "Supplier",
    render: (item: any) => (
      <span className="text-muted-foreground text-xs">
        {item.supplierName || "-"}
      </span>
    ),
  },
  {
    key: "supplierContact",
    header: "Supplier Contact",
    render: (item: any) => (
      <span className="text-muted-foreground text-xs">
        {item.supplierContact || "-"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item: any) => (
      <StatusBadge
        label={item.status}
        variant={
          statusMap[item.status as keyof typeof statusMap] || "neutral"
        }
      />
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (item: any) => (
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleEdit(item)}
          className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            deleteItem(item.id);
            showToast.success("Inventory item deleted");
          }}
          className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Stock Allocation</h2>
          <p className="text-sm text-muted-foreground">Allocate inventory items to field employees</p>
        </div>
        <button
          onClick={() => navigate("/inventory/history?type=allocate")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 border border-border text-card-foreground bg-card transition-all"
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* Branch Selection Card */}
      <div className="bg-card rounded-xl p-6 card-shadow border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Select Branch</h3>
            <p className="text-xs text-muted-foreground">Choose the branch for stock allocation</p>
          </div>
        </div>
        
        <select
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            setSelectedEmployee(""); // Reset employee when branch changes
            setAllocations({}); // Reset allocations
          }}
          className="w-full px-4 py-3 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
        >
          <option value="">-- Select Branch --</option>
          {branchNames.map(branch => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>

        {selectedBranch && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Selected Branch</p>
                <p className="font-semibold text-card-foreground">{selectedBranch}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Available Employees</p>
                <p className="font-semibold text-card-foreground">{filteredEmployees.length}</p>
              </div>
            </div>
          </div>
        )}
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
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
          disabled={!selectedBranch}
        >
          <option value="">-- Select Employee --</option>
          {filteredEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.id}) - {emp.role}
            </option>
          ))}
        </select>

        {!selectedBranch && (
          <p className="mt-2 text-xs text-muted-foreground">Please select a branch first</p>
        )}

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

      {/* Allocated By Selection Card */}
      <div className="bg-card rounded-xl p-6 card-shadow border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Allocating User</h3>
            <p className="text-xs text-muted-foreground">Who is allocating this stock?</p>
          </div>
        </div>
        
        <select
          value={selectedAllocatingUser}
          onChange={(e) => setSelectedAllocatingUser(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
        >
          <option value="">-- Select Allocating User --</option>
          {activeEmployees.map(emp => (
            <option key={emp.id} value={emp.name}>
              {emp.name} ({emp.role})
            </option>
          ))}
        </select>

        {selectedAllocatingUser && (
          <div className="mt-2 p-2 bg-success/10 rounded border border-success/20">
            <p className="text-xs text-success font-medium">Allocating as: <span className="font-bold">{selectedAllocatingUser}</span></p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search Products</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              disabled={!selectedBranch}
            />
          </div>
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

        

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
  <DataTable
    columns={inventoryColumns}
    data={inventoryTableData}
    getRowKey={(item) => item.id}
    onRowClick={(item) => {
      setDetailsItem(item);
      setShowDetails(true);
    }}
    emptyMessage="No inventory items found."
  />
    </div>
</div>

      {/* Action Button */}
      {selectedBranch && selectedEmployee && filteredInventory.length > 0 && (
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

      {/* Allocated Stock Management */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Allocated Stock</h3>
          <p className="text-xs text-muted-foreground ml-auto">Edit or remove employee allocations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Branch</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Allocated Qty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Allocated By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Allocated Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.filter(item => item.allocations && item.allocations.length > 0).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No allocations yet</p>
                  </td>
                </tr>
              ) : (
                inventory
                  .filter(item => item.allocations && item.allocations.length > 0)
                  .flatMap(item => 
                    item.allocations!.map(alloc => ({
                      itemId: item.id,
                      itemName: item.name,
                      branch: item.branch,
                      unit: item.unit,
                      ...alloc
                    }))
                  )
                  .map((allocation, idx) => {
                    const isEditing = editingAllocationId === `${allocation.itemId}-${allocation.employeeId}`;
                    const emp = employees.find(e => e.id === allocation.employeeId);
                    return (
                      <tr key={idx} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-card-foreground">{allocation.itemName}</p>
                        </td>
                        <td className="px-4 py-3 text-card-foreground">{emp?.name || allocation.employeeName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{allocation.branch}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editingQuantity}
                              onChange={(e) => setEditingQuantity(Number(e.target.value))}
                              className="w-24 px-2 py-1 rounded-lg bg-background text-sm border border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground font-bold"
                            />
                          ) : (
                            <span className="font-bold text-card-foreground">{allocation.quantity}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{allocation.unit}</td>
                        <td className="px-4 py-3 text-sm text-card-foreground font-medium">{allocation.allocatedBy || "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(allocation.allocatedAt).toLocaleDateString('en-IN', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEditAllocation(allocation.itemId, allocation.employeeId, allocation.quantity)}
                                className="p-1 hover:bg-success/10 rounded transition-colors text-success hover:text-success/80"
                                title="Save"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingAllocationId(null)}
                                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-card-foreground"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditAllocation(allocation.itemId, allocation.employeeId, allocation.quantity)}
                                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-primary"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveAllocation(allocation.itemId, allocation.employeeId, allocation.quantity)}
                                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-destructive"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockAllocationPage;
