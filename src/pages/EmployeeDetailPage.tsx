import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useEmployeesStore } from "@/store/employeesStore";

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee } = useEmployeesStore();

  const employee = id ? getEmployee(id) : null;

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

      <div className="bg-card rounded-xl p-6 card-shadow border border-border">
        {/* Header Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">{employee.name[0]}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-card-foreground">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            </div>
          </div>
        </div>

        {/* All Information in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Personal Information */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Employee ID</span>
            <span className="text-sm font-semibold text-card-foreground">{employee.id}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Phone</span>
            <span className="text-sm font-semibold text-card-foreground">{employee.phone}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Clock In</span>
            <span className="text-sm font-semibold text-card-foreground">{employee.clockIn}</span>
          </div>

          {/* Time Information */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Clock Out</span>
            <span className="text-sm font-semibold text-card-foreground">{employee.clockOut}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Total Hours</span>
            <span className="text-sm font-semibold text-primary">{employee.totalHours}h</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Service Hours</span>
            <span className="text-sm font-semibold text-success">{employee.serviceHours}h</span>
          </div>

          {/* Hours Breakdown */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Break Hours</span>
            <span className="text-sm font-semibold text-warning">{employee.breakHours}h</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Idle Hours</span>
            <span className="text-sm font-semibold text-muted-foreground">{employee.idleHours}h</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Productivity</span>
            <span className="text-sm font-semibold text-success">
              {((employee.serviceHours / employee.totalHours) * 100).toFixed(0)}%
            </span>
          </div>

          {/* Performance Metrics */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Services Completed</span>
            <span className="text-sm font-semibold text-card-foreground">{employee.servicesCompleted}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Avg Time/Service</span>
            <span className="text-sm font-semibold text-card-foreground">{employee.avgServiceTime}h</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Projects Assigned</span>
            <span className="text-sm font-semibold text-card-foreground">{employee.projects}</span>
          </div>

          {/* Financial Information */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Cash Balance</span>
            <span className="text-sm font-semibold text-primary">{employee.cashBalance}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Performance Rating</span>
            <span className="text-sm font-semibold text-success">{employee.performance}</span>
          </div>
        </div>

        {/* Insights */}
        {employee.idleHours > 1.5 && (
          <div className="mt-6 pt-6 border-t border-border">
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
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
