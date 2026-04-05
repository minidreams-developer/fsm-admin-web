import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, CheckCircle, Clock, AlertCircle, MapPin, Phone, Mail, DollarSign, Calendar, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useProjectsStore } from "@/store/projectsStore";
import { useTasksStore } from "@/store/tasksStore";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkOrderEditModal } from "@/components/WorkOrderEditModal";
import { TaskEditModal } from "@/components/TaskEditModal";
import { toast } from "sonner";

export const WorkOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWorkOrder } = useProjectsStore();
  const { getTasksByWorkOrder, deleteTask } = useTasksStore();
  const [isEditingWorkOrder, setIsEditingWorkOrder] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const workOrder = id ? getWorkOrder(id) : null;
  const tasks = id ? getTasksByWorkOrder(id) : [];

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteTask(taskId);
      toast.success("Service deleted successfully!");
      setRefreshKey(prev => prev + 1);
    }
  };

  if (!workOrder) {
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
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Work Order</h2>
            <p className="text-sm text-muted-foreground">Work order not found</p>
          </div>
        </div>
        <div className="bg-card rounded-xl card-shadow p-6">
          <p className="text-sm text-muted-foreground">This work order may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
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
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{workOrder.id}</h2>
            <p className="text-sm text-muted-foreground">{workOrder.customer}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditingWorkOrder(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Work Order Details Card */}
      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        {/* Header Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">{workOrder.subject}</h1>
              <p className="text-lg text-muted-foreground mt-2">{workOrder.serviceType}</p>
            </div>
            <StatusBadge 
              label={workOrder.status} 
              variant={workOrder.status === "Completed" ? "neutral" : workOrder.status === "Scheduled" ? "success" : "warning"} 
            />
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Customer Info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
            <p className="text-lg font-bold text-card-foreground">{workOrder.customer}</p>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference</p>
            <p className="text-lg font-bold text-card-foreground">{workOrder.reference || workOrder.id}</p>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</p>
            <p className="text-lg font-bold text-card-foreground">{workOrder.frequency}</p>
          </div>

          {/* Work Order Incharge */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Order Incharge</p>
            <p className="text-lg font-bold text-primary">{workOrder.assignedTech}</p>
          </div>
        </div>

        {/* Contact & Location Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Contact & Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Address</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.siteAddress || workOrder.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-success flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Value</p>
                <p className="text-lg font-bold text-success">{workOrder.totalValue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid Amount</p>
                <p className="text-lg font-bold text-warning">{workOrder.paidAmount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-lg font-bold text-card-foreground">
                  ₹ {Math.max(0, parseInt(workOrder.totalValue.replace(/[₹,]/g, "")) - parseInt(workOrder.paidAmount.replace(/[₹,]/g, ""))).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.start}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.end}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Service</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.nextService}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {workOrder.notes && (
          <div className="mb-8 pb-8 border-b border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-3">Notes</h3>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-card-foreground">{workOrder.notes}</p>
            </div>
          </div>
        )}

        {/* Period Information */}
        {workOrder.period && (
          <div>
            <h3 className="text-lg font-bold text-card-foreground mb-3">Period</h3>
            <p className="text-sm text-card-foreground">{workOrder.period}</p>
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              Services ({tasks.length})
            </h2>
          </div>

          {/* Service Progress */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold text-card-foreground">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-success h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-muted-foreground">Completed: <span className="font-semibold text-card-foreground">{completedTasks}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-muted-foreground">In Progress: <span className="font-semibold text-card-foreground">{inProgressTasks}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pending: <span className="font-semibold text-card-foreground">{pendingTasks}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Grid */}
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-secondary/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate(`/service/${task.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-card-foreground">{task.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{task.description || "No description"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTaskId(task.id);
                      }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                      title="Edit service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-border">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</p>
                    {task.assignedEmployees && task.assignedEmployees.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.assignedEmployees.map((employee, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded border border-primary/20"
                          >
                            {employee}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-card-foreground mt-1">{task.assignedTo}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                    <div className="mt-1">
                      <StatusBadge
                        label={task.status}
                        variant={
                          task.status === "Completed"
                            ? "success"
                            : task.status === "In Progress"
                            ? "warning"
                            : "info"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start</p>
                      <p className="text-xs font-semibold text-card-foreground">{task.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">End</p>
                      <p className="text-xs font-semibold text-card-foreground">{task.endDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks added for this work order yet</p>
          </div>
        )}
      </div>

      {/* Edit Modals */}
      <WorkOrderEditModal
        workOrder={workOrder}
        isOpen={isEditingWorkOrder}
        onClose={() => setIsEditingWorkOrder(false)}
        onSave={() => setRefreshKey(prev => prev + 1)}
      />

      {editingTaskId && (
        <TaskEditModal
          task={tasks.find(t => t.id === editingTaskId)!}
          isOpen={!!editingTaskId}
          onClose={() => setEditingTaskId(null)}
          onSave={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default WorkOrderDetailsPage;
