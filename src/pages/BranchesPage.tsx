import { StatusBadge } from "@/components/StatusBadge";
import { BranchFormModal } from "@/components/BranchFormModal";
import { BranchDetailsModal } from "@/components/BranchDetailsModal";
import { useBranchesStore, type Branch } from "@/store/branchesStore";
import { Plus, Search, Edit2, Trash2, MapPin, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BranchesPage = () => {
  const { branches, deleteBranch } = useBranchesStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  const [detailsBranch, setDetailsBranch] = useState<Branch | null>(null);

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()),
  );

  const activeBranches = branches.filter((b) => b.status === "Active").length;
  const totalStaff = branches.length * 3; // Placeholder calculation

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteBranch(id);
      toast.success(`Branch deleted: ${name}`);
    }
  };

  const handleAddNew = () => {
    setSelectedBranch(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBranch(undefined);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Branches</h2>
          <p className="text-sm text-muted-foreground">Manage your business locations and branch operations</p>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Branches</p>
          <p className="text-2xl font-bold text-card-foreground">{branches.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Active Branches</p>
          <p className="text-2xl font-bold text-card-foreground">{activeBranches}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-card-foreground">{totalStaff}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Branch Types</p>
          <p className="text-2xl font-bold text-card-foreground">{new Set(branches.map((b) => b.type)).size}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search branches..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Branch ID", "Name", "Type", "Location", "Manager", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((branch) => (
                  <tr key={branch.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{branch.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-card-foreground">{branch.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{branch.type}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{branch.city}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{branch.managerName}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={branch.status} variant={branch.status === "Active" ? "success" : "warning"} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setDetailsBranch(branch);
                            setShowDetails(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(branch)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id, branch.name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    No branches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BranchFormModal open={showForm} mode={formMode} branch={selectedBranch} onClose={handleFormClose} />
      <BranchDetailsModal open={showDetails} branch={detailsBranch} onClose={() => setShowDetails(false)} />

      {/* Details Modal */}
      {showDetails && detailsBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
          <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Branch Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Branch ID</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Type</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.status}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.address}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">City</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.city}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">State</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.state}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Postal Code</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.postalCode}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Contact Number</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.contactNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Manager Name</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.managerName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Operating Hours</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.operatingHoursFrom} - {detailsBranch.operatingHoursTo}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Established Date</p>
                  <p className="text-sm text-card-foreground">{detailsBranch.establishedDate}</p>
                </div>
                {detailsBranch.notes && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-card-foreground">{detailsBranch.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
