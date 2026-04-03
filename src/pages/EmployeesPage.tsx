import { Search, Plus, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeesStore, type Employee } from "@/store/employeesStore";
import { useBranchesStore } from "@/store/branchesStore";
import { EmployeeFormModal } from "@/components/EmployeeFormModal";

const PAGE_SIZE = 6;

const EmployeesPage = () => {
  const { employees } = useEmployeesStore();
  const { branches: branchList } = useBranchesStore();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const branches = ["All", ...branchList.filter(b => b.status === "Active").map(b => b.name)];

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === "All" || (e.branch || []).includes(branchFilter);
    return matchSearch && matchBranch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Employees</h2>
          <p className="text-sm text-muted-foreground">Track productivity and time management</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all hover:opacity-90"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search employees..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-card-foreground">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Active Employees</p>
              <p className="text-2xl font-bold text-card-foreground">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Inactive Employees</p>
              <p className="text-2xl font-bold text-card-foreground">0</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Avg Performance</p>
              <p className="text-2xl font-bold text-card-foreground">
                {employees.length > 0
                  ? Math.round(employees.reduce((sum, e) => sum + (parseInt(e.performance) || 0), 0) / employees.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={branchFilter}
          onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-48"
        >
          {branches.map(b => (
            <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>
          ))}
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((e) => {
          const productivity = e.totalHours > 0 ? Math.round((e.serviceHours / e.totalHours) * 100) : 0;
          const perfValue = parseInt(e.performance) || 0;
          const perfColor = perfValue >= 90 ? "text-success" : perfValue >= 75 ? "text-warning" : "text-destructive";
          const perfBg = perfValue >= 90 ? "bg-success" : perfValue >= 75 ? "bg-warning" : "bg-destructive";
          const perfLabel = perfValue >= 90 ? "Excellent" : perfValue >= 75 ? "Good" : "Needs Improvement";
          const perfLabelColor = perfValue >= 90 ? "bg-success/10 text-success border-success/20" : perfValue >= 75 ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20";
          return (
            <div
              key={e.id}
              onClick={() => navigate(`/employees/${e.id}`)}
              className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all cursor-pointer group border border-border"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <span className="text-lg font-bold text-primary">{e.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-card-foreground">{e.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${perfLabelColor}`}>{perfLabel}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.role} • {e.id}</p>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Performance</span>
                  <span className={`text-xs font-bold ${perfColor}`}>{e.performance}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${perfBg} transition-all`} style={{ width: `${perfValue}%` }} />
                </div>
              </div>

              {/* Productivity Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Productivity</span>
                  <span className="text-xs font-bold text-primary">{productivity}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${productivity}%` }} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Services</p>
                  <p className="text-sm font-bold text-card-foreground">{e.servicesCompleted}</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">Hours</p>
                  <p className="text-sm font-bold text-card-foreground">{e.totalHours}h</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Work Orders</p>
                  <p className="text-sm font-bold text-card-foreground">{e.projects}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} employees
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  p === page
                    ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                    : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
                style={p === page ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      <EmployeeFormModal
        open={showAddModal}
        mode="create"
        onClose={() => setShowAddModal(false)}
        onSaved={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default EmployeesPage;
