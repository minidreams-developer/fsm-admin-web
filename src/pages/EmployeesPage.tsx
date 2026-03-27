import { Search, AlertCircle, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeesStore, type Employee } from "@/store/employeesStore";
import { EmployeeFormModal } from "@/components/EmployeeFormModal";

const EmployeesPage = () => {
  const { employees } = useEmployeesStore();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

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

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Productivity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((e) => {
          const productivityRatio = (e.serviceHours / e.totalHours) * 100;
          return (
            <div
              key={e.id}
              onClick={() => navigate(`/employees/${e.id}`)}
              className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <span className="text-lg font-bold text-primary">{e.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground">{e.name}</h3>
                  <p className="text-xs text-muted-foreground">{e.role}</p>
                </div>
              </div>

              {/* Employee Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Employee ID</span>
                  <span className="text-sm font-semibold text-card-foreground">{e.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Full Name</span>
                  <span className="text-sm font-semibold text-card-foreground">{e.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
                  <span className="text-sm font-semibold text-card-foreground">{e.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Role/Position</span>
                  <span className="text-sm font-semibold text-card-foreground">{e.role}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
