import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus, Clipboard, Calendar, User, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { useLeadsStore } from "@/store/leadsStore";

const statusMap = {
  Scheduled: "success",
  Open: "warning",
  Completed: "neutral",
} as const;

const ProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workOrders } = useProjectsStore();
  const { getLead, updateLead } = useLeadsStore();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"All" | "Due Today">("All");
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

    return matchSearch && matchDate;
  });

  const getPaymentProgress = (project: WorkOrder) => {
    const total = parseInt(project.totalValue.replace(/[₹,\s]/g, ""));
    const paid = parseInt(project.paidAmount.replace(/[₹,\s]/g, ""));
    return Math.round((paid / total) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccessMessage && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-success">
            ✓ Lead "{convertedLeadName}" has been converted to a Work Order. Now assign a technician to start the service.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Work Orders</h2>
          <p className="text-sm text-muted-foreground">View and manage all work orders and AMCs.</p>
        </div>
        <button 
          onClick={() => navigate("/create-work-order")} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <Plus className="w-4 h-4" />
          Create Work Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg flex-shrink-0">
              <Clipboard className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Not Yet Scheduled</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Open").length}
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
              <p className="text-xs font-medium text-muted-foreground mb-1">Scheduled & Active</p>
              <p className="text-2xl font-bold text-card-foreground">
                {workOrders.filter((p) => p.status === "Scheduled").length}
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
              <p className="text-xs font-medium text-muted-foreground mb-1">Due Today</p>
              <p className="text-2xl font-bold text-card-foreground">{workOrders.filter(isDueToday).length}</p>
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

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
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
          {(["All", "Due Today"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDateFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                dateFilter === t
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((wo) => {
          const paymentProgress = getPaymentProgress(wo);
          return (
            <div
              key={wo.id}
              className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all cursor-pointer group border border-border"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <span className="text-lg font-bold text-primary">{wo.customer[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground">{wo.customer}</h3>
                  <p className="text-xs text-muted-foreground truncate">{wo.id}</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clipboard className="w-3 h-3" />
                    Service Type
                  </span>
                  <span className="text-sm font-semibold text-card-foreground">{wo.serviceType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Status
                  </span>
                  <StatusBadge label={wo.status} variant={statusMap[wo.status as keyof typeof statusMap] || "neutral"} />
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Total Value
                  </span>
                  <span className="text-sm font-semibold text-primary">{wo.totalValue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Payment Progress</span>
                  <span className="text-sm font-semibold text-card-foreground">{paymentProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="text-xs text-muted-foreground truncate">{wo.address}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Work Order ID", "Customer", "Service Type", "Status", "Payment", "Next Service"].map((h) => (
                <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-3 py-3">
                  <div className="font-semibold text-primary text-xs">{project.id}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-semibold text-card-foreground text-xs">{project.customer}</div>
                  <div className="text-xs text-muted-foreground truncate">{project.address}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-xs text-card-foreground">{project.serviceType}</div>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge label={project.status} variant={statusMap[project.status as keyof typeof statusMap] || "neutral"} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${getPaymentProgress(project)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{getPaymentProgress(project)}%</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-xs text-card-foreground">{project.nextService}</div>
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
