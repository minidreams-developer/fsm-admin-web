import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus, Clipboard, Calendar, User, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { useLeadsStore } from "@/store/leadsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useBranchesStore } from "@/store/branchesStore";
import { PaginationControls } from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { toast } from "sonner";
import { DataTable } from "@/components/table/Datatable";

const statusMap = {
  "Authorization Pending": "warning",
  Ongoing: "success",
  Upcoming: "info",
  Overdue: "error",
  Missed: "error",
  Cancelled: "neutral",
  Completed: "neutral",
  Converted: "info",
} as const;

const ProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workOrders } = useProjectsStore();
  const { getLead, updateLead } = useLeadsStore();
  const { employees } = useEmployeesStore();
  const { branches: branchList } = useBranchesStore();
  const activeEmployees = employees.filter(e => e.isActive !== false);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Authorization Pending" | "Ongoing" | "Upcoming" | "Overdue" | "Missed" | "Cancelled" | "Completed" | "Converted">("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStart, setAppliedStart] = useState("");
  const [appliedEnd, setAppliedEnd] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [convertedLeadName, setConvertedLeadName] = useState("");

  useEffect(() => {
    const convertLeadId = searchParams.get("convertLeadId");
    if (convertLeadId) {
      const lead = getLead(parseInt(convertLeadId));
      if (lead) {
        setShowSuccessMessage(true);
        setConvertedLeadName(lead.name || "");
        updateLead(parseInt(convertLeadId), { status: "Converted" });
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    }
  }, [searchParams, getLead, updateLead]);

  const getPaymentProgress = (project: WorkOrder) => {
    const total = parseInt(project.totalValue.replace(/[₹,\s]/g, ""));
    const paid = parseInt(project.paidAmount.replace(/[₹,\s]/g, ""));
    return Math.round((paid / total) * 100);
  };

  const filtered = workOrders.filter((wo) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      wo.customer.toLowerCase().includes(q) ||
      wo.id.toLowerCase().includes(q) ||
      wo.address.toLowerCase().includes(q);

    const matchStatus = statusFilter === "All" || wo.status === statusFilter;

    const matchStart = !appliedStart || (wo.start && wo.start >= appliedStart);
    const matchEnd = !appliedEnd || (wo.end && wo.end <= appliedEnd);
    
    const matchEmployee = employeeFilter === "All" || wo.assignedTech === employeeFilter || wo.salesExecutive === employeeFilter;
    const matchBranch = branchFilter === "All" || wo.location === branchFilter;

    return matchSearch && matchStatus && matchStart && matchEnd && matchEmployee && matchBranch;
  });

  const pagination = usePagination({
    items: filtered,
    itemsPerPage: 10,
  });

  const workOrderColumns = [
  {
    key: "id",
    header: "Work Order ID",
    render: (project: any) => (
      <div className="font-semibold text-primary text-xs">
        {project.id}
      </div>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (project: any) => (
      <div>
        <div className="font-semibold text-card-foreground text-xs">
          {project.customer}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {project.address}
        </div>
      </div>
    ),
  },
  {
    key: "services",
    header: "Services",
    render: (project: any) => {
      const services = project.serviceTypes?.length
        ? project.serviceTypes
        : project.serviceType?.trim()
          ? [project.serviceType]
          : [];

      const count = services.length;

      const serviceNames = services.map((svc: string) => {
        const match = svc.match(/^([^(]+)/);
        return match ? match[1].trim() : svc;
      });

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {count}
            </span>
            <span className="text-xs text-muted-foreground">
              {count === 1 ? "Service" : "Services"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {serviceNames.slice(0, 2).map((name: string, idx: number) => (
              <div
                key={idx}
                className="text-xs bg-primary/5 text-primary px-2 py-1 rounded whitespace-nowrap truncate"
              >
                📦 {name}
              </div>
            ))}

            {count > 2 && (
              <div className="text-xs text-muted-foreground px-2 py-0.5">
                +{count - 2} more
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    key: "start",
    header: "Start Date",
    render: (project: any) => (
      <span className="text-xs text-muted-foreground">
        {project.start || "—"}
      </span>
    ),
  },
  {
    key: "end",
    header: "End Date",
    render: (project: any) => (
      <span className="text-xs text-muted-foreground">
        {project.end || "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (project: any) => (
      <StatusBadge
        label={project.status}
        variant={
          (statusMap[
            project.status as keyof typeof statusMap
          ] as any) || "neutral"
        }
      />
    ),
  },
];

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccessMessage && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-success">
            ✓ Leads "{convertedLeadName}" has been converted to a Work Order. Now assign a technician to start the service.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Work Orders</h2>
          <p className="text-sm text-muted-foreground">View and manage all work orders and AMCs.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => navigate("/create-work-order")} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            <Plus className="w-4 h-4" />
            Create Work Order
          </button>
        </div>
      </div>

{/* card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg flex-shrink-0">
              <Clipboard className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Authorization Pending</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Authorization Pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Ongoing</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Ongoing").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Upcoming").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Missed</p>
              <p className="text-2xl font-bold text-card-foreground">{workOrders.filter((p) => p.status === "Missed").length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-neutral/10 rounded-lg flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Cancelled").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Completed This Month</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Completed").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Converted</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Converted").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Contract Value</p>
              <p className="text-2xl font-bold text-card-foreground">
                ₹{(workOrders.reduce((sum, p) => sum + parseInt(p.totalValue.replace(/[₹,\s]/g, "")), 0) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Branches</option>
            {branchList.filter(b => b.status === "Active").map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Employees</option>
            {activeEmployees.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name} — {emp.role}</option>
            ))}
          </select>

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or location..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

       <div className="flex flex-col sm:flex-row sm:items-end gap-3">
  <div className="w-full sm:w-auto flex flex-col gap-1">
    <label className="text-xs text-muted-foreground sm:hidden">Start Date</label>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="w-full sm:w-auto px-3 py-2 rounded-lg border border-border bg-card text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  </div>

  <div className="w-full sm:w-auto flex flex-col gap-1">
    <label className="text-xs text-muted-foreground sm:hidden">End Date</label>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="w-full sm:w-auto px-3 py-2 rounded-lg border border-border bg-card text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  </div>

  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <button
      onClick={() => {
        setAppliedStart(startDate);
        setAppliedEnd(endDate);
      }}
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
      style={{
        background:
          "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)",
      }}
    >
      <Calendar className="w-3.5 h-3.5" />
      Filter
    </button>

    <button
      onClick={() => {
        setStartDate("");
        setEndDate("");
        setAppliedStart("");
        setAppliedEnd("");
      }}
      className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
    >
      Reset
    </button>
  </div>
</div>

        <div className="flex items-center gap-2 flex-wrap">
          {(["All", "Authorization Pending", "Ongoing", "Upcoming", "Overdue", "Missed", "Cancelled", "Completed", "Converted"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${statusFilter === s ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card border border-border text-muted-foreground hover:text-card-foreground"}`}
              style={statusFilter === s ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
            >
              {s} ({s === "All" ? workOrders.length : workOrders.filter(w => w.status === s).length})
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders Table */}
<div className="bg-card rounded-xl card-shadow overflow-hidden">
  <DataTable
    columns={workOrderColumns}
    data={pagination.paginatedItems}
    getRowKey={(project) => project.id}
    onRowClick={(project) => navigate(`/work-order/${project.id}`)}
    emptyMessage="No work orders found."
  />
</div>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={filtered.length}
        onPageChange={pagination.setCurrentPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
      />
    </div>
  );
};

export default ProjectsPage;
