import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Package, Briefcase, CheckCircle, XCircle, Edit2 } from "lucide-react";
import { useState } from "react";
import { useEmployeesStore } from "@/store/employeesStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { StatusBadge } from "@/components/StatusBadge";
import { EmployeeFormModal } from "@/components/EmployeeFormModal";

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee } = useEmployeesStore();
  const { workOrders } = useProjectsStore();
  const { inventory } = useInventoryStore();
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "inventory">("projects");
  const [showEdit, setShowEdit] = useState(false);
  const [projectFilter, setProjectFilter] = useState<"All" | "Open" | "Scheduled" | "Completed">("All");
  const [inventoryFilter, setInventoryFilter] = useState<"All" | "OK" | "Low" | "Critical">("All");

  const employee = id ? getEmployee(id) : null;
  const assignedProjects = workOrders.filter(wo => wo.assignedTech === employee?.name);
  const filteredProjects = projectFilter === "All" ? assignedProjects : assignedProjects.filter(wo => wo.status === projectFilter);
  const employeeInventoryItems = inventory.slice(0, 3);
  const filteredInventory = inventoryFilter === "All" ? employeeInventoryItems : employeeInventoryItems.filter(i => i.status === inventoryFilter);

  if (!employee) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Employee</h2>
            <p className="text-sm text-muted-foreground">Employee not found</p>
          </div>
        </div>
        <div className="bg-card rounded-xl card-shadow p-6">
          <p className="text-sm text-muted-foreground">This employee may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/employees")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{employee.name}</h2>
          <p className="text-sm text-muted-foreground">{employee.id}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        {/* Header Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-primary">{employee.name[0]}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-card-foreground">{employee.name}</h1>
              <p className="text-lg text-muted-foreground mt-1">{employee.role}</p>
              <p className="text-sm text-muted-foreground mt-2">{employee.id}</p>
            </div>
          </div>
        </div>

        {/* All Information in Unified Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Personal Information */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
            <p className="text-lg font-bold text-card-foreground">{employee.phone}</p>
          </div>

          {/* Time Tracking */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clock In</p>
            <p className="text-lg font-bold text-card-foreground">{employee.clockIn}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clock Out</p>
            <p className="text-lg font-bold text-card-foreground">{employee.clockOut}</p>
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Hours</p>
            <p className="text-lg font-bold text-primary">{employee.totalHours}h</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Hours</p>
            <p className="text-lg font-bold text-success">{employee.serviceHours}h</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Break Hours</p>
            <p className="text-lg font-bold text-warning">{employee.breakHours}h</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Idle Hours</p>
            <p className="text-lg font-bold text-muted-foreground">{employee.idleHours}h</p>
          </div>

          {/* Performance */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Productivity</p>
            <p className="text-lg font-bold text-success">
              {((employee.serviceHours / employee.totalHours) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services Done</p>
            <p className="text-lg font-bold text-card-foreground">{employee.servicesCompleted}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Time</p>
            <p className="text-lg font-bold text-card-foreground">{employee.avgServiceTime}h</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</p>
            <p className="text-lg font-bold text-card-foreground">{employee.projects}</p>
          </div>

          {/* Financial */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cash Balance</p>
            <p className="text-lg font-bold text-primary">{employee.cashBalance}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Generated</p>
            <p className="text-lg font-bold text-success">
              ₹ {assignedProjects.reduce((sum, wo) => {
                const val = parseInt(wo.totalValue.replace(/[₹,\s]/g, ""));
                return sum + (Number.isFinite(val) ? val : 0);
              }, 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance</p>
            <p className="text-lg font-bold text-success">{employee.performance}</p>
          </div>
        </div>

        {/* Insights */}
        {employee.idleHours > 1.5 && (
          <div className="mt-8 pt-8 border-t border-border">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">High Idle Time</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {employee.name} has {employee.idleHours}h of idle time. Consider optimizing schedule.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active/Inactive Status */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-card-foreground">Employee Status</h3>
              <p className="text-sm text-muted-foreground mt-1">Toggle employee active/inactive status</p>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                isActive
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {isActive ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Inactive
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed card for Projects & Inventory */}
      <div className="bg-card rounded-xl card-shadow border border-border">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "projects" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Briefcase className="w-4 h-4" />
            Assigned Projects ({assignedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "inventory" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Package className="w-4 h-4" />
            Inventory Items Assigned ({employeeInventoryItems.length})
          </button>
        </div>

        {/* Filter bar */}
        {activeTab === "projects" && (
          <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-border">
            {(["All", "Open", "Scheduled", "Completed"] as const).map((f) => (
              <button key={f} onClick={() => setProjectFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${projectFilter === f ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                style={projectFilter === f ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
              >{f}</button>
            ))}
          </div>
        )}
        {activeTab === "inventory" && (
          <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-border">
            {(["All", "OK", "Low", "Critical"] as const).map((f) => (
              <button key={f} onClick={() => setInventoryFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${inventoryFilter === f ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                style={inventoryFilter === f ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
              >{f}</button>
            ))}
          </div>
        )}

        <div className="p-6">
          {activeTab === "projects" && (
            filteredProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No projects found.</p>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/work-order/${project.id}`)}
                    className="w-full p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 hover:border-primary/30 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground">{project.id}</p>
                        <p className="text-sm text-muted-foreground">{project.customer}</p>
                      </div>
                      <StatusBadge label={project.status} variant={project.status === "Completed" ? "neutral" : project.status === "Scheduled" ? "success" : "warning"} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{project.serviceType}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{project.address}</span>
                      <span className="font-semibold text-primary">{project.totalValue}</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === "inventory" && (
            filteredInventory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No inventory items found.</p>
            ) : (
              <div className="space-y-3">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Branch: {item.branch}</p>
                      </div>
                      <StatusBadge label={item.status} variant={item.status === "OK" ? "success" : item.status === "Low" ? "warning" : "destructive"} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Stock</p><p className="font-semibold text-card-foreground">{item.stock} {item.unit}</p></div>
                      <div><p className="text-muted-foreground">Unit</p><p className="font-semibold text-card-foreground">{item.unit}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <EmployeeFormModal
        open={showEdit}
        mode="edit"
        employee={employee}
        onClose={() => setShowEdit(false)}
      />
    </div>
  );
};

export default EmployeeDetailPage;