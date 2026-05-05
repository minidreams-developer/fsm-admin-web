import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useProjectsStore } from "@/store/projectsStore";
import { useEmployeesStore } from "@/store/employeesStore";

const BulkAssignPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workOrders, updateWorkOrder } = useProjectsStore();
  const { employees } = useEmployeesStore();

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([]);

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      setSelectedWorkOrders(ids.split(","));
    } else {
      // If no IDs, redirect back to projects
      navigate("/projects");
    }
  }, [searchParams, navigate]);

  const workOrdersToAssign = workOrders.filter(wo => selectedWorkOrders.includes(wo.id));

  const handleAssign = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    // Update all selected work orders with the assigned employee
    workOrdersToAssign.forEach(wo => {
      updateWorkOrder(wo.id, { assignedTech: selectedEmployee });
    });

    toast.success(`Successfully assigned ${workOrdersToAssign.length} work order${workOrdersToAssign.length !== 1 ? 's' : ''} to ${selectedEmployee}`);
    navigate("/projects");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Bulk Assign Work Orders</h2>
          <p className="text-sm text-muted-foreground">
            Assign {workOrdersToAssign.length} work order{workOrdersToAssign.length !== 1 ? 's' : ''} to an employee
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Work Orders */}
        <div className="bg-card rounded-xl p-6 card-shadow border border-border">
          <h3 className="text-base font-bold text-card-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Selected Work Orders ({workOrdersToAssign.length})
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {workOrdersToAssign.map((wo) => (
              <div
                key={wo.id}
                className="bg-secondary/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">{wo.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {wo.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-card-foreground mb-1">{wo.customer}</p>
                    <p className="text-xs text-muted-foreground truncate">{wo.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Service:</span>
                      <span className="text-xs font-medium text-card-foreground">{wo.serviceType}</span>
                    </div>
                    {wo.assignedTech && (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Currently: <span className="font-medium text-card-foreground">{wo.assignedTech}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Selection */}
        <div className="bg-card rounded-xl p-6 card-shadow border border-border">
          <h3 className="text-base font-bold text-card-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Assign to Employee
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Select Employee *
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Choose an employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} — {emp.role}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-medium text-muted-foreground mb-2">Assignment Summary</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">Employee:</span>
                    <span className="text-sm font-semibold text-primary">{selectedEmployee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">Work Orders:</span>
                    <span className="text-sm font-semibold text-primary">{workOrdersToAssign.length}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4">
                This will assign all selected work orders to the chosen employee. The employee will be set as the assigned technician for these work orders.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/projects")}
                  className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedEmployee}
                  className="flex-1 h-10 text-sm font-semibold text-white rounded-lg hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  Assign Work Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignPage;
