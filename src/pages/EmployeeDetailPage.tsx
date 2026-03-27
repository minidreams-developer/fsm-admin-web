import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Package, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useEmployeesStore } from "@/store/employeesStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { StatusBadge } from "@/components/StatusBadge";

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee } = useEmployeesStore();
  const { workOrders } = useProjectsStore();
  const { inventory } = useInventoryStore();
  const [isActive, setIsActive] = useState(true);

  const employee = id ? getEmployee(id) : null;

  // Get projects assigned to this employee
  const assignedProjects = workOrders.filter(wo => wo.assignedTech === employee?.name);

  // Mock inventory items taken by employee (in real app, would be tracked separately)
  const employeeInventoryItems = inventory.slice(0, 3);

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
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{employee.name}</h2>
          <p className="text-sm text-muted-foreground">{employee.id}</p>
        </div>
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

        {/* Assigned Projects */}
        {assignedProjects.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Assigned Projects ({assignedProjects.length})
            </h3>
            <div className="space-y-3">
              {assignedProjects.map((project) => (
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
          </div>
        )}

        {/* Inventory Items */}
        {employeeInventoryItems.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Items Assigned
            </h3>
            <div className="space-y-3">
              {employeeInventoryItems.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-card-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Branch: {item.branch}</p>
                    </div>
                    <StatusBadge 
                      label={item.status} 
                      variant={item.status === "OK" ? "success" : item.status === "Low" ? "warning" : "destructive"} 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Stock</p>
                      <p className="font-semibold text-card-foreground">{item.stock} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reorder</p>
                      <p className="font-semibold text-card-foreground">{item.reorder} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit</p>
                      <p className="font-semibold text-card-foreground">{item.unit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
