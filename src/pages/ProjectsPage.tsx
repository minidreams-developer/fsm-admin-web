import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus, Clipboard, Calendar, User, CreditCard, Eye, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { useLeadsStore } from "@/store/leadsStore";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

const statusMap = {
  "Authorization Pending": "warning",
  Ongoing: "success",
  Upcoming: "info",
  Missed: "destructive",
  Cancelled: "neutral",
  Completed: "neutral",
  Converted: "info",
} as const;

const ProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workOrders } = useProjectsStore();
  const { getLead, updateLead } = useLeadsStore();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"All" | "Due Today">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Authorization Pending" | "Ongoing" | "Upcoming" | "Missed" | "Cancelled" | "Completed" | "Converted">("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
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

  const today = new Date();
  const isSameLocalDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const parseNextServiceDate = (value: string) => {
    const ts = Date.parse(value);
    if (Number.isNaN(ts)) return null;
    return new Date(ts);
  };

  const isDueToday = (wo: WorkOrder) => {
    const date = parseNextServiceDate(wo.nextService);
    if (!date) return false;
    return isSameLocalDay(date, today);
  };

  const filtered = workOrders.filter((wo) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      wo.customer.toLowerCase().includes(q) ||
      wo.id.toLowerCase().includes(q) ||
      wo.address.toLowerCase().includes(q);

    const matchDate = dateFilter === "All" ? true : isDueToday(wo);
    const matchStatus = statusFilter === "All" || wo.status === statusFilter;

    const matchStart = !appliedStart || (wo.start && wo.start >= appliedStart);
    const matchEnd = !appliedEnd || (wo.end && wo.end <= appliedEnd);

    return matchSearch && matchDate && matchStatus && matchStart && matchEnd;
  });

  const getPaymentProgress = (project: WorkOrder) => {
    const total = parseInt(project.totalValue.replace(/[₹,\s]/g, ""));
    const paid = parseInt(project.paidAmount.replace(/[₹,\s]/g, ""));
    return Math.round((paid / total) * 100);
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filtered.map((wo) => ({
        'Work Order ID': wo.id,
        'Customer': wo.customer,
        'Phone': wo.phone,
        'Email': wo.email || '-',
        'Address': wo.address,
        'Site Address': wo.siteAddress || '-',
        'Billing Address': wo.billingAddress || '-',
        'Subject': wo.subject,
        'Service Type': wo.serviceType,
        'Frequency': wo.frequency,
        'Total Value': wo.totalValue,
        'Paid Amount': wo.paidAmount,
        'Payment Progress': `${getPaymentProgress(wo)}%`,
        'Start Date': wo.start,
        'End Date': wo.end || '-',
        'Status': wo.status,
        'Assigned Tech': wo.assignedTech,
        'Next Service': wo.nextService,
        'Notes': wo.notes || '-',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Work Order ID
        { wch: 25 }, // Customer
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 30 }, // Address
        { wch: 30 }, // Site Address
        { wch: 30 }, // Billing Address
        { wch: 30 }, // Subject
        { wch: 20 }, // Service Type
        { wch: 15 }, // Frequency
        { wch: 15 }, // Total Value
        { wch: 15 }, // Paid Amount
        { wch: 15 }, // Payment Progress
        { wch: 12 }, // Start Date
        { wch: 12 }, // End Date
        { wch: 15 }, // Status
        { wch: 20 }, // Assigned Tech
        { wch: 15 }, // Next Service
        { wch: 30 }, // Notes
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Work Orders');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `Work_Orders_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast.success(`Exported ${filtered.length} work order${filtered.length !== 1 ? 's' : ''} to Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccessMessage && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-success">
            ✓ Enquiry "{convertedLeadName}" has been converted to a Work Order. Now assign a technician to start the service.
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
            onClick={handleExportToExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
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

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or location..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-card text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-card text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button
              onClick={() => { setAppliedStart(startDate); setAppliedEnd(endDate); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Filter
            </button>
            <button
              onClick={() => { setStartDate(""); setEndDate(""); setAppliedStart(""); setAppliedEnd(""); }}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(["All", "Authorization Pending", "Ongoing", "Upcoming", "Missed", "Cancelled", "Completed", "Converted"] as const).map((s) => (
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Work Order ID", "Customer", "Services", "Start Date", "End Date", "Status"].map((h) => (
                <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} onClick={() => navigate(`/work-order/${project.id}`)} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="px-3 py-3">
                  <div className="font-semibold text-primary text-xs">{project.id}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-semibold text-card-foreground text-xs">{project.customer}</div>
                  <div className="text-xs text-muted-foreground truncate">{project.address}</div>
                </td>
                <td className="px-3 py-3">
                  {(() => {
                    const count = project.serviceTypes?.length
                      ? project.serviceTypes.length
                      : project.serviceType?.trim() ? 1 : 0;
                    return (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">{count}</span>
                        <span className="text-xs text-muted-foreground">{count === 1 ? "Service" : "Services"}</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{project.start || "—"}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{project.end || "—"}</td>
                <td className="px-3 py-3">
                  <StatusBadge label={project.status} variant={statusMap[project.status as keyof typeof statusMap] || "neutral"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsPage;
