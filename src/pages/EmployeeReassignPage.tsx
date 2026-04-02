import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useEmployeesStore } from "@/store/employeesStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useTasksStore } from "@/store/tasksStore";

export const EmployeeReassignPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee, updateEmployee, employees } = useEmployeesStore();
  const { workOrders, updateWorkOrder } = useProjectsStore();
  const { tasks, updateTask } = useTasksStore();

  const employee = id ? getEmployee(id) : null;
  const otherEmployees = employees.filter(e => e.id !== id && e.isActive !== false);

  const assignedProjects = workOrders.filter(wo => wo.assignedTech === employee?.name && wo.status !== "Completed");
  const assignedTasks = tasks.filter(t => t.assignedTo === employee?.name && t.status !== "Completed");

  const [woReassign, setWoReassign] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    assignedProjects.forEach(wo => { init[wo.id] = ""; });
    return init;
  });
  const [taskReassign, setTaskReassign] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    assignedTasks.forEach(t => { init[t.id] = ""; });
    return init;
  });

  if (!employee) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/employees")} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-lg font-bold text-card-foreground">Employee not found</h2>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    const allWoAssigned = assignedProjects.every(wo => woReassign[wo.id]);
    const allTaskAssigned = assignedTasks.every(t => taskReassign[t.id]);
    if (!allWoAssigned || !allTaskAssigned) {
      toast.error("Please reassign all work orders and tasks before inactivating.");
      return;
    }
    assignedProjects.forEach(wo => updateWorkOrder(wo.id, { assignedTech: woReassign[wo.id] }));
    assignedTasks.forEach(t => updateTask(t.id, { assignedTo: taskReassign[t.id] }));
    updateEmployee(employee.id, { isActive: false });
    toast.success(`${employee.name} has been marked Inactive and all assignments reassigned.`);
    navigate(`/employees/${employee.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(`/employees/${employee.id}`)} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Reassign Before Inactivating</h2>
          <p className="text-sm text-muted-foreground">{employee.name} has active assignments. Reassign all to proceed.</p>
        </div>
      </div>

      <div className="space-y-6">
        {assignedProjects.length > 0 && (
          <div className="bg-card rounded-xl card-shadow border border-border p-6">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Work Orders ({assignedProjects.length})</h3>
            <div className="space-y-3">
              {assignedProjects.map(wo => (
                <div key={wo.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/work-order/${wo.id}`)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        {wo.id}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-xs text-muted-foreground">{wo.customer} — {wo.serviceType}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-warning/10 text-warning border border-warning/20">{wo.status}</span>
                  </div>
                  <select
                    value={woReassign[wo.id] || ""}
                    onChange={e => setWoReassign(prev => ({ ...prev, [wo.id]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select new Work Order Incharge</option>
                    {otherEmployees.map(e => (
                      <option key={e.id} value={e.name}>{e.name} — {e.role}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignedTasks.length > 0 && (
          <div className="bg-card rounded-xl card-shadow border border-border p-6">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Tasks ({assignedTasks.length})</h3>
            <div className="space-y-3">
              {assignedTasks.map(t => (
                <div key={t.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.workOrderId} — {t.status}</p>
                    </div>
                  </div>
                  <select
                    value={taskReassign[t.id] || ""}
                    onChange={e => setTaskReassign(prev => ({ ...prev, [t.id]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select new assignee</option>
                    {otherEmployees.map(e => (
                      <option key={e.id} value={e.name}>{e.name} — {e.role}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignedProjects.length === 0 && assignedTasks.length === 0 && (
          <div className="bg-card rounded-xl card-shadow border border-border p-6">
            <p className="text-sm text-muted-foreground text-center">No active assignments found. You can inactivate this employee directly.</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(`/employees/${employee.id}`)} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white rounded-lg transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          Reassign & Inactivate
        </button>
      </div>
    </div>
  );
};

export default EmployeeReassignPage;
