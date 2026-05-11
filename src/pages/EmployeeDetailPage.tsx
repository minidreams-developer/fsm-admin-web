import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Package, Briefcase, CheckCircle, XCircle, Edit2, DollarSign, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useEmployeesStore } from "@/store/employeesStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { useTasksStore } from "@/store/tasksStore";
import { StatusBadge } from "@/components/StatusBadge";
import { EmployeeFormModal } from "@/components/EmployeeFormModal";

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee, updateEmployee, employees } = useEmployeesStore();
  const { workOrders, updateWorkOrder } = useProjectsStore();
  const { inventory } = useInventoryStore();
  const { tasks, updateTask } = useTasksStore();
  const [activeTab, setActiveTab] = useState<"projects" | "inventory" | "cash">("projects");
  const [showEdit, setShowEdit] = useState(false);
  const [projectFilter, setProjectFilter] = useState<"All" | "Open" | "Scheduled" | "Completed">("All");
  const [inventoryFilter, setInventoryFilter] = useState<"All" | "OK" | "Low" | "Critical">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectNote, setCollectNote] = useState("");

  const applyDateFilter = () => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
  };

  const resetDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedFrom("");
    setAppliedTo("");
  };

  const employee = id ? getEmployee(id) : null;
  const isActive = employee?.isActive !== false;
  const assignedProjects = workOrders.filter(wo => wo.assignedTech === employee?.name && wo.status !== "Completed");
  
  // Apply date filter to projects
  let filteredProjects = projectFilter === "All" 
    ? workOrders.filter(wo => wo.assignedTech === employee?.name) 
    : workOrders.filter(wo => wo.assignedTech === employee?.name && wo.status === projectFilter);
  
  // Apply date range filter
  if (appliedFrom || appliedTo) {
    filteredProjects = filteredProjects.filter(wo => {
      const woDate = new Date(wo.end || wo.start);
      let matchDate = true;
      
      if (appliedFrom) {
        const from = new Date(appliedFrom);
        matchDate = matchDate && woDate >= from;
      }
      
      if (appliedTo) {
        const to = new Date(appliedTo);
        matchDate = matchDate && woDate <= to;
      }
      
      return matchDate;
    });
  }
  
  // Get actual allocated inventory for this employee
  const employeeInventoryItems = employee?.id 
    ? inventory.filter(item => 
        item.allocations?.some(alloc => alloc.employeeId === employee.id)
      ).map(item => {
        const allocation = item.allocations?.find(alloc => alloc.employeeId === employee.id);
        return {
          ...item,
          allocatedQuantity: allocation?.quantity || 0,
          allocatedAt: allocation?.allocatedAt
        };
      })
    : [];
    
  const filteredInventory = inventoryFilter === "All" ? employeeInventoryItems : employeeInventoryItems.filter(i => i.status === inventoryFilter);

  // Calculate current inventory balance (allocated qty × unit price)
  const inventoryBalance = employeeInventoryItems.reduce((sum, item) => {
    return sum + (item.allocatedQuantity * (item.unitPrice ?? 0));
  }, 0);
  // Also include items from employee.inventoryItems (legacy assigned items)
  const legacyInventoryCount = employee?.inventoryItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const assignedTasks = tasks.filter(t => t.assignedTo === employee?.name && t.status !== "Completed");
  const otherEmployees = employees.filter(e => e.id !== employee?.id && e.isActive !== false);

  const handleToggleActive = () => {
    if (!employee) return;
    if (isActive) {
      if (assignedProjects.length > 0 || assignedTasks.length > 0) {
        navigate(`/employees/${employee.id}/reassign`);
        return;
      }
    }
    updateEmployee(employee.id, { isActive: !isActive });
    toast.success(`${employee.name} marked as ${isActive ? "Inactive" : "Active"}`);
  };

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
      <div className="flex items-start justify-between gap-3">
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
        
        <div className="flex items-center gap-2">
          {/* Date Filter - Same as Dashboard */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm">
            <span className="text-xs text-muted-foreground">From :</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent text-xs text-card-foreground focus:outline-none w-[120px]"
            />
            <span className="text-xs text-muted-foreground">To :</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={e => setDateTo(e.target.value)}
              className="bg-transparent text-xs text-card-foreground focus:outline-none w-[120px]"
            />
            <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-border">
              <button
                onClick={applyDateFilter}
                disabled={!dateFrom && !dateTo}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                Apply
              </button>
              <button
                onClick={resetDateFilter}
                className="px-3 py-1 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-card-foreground hover:bg-secondary transition-colors"
              >
                Reset
              </button>
            </div>
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
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Orders</p>
            <p className="text-lg font-bold text-card-foreground">{employee.projects}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cash Balance</p>
            <p className="text-lg font-bold text-primary">{employee.cashBalance}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inventory Balance</p>
            <p className="text-lg font-bold text-card-foreground">
              {inventoryBalance > 0
                ? `₹ ${inventoryBalance.toLocaleString()}`
                : legacyInventoryCount > 0
                ? `${legacyInventoryCount} items`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {employeeInventoryItems.length + (employee.inventoryItems?.length || 0)} item type(s) allocated
            </p>
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
          {employee.aadharNumber && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aadhar Number</p>
              <p className="text-lg font-bold text-card-foreground">{employee.aadharNumber}</p>
            </div>
          )}
          {employee.kmTraveled !== undefined && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KM Traveled</p>
              <p className="text-lg font-bold text-card-foreground">{employee.kmTraveled.toLocaleString()} km</p>
            </div>
          )}
          {employee.kmTraveled !== undefined && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Travel Expense</p>
              <p className="text-lg font-bold text-warning">
                ₹ {(employee.kmTraveled * (employee.kmRate ?? 8)).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">@ ₹{employee.kmRate ?? 8}/km</p>
            </div>
          )}
        </div>

        {/* Travel Expense Breakdown */}
        {employee.kmTraveled !== undefined && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-bold text-card-foreground mb-4">Travel Expense Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-secondary/30 border border-border rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total KM</p>
                <p className="text-2xl font-bold text-card-foreground">{employee.kmTraveled.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">km</span></p>
              </div>
              <div className="bg-secondary/30 border border-border rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rate per KM</p>
                <p className="text-2xl font-bold text-card-foreground">₹ {employee.kmRate ?? 8} <span className="text-sm font-medium text-muted-foreground">/km</span></p>
              </div>
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Travel Expense</p>
                <p className="text-2xl font-bold text-warning">₹ {(employee.kmTraveled * (employee.kmRate ?? 8)).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Aadhar Documents */}
        {(employee.aadharDocuments?.length || employee.aadharDocument) && (
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Documents</p>
            <div className="space-y-2">
              {/* Legacy single doc */}
              {employee.aadharDocument && !employee.aadharDocuments?.length && (
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/></svg>
                    <span className="text-sm font-medium text-card-foreground">aadhar_document.pdf</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => {
                      const [header, base64] = employee.aadharDocument!.split(",");
                      const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
                      const bytes = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
                      const blob = new Blob([bytes], { type: mime });
                      const url = URL.createObjectURL(blob);
                      window.open(url, "_blank");
                      setTimeout(() => URL.revokeObjectURL(url), 10000);
                    }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">View</button>
                    <button type="button" onClick={() => {
                      const [header, base64] = employee.aadharDocument!.split(",");
                      const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
                      const bytes = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
                      const blob = new Blob([bytes], { type: mime });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url; a.download = "aadhar_document.pdf"; a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 5000);
                    }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors">Download</button>
                  </div>
                </div>
              )}
              {/* Multiple docs */}
              {employee.aadharDocuments?.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/></svg>
                    <span className="text-sm font-medium text-card-foreground truncate max-w-[200px]">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button type="button" onClick={() => {
                      const [header, base64] = doc.dataUrl.split(",");
                      const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
                      const bytes = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
                      const blob = new Blob([bytes], { type: mime });
                      const url = URL.createObjectURL(blob);
                      window.open(url, "_blank");
                      setTimeout(() => URL.revokeObjectURL(url), 10000);
                    }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">View</button>
                    <button type="button" onClick={() => {
                      const [header, base64] = doc.dataUrl.split(",");
                      const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
                      const bytes = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
                      const blob = new Blob([bytes], { type: mime });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url; a.download = doc.name; a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 5000);
                    }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              onClick={handleToggleActive}
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
            Assigned Work Orders ({assignedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "inventory" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Package className="w-4 h-4" />
            Inventory Items Assigned ({employeeInventoryItems.length})
          </button>
          <button
            onClick={() => setActiveTab("cash")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "cash" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <DollarSign className="w-4 h-4" />
            Cash Collection
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
              <p className="text-sm text-muted-foreground text-center py-6">No work orders found.</p>
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
            <>
              {filteredInventory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No inventory items allocated.</p>
              ) : (
                <div className="space-y-3">
                  {filteredInventory.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-card-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Branch: {item.branch}</p>
                        </div>
                        <StatusBadge label={item.status} variant={item.status === "OK" ? "success" : item.status === "Low" ? "warning" : "neutral"} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <span><p className="text-muted-foreground">balance</p><p className="font-semibold text-primary">{item.allocatedQuantity} {item.unit}</p></span>
                        <span><p className="text-muted-foreground">Available Stock</p><p className="font-semibold text-card-foreground">{item.stock} {item.unit}</p></span>
                        <div><p className="text-muted-foreground">Unit</p><p className="font-semibold text-card-foreground">{item.unit}</p></div>
                      </div>
                      {item.allocatedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Allocated on: {new Date(item.allocatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "cash" && (
            <div className="space-y-6">
              {/* Cash Balance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Cash Balance</p>
                  <p className="text-2xl font-bold text-primary">{employee.cashBalance}</p>
                </div>
                <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Collected</p>
                  <p className="text-2xl font-bold text-success">
                    ₹ {(employee.cashCollections || []).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-secondary/50 border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Collections</p>
                  <p className="text-2xl font-bold text-card-foreground">{(employee.cashCollections || []).length}</p>
                </div>
              </div>

              {/* Collect Cash Form */}
              <div className="bg-secondary/20 border border-border rounded-xl p-5">
                <h4 className="text-sm font-bold text-card-foreground mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Record Cash Collection
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      value={collectAmount}
                      onChange={e => setCollectAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note (optional)</label>
                    <input
                      type="text"
                      value={collectNote}
                      onChange={e => setCollectNote(e.target.value)}
                      placeholder="e.g. Collected from WO-1025"
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const amt = parseFloat(collectAmount);
                    if (!collectAmount || isNaN(amt) || amt <= 0) {
                      toast.error("Enter a valid amount");
                      return;
                    }
                    const newCollection = {
                      id: `COL-${Date.now()}`,
                      amount: amt,
                      collectedAt: new Date().toISOString(),
                      note: collectNote.trim() || undefined,
                    };
                    const existing = employee.cashCollections || [];
                    // Deduct from cash balance
                    const currentBalance = parseInt(employee.cashBalance.replace(/[₹,\s]/g, "")) || 0;
                    const newBalance = Math.max(0, currentBalance - amt);
                    updateEmployee(employee.id, {
                      cashCollections: [...existing, newCollection],
                      cashBalance: `₹ ${newBalance.toLocaleString()}`,
                    });
                    toast.success(`₹ ${amt.toLocaleString()} collected from ${employee.name}`);
                    setCollectAmount("");
                    setCollectNote("");
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  <DollarSign className="w-4 h-4" />
                  Collect Cash
                </button>
              </div>

              {/* Collection History */}
              <div>
                <h4 className="text-sm font-bold text-card-foreground mb-3">Collection History</h4>
                {(employee.cashCollections || []).length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No collections recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...(employee.cashCollections || [])].reverse().map((col) => (
                      <div key={col.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-4 h-4 text-success" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-success">₹ {col.amount.toLocaleString()}</p>
                            {col.note && <p className="text-xs text-muted-foreground truncate">{col.note}</p>}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(col.collectedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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