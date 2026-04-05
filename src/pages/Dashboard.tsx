import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { FolderKanban, CreditCard, Wallet, AlertTriangle, Plus, Wrench, Eye, Package, Filter, Calendar, ChevronDown, X, Search, TrendingUp, CheckCircle2, Clock, AlertCircle, ClipboardList, Edit2, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useLeadsStore, type UrgencyLevel, type LeadStatus } from "@/store/leadsStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { useBranchesStore } from "@/store/branchesStore";
import type { WorkOrder } from "@/store/projectsStore";

const allDummyCustomers = Array.from({ length: 50 }, (_, i) => ({
  name: ["Praveen Kumar", "Hotel Grand", "Lakshmi Stores", "Suresh Nair", "Ramesh Singh", "Anitha Raj", "Vijay Enterprises", "Meena Textiles", "Ravi & Sons", "Deepa Clinic"][i % 10] + (i >= 10 ? ` ${Math.floor(i / 10) + 1}` : ""),
  value: Math.max(500, 52000 - i * 980),
}));

function WorkOrderReports({ workOrders }: { workOrders: WorkOrder[] }) {
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const total = workOrders.length;
  const open = workOrders.filter(w => w.status === "Open").length;
  const scheduled = workOrders.filter(w => w.status === "Scheduled").length;
  const completed = workOrders.filter(w => w.status === "Completed").length;

  const totalRevenue = workOrders.reduce((sum, w) => sum + (parseInt(w.totalValue.replace(/[₹,\s]/g, "")) || 0), 0);
  const totalCollected = workOrders.reduce((sum, w) => sum + (parseInt(w.paidAmount.replace(/[₹,\s]/g, "")) || 0), 0);
  const totalPending = totalRevenue - totalCollected;
  const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;

  const statusData = [
    { name: "Open", value: open, color: "hsl(38, 92%, 50%)" },
    { name: "Scheduled", value: scheduled, color: "hsl(236, 60%, 39%)" },
    { name: "Completed", value: completed, color: "hsl(142, 72%, 40%)" },
  ];

  // Top customers by revenue
  const customerRevenue: Record<string, number> = {};
  workOrders.forEach(w => {
    const val = parseInt(w.totalValue.replace(/[₹,\s]/g, "")) || 0;
    customerRevenue[w.customer] = (customerRevenue[w.customer] || 0) + val;
  });
  const topCustomers = Object.entries(customerRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-card-foreground">Work Order Reports</h3>
        <p className="text-xs text-muted-foreground">Overview of all work orders and revenue</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg"><FolderKanban className="w-4 h-4 text-primary" /></div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </div>
          <p className="text-2xl font-bold text-card-foreground">{total}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-success/10 rounded-lg"><CheckCircle2 className="w-4 h-4 text-success" /></div>
            <p className="text-xs text-muted-foreground">Billing</p>
          </div>
          <p className="text-2xl font-bold text-success">{completed}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-warning/10 rounded-lg"><Clock className="w-4 h-4 text-warning" /></div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          <p className="text-2xl font-bold text-warning">{scheduled}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg"><AlertCircle className="w-4 h-4 text-destructive" /></div>
            <p className="text-xs text-muted-foreground">Open</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{open}</p>
        </div>
      </div>

      {/* Revenue + Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Summary */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <h4 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Revenue Summary</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-bold text-card-foreground">₹ {totalRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2"><div className="h-full bg-primary rounded-full" style={{ width: "100%" }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-bold text-success">₹ {totalCollected.toLocaleString()}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2"><div className="h-full bg-success rounded-full" style={{ width: `${collectionRate}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-bold text-destructive">₹ {totalPending.toLocaleString()}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2"><div className="h-full bg-destructive rounded-full" style={{ width: `${100 - collectionRate}%` }} /></div>
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-xs">
              <span className="text-muted-foreground">Collection Rate</span>
              <span className="font-bold text-primary">{collectionRate}%</span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <h4 className="text-sm font-semibold text-card-foreground mb-4">Status Distribution</h4>
          <div className="flex items-center justify-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground text-xs">{s.name}</span>
                  <span className="font-bold text-card-foreground ml-1">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-card-foreground">Top Customers by Revenue</h4>
            <button
              onClick={() => setShowAllCustomers(!showAllCustomers)}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              {showAllCustomers ? "Show Less" : "See More"}
            </button>
          </div>
          <div className={`space-y-3 overflow-y-auto transition-all ${showAllCustomers ? "max-h-[400px]" : ""}`}>
            {(showAllCustomers ? allDummyCustomers : topCustomers).map((c, i) => {
              const pct = showAllCustomers
                ? Math.round((c.value / allDummyCustomers[0].value) * 100)
                : totalRevenue > 0 ? Math.round((c.value / totalRevenue) * 100) : 0;
              return (
                <div key={c.name + i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-card-foreground">{i + 1}. {c.name}</span>
                    <span className="text-muted-foreground">₹ {c.value.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const revenueData = [
  { day: "Mon", expected: 4200, collected: 3800 },
  { day: "Tue", expected: 3800, collected: 3600 },
  { day: "Wed", expected: 5100, collected: 4200 },
  { day: "Thu", expected: 4500, collected: 4500 },
  { day: "Fri", expected: 4800, collected: 3200 },
  { day: "Sat", expected: 3200, collected: 2800 },
  { day: "Sun", expected: 1500, collected: 1200 },
];

const taskData = [
  { name: "Completed", value: 20, color: "hsl(142, 72%, 40%)" },
  { name: "Upcoming", value: 8, color: "hsl(236, 60%, 39%)" },
  { name: "Overdue", value: 5, color: "hsl(0, 72%, 51%)" },
];

const serviceData = [
  { day: "Mon", scheduled: 8, completed: 7 },
  { day: "Tue", scheduled: 6, completed: 6 },
  { day: "Wed", scheduled: 10, completed: 8 },
  { day: "Thu", scheduled: 7, completed: 5 },
  { day: "Fri", scheduled: 9, completed: 4 },
  { day: "Sat", scheduled: 5, completed: 0 },
];

const recentServices = [
  { id: "#SV-1042", customer: "Praveen Kumar", tech: "Safeeq", mode: "UPI (GPay)", amount: "₹ 850", status: "Pending Verification", badge: "warning" as const, action: "Verify Ref ID" },
  { id: "#SV-1043", customer: "Ramesh Singh", tech: "Safeeq", mode: "Cash", amount: "₹ 700", status: "Cash with Tech", badge: "info" as const, action: "Settle Cash" },
  { id: "#SV-1040", customer: "Hotel Grand", tech: "Rajesh", mode: "Pre-paid", amount: "₹ 2,500", status: "Completed", badge: "success" as const, action: "View Report" },
  { id: "#SV-1039", customer: "Lakshmi Stores", tech: "Arun", mode: "UPI (PhonePe)", amount: "₹ 1,200", status: "Verified", badge: "success" as const, action: "View Report" },
  { id: "#SV-1038", customer: "Suresh Nair", tech: "Safeeq", mode: "Cash", amount: "₹ 450", status: "Cash with Tech", badge: "info" as const, action: "Settle Cash" },
];

const quickActions = [
  { label: "Add New Enquiry", icon: Plus, path: null, color: "text-white hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)]", style: { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } },
  { label: "Pending Payments", icon: Eye, path: "/payments", color: "text-white hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)]", style: { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } },
  { label: "Quick Stock Update", icon: Package, path: "/inventory", color: "text-white hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)]", style: { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } },
];

const statusBadgeMap: Record<LeadStatus, "info" | "warning" | "success" | "error" | "neutral"> = {
  New: "info", Contacted: "warning", "Quote Sent": "warning", "Follow Up": "info", Converted: "success", Lost: "error",
};
const leadStatuses: (LeadStatus | "All")[] = ["All", "New", "Contacted", "Follow Up", "Converted", "Lost"];

function formatLeadId(id: number) {
  return `ENQ-${String(id).padStart(4, "0")}`;
}

function DashboardLeadsSection() {
  const navigate = useNavigate();
  const { leads, updateLead } = useLeadsStore();
  const { branches: branchList } = useBranchesStore();
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [reminderLeadId, setReminderLeadId] = useState<number | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderText, setReminderText] = useState("");

  const filtered = leads.filter((l) => {
    const matchStatus = filter === "All" || l.status === filter;
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
    const matchBranch = branchFilter === "All" || l.branch === branchFilter;
    return matchStatus && matchSearch && matchBranch;
  });

  const saveReminder = (leadId: number) => {
    if (!reminderDate || !reminderText.trim()) return;
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const newReminder = { id: `REM-${Date.now()}`, date: reminderDate, text: reminderText.trim(), createdAt: new Date().toISOString() };
    updateLead(leadId, { reminders: [...(lead.reminders ?? []), newReminder] });
    setReminderDate(""); setReminderText(""); setReminderLeadId(null);
  };

  return (
    <div className="bg-card rounded-xl card-shadow overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-card-foreground">Enquiries</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Branches</option>
              {branchList.filter(b => b.status === "Active").map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search enquiries..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-44"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {leadStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${filter === s ? "text-white" : "bg-secondary text-muted-foreground hover:text-foreground border border-border"}`}
                  style={filter === s ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Enquiry ID", "Customer Name", "Services", "Urgency", "Enquiry Incharge", "Next Follow-Up Date", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-xs text-muted-foreground">No enquiries found.</td></tr>
            ) : filtered.map(l => (
              <tr
                key={l.id}
                onClick={() => navigate(`/leads/${l.id}`)}
                className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-3 py-2.5 font-semibold text-primary text-xs">{formatLeadId(l.id)}</td>
                <td className="px-3 py-2.5 font-medium text-card-foreground text-xs">{l.name}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">{l.services.length}</span>
                    <span className="text-xs text-muted-foreground">{l.services.length === 1 ? "Service" : "Services"}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.urgencyLevel}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.assignedOwner || "—"}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.nextFollowUpDate || "—"}</td>
                <td className="px-3 py-2.5"><StatusBadge label={l.status} variant={statusBadgeMap[l.status]} /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/leads/${l.id}`); }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                      title="Edit enquiry"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setReminderLeadId(reminderLeadId === l.id ? null : l.id); setReminderDate(""); setReminderText(""); }}
                        className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                        title="Add reminder"
                      >
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        {(l.reminders?.length ?? 0) > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">{l.reminders?.length}</span>
                        )}
                      </button>
                      {reminderLeadId === l.id && (
                        <div className="absolute right-0 top-10 z-50 w-72 bg-card border border-border rounded-xl shadow-2xl p-4 space-y-2">
                          <p className="text-xs font-semibold text-card-foreground">Add Reminder</p>
                          <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          <input value={reminderText} onChange={e => setReminderText(e.target.value)} placeholder="Reminder text..." className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          <div className="flex gap-2">
                            <button onClick={() => saveReminder(l.id)} className="flex-1 h-8 text-xs font-semibold hover:opacity-90 text-white rounded-lg transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Save</button>
                            <button onClick={() => setReminderLeadId(null)} className="flex-1 h-8 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { addLead } = useLeadsStore();
  const { workOrders } = useProjectsStore();
  const { inventory } = useInventoryStore();
  const [stockBranchFilter, setStockBranchFilter] = useState("All");
  const [showStockBranchDropdown, setShowStockBranchDropdown] = useState(false);
  const stockBranchDropdownRef = useRef<HTMLDivElement>(null);
  const [revenueFilter, setRevenueFilter] = useState("This Week");
  const [serviceFilter, setServiceFilter] = useState("This Week");
  const [servicesTableFilter, setServicesTableFilter] = useState("Recent");
  const [serviceBreakdownFilter, setServiceBreakdownFilter] = useState("Today");
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showServicesTableDropdown, setShowServicesTableDropdown] = useState(false);
  const [showServiceBreakdownDropdown, setShowServiceBreakdownDropdown] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Global date range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

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

  const filteredWorkOrders = workOrders.filter(w => {
    if (!appliedFrom && !appliedTo) return true;
    const d = new Date(w.start);
    if (appliedFrom && d < new Date(appliedFrom)) return false;
    if (appliedTo && d > new Date(appliedTo + "T23:59:59")) return false;
    return true;
  });
  const [showLeadMoreFields, setShowLeadMoreFields] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: "",
    phone: "",
    address: "",
    services: [] as string[],
    amount: "",
    expectedDateTime: "",
    leadSource: "",
    urgencyLevel: "Medium" as UrgencyLevel,
    branch: "",
    salesExecutive: "",
    notes: "",
  });
  const [serviceSearch, setServiceSearch] = useState("");
  const [showLeadServiceDropdown, setShowLeadServiceDropdown] = useState(false);

  const allServices = ["Cockroach Control", "Termite Control", "Bed Bug Treatment", "Rodent Control", "General Pest"];
  const filteredServices = allServices.filter(s => s.toLowerCase().includes(serviceSearch.toLowerCase()) && !leadFormData.services.includes(s));

  const revenueDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const servicesTableDropdownRef = useRef<HTMLDivElement>(null);
  const serviceBreakdownDropdownRef = useRef<HTMLDivElement>(null);
  const leadServiceDropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = ["This Week", "This Month", "This Year"];
  const servicesTableOptions = ["Recent", "This Week", "This Month", "All Time"];
  const serviceBreakdownOptions = ["Today", "This Week", "This Month"];
  const urgencyLevels: UrgencyLevel[] = ["Low", "Medium", "High"];
  const leadSources = ["Website", "Call", "Referral", "Walk-in", "Google", "Facebook/Instagram", "Other"];
  const branches = ["Kochi", "Calicut", "Thrissur", "Trivandrum", "Palakkad", "Munnar", "Other"];

  const canSaveLead = Boolean(
    leadFormData.name.trim() &&
    leadFormData.phone.trim() &&
    leadFormData.address.trim() &&
    leadFormData.services.length > 0
  );

  const resetLeadForm = () => {
    setLeadFormData({
      name: "",
      phone: "",
      address: "",
      services: [],
      amount: "",
      expectedDateTime: "",
      leadSource: "",
      urgencyLevel: "Medium",
      branch: "",
      salesExecutive: "",
      notes: "",
    });
    setServiceSearch("");
    setShowLeadServiceDropdown(false);
    setShowLeadMoreFields(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (revenueDropdownRef.current && !revenueDropdownRef.current.contains(event.target as Node)) {
        setShowRevenueDropdown(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
      if (servicesTableDropdownRef.current && !servicesTableDropdownRef.current.contains(event.target as Node)) {
        setShowServicesTableDropdown(false);
      }
      if (serviceBreakdownDropdownRef.current && !serviceBreakdownDropdownRef.current.contains(event.target as Node)) {
        setShowServiceBreakdownDropdown(false);
      }
      if (leadServiceDropdownRef.current && !leadServiceDropdownRef.current.contains(event.target as Node)) {
        setShowLeadServiceDropdown(false);
      }
      if (stockBranchDropdownRef.current && !stockBranchDropdownRef.current.contains(event.target as Node)) {
        setShowStockBranchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of today's activities and key metrics</p>
        </div>
        {/* Global Date Range Filter */}
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
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Work Orders" value="24" trend="+2 this week" trendType="up" icon={FolderKanban} />
        <KPICard title="Pending Payments" value="₹ 12,450" trend="-5% vs last month" trendType="down" icon={CreditCard} />
        <KPICard title="Cash to Settle" value="₹ 5,800" trend="From technicians" trendType="neutral" icon={Wallet} />
        <KPICard title="Low Stock Items" value="3" trend="Needs reordering" trendType="warning" icon={AlertTriangle} />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((a) => (
          a.path ? (
            <Link
              key={a.label}
              to={a.path}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 ${a.color}`}
              style={a.style}
            >
              <a.icon className="w-4 h-4" />
              {a.label}
            </Link>
          ) : (
            <button
              key={a.label}
              onClick={() => setShowAddLeadModal(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 ${a.color}`}
              style={a.style}
            >
              <a.icon className="w-4 h-4" />
              {a.label}
            </button>
          )
        ))}
        <button
          onClick={() => navigate("/service-management")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <Wrench className="w-4 h-4" />
          Service Management
        </button>
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <ClipboardList className="w-4 h-4" />
          Work Orders
        </button>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-card-foreground">Weekly Revenue</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 40%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 40%, 90%)", fontSize: 12 }} />
              <Area type="monotone" dataKey="expected" stroke="hsl(236, 60%, 39%)" fill="hsl(236, 60%, 39%)" fillOpacity={0.08} strokeWidth={2} />
              <Area type="monotone" dataKey="collected" stroke="hsl(142, 72%, 40%)" fill="hsl(142, 72%, 40%)" fillOpacity={0.08} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Expected</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" />Collected</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-card-foreground">Service Breakdown</h3>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={taskData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" strokeWidth={0}>
                  {taskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-4 space-y-3">
              {taskData.map((t) => (
                <div key={t.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="font-bold text-card-foreground ml-1">{t.value}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-border text-sm font-bold text-card-foreground">33 Total Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-card-foreground">Service Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={serviceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 40%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 40%, 90%)", fontSize: 12 }} />
              <Bar dataKey="scheduled" fill="hsl(236, 60%, 39%)" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="completed" fill="hsl(214, 100%, 95%)" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary" />Completed</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-card-foreground">Stock Levels</h3>
            <div className="relative" ref={stockBranchDropdownRef}>
              <button
                onClick={() => setShowStockBranchDropdown(!showStockBranchDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-card-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
              >
                <Filter className="w-3 h-3" />
                {stockBranchFilter}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showStockBranchDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                  {["All", ...Array.from(new Set(inventory.map(i => i.branch)))].map((branch) => (
                    <button
                      key={branch}
                      onClick={() => { setStockBranchFilter(branch); setShowStockBranchDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg ${stockBranchFilter === branch ? 'text-primary font-medium bg-primary/5' : 'text-card-foreground'}`}
                    >
                      {branch}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={(stockBranchFilter === "All" ? inventory : inventory.filter(i => i.branch === stockBranchFilter)).map(i => ({ name: i.name, stock: i.stock, reorder: i.reorder }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 40%, 90%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} stroke="hsl(220, 10%, 50%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 40%, 90%)", fontSize: 12 }} />
              <Bar dataKey="stock" fill="hsl(236, 60%, 39%)" radius={[0, 4, 4, 0]} barSize={14} />
              <Bar dataKey="reorder" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} barSize={14} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Current Stock</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning/30" />Reorder Level</span>
          </div>
        </div>
      </div>

      {/* Add New Lead Modal */}
      {showAddLeadModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
          <div className="bg-card rounded-[20px] shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-5 sticky top-0 bg-card border-b border-border">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-card-foreground">Add New Enquiry</h3>
                <button
                  onClick={() => {
                    setShowAddLeadModal(false);
                    resetLeadForm();
                  }}
                  className="p-1 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Name</label>
                <input
                  type="text"
                  placeholder="Customer name"
                  value={leadFormData.name}
                  onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={leadFormData.phone}
                  onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                <input
                  type="text"
                  placeholder="Service address"
                  value={leadFormData.address}
                  onChange={(e) => setLeadFormData({ ...leadFormData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Urgency Level</label>
                <select
                  value={leadFormData.urgencyLevel}
                  onChange={(e) => setLeadFormData({ ...leadFormData, urgencyLevel: e.target.value as UrgencyLevel })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                >
                  {urgencyLevels.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Expected Date & Time</label>
                <input
                  type="datetime-local"
                  value={leadFormData.expectedDateTime}
                  onChange={(e) => setLeadFormData({ ...leadFormData, expectedDateTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                />
              </div>

              {/* Services */}
              <div ref={leadServiceDropdownRef}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Services</label>
                
                {/* Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    onFocus={() => setShowLeadServiceDropdown(true)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                  />
                  
                  {/* Service Dropdown - Inside Modal */}
                  {showLeadServiceDropdown && filteredServices.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {filteredServices.map((service) => (
                        <button
                          key={service}
                          onClick={() => {
                            setLeadFormData({ ...leadFormData, services: [...leadFormData.services, service] });
                            setServiceSearch("");
                            setShowLeadServiceDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-secondary transition-colors border-b border-border last:border-0"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Services Tags */}
                <div className="bg-secondary/30 rounded-lg p-3 border border-border min-h-[44px] flex flex-wrap gap-2 items-center">
                  {leadFormData.services.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No services selected</span>
                  ) : (
                    leadFormData.services.map((service) => (
                      <div key={service} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                        <span className="text-xs font-medium">{service}</span>
                        <button
                          onClick={() => setLeadFormData({ ...leadFormData, services: leadFormData.services.filter(s => s !== service) })}
                          className="hover:text-primary/70 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowLeadMoreFields((v) => !v)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors text-sm font-semibold text-card-foreground"
              >
                {showLeadMoreFields ? "Hide additional lead fields" : "Show additional lead fields"}
              </button>

              {showLeadMoreFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount</label>
                    <input
                      type="number"
                      value={leadFormData.amount}
                      onChange={(e) => setLeadFormData({ ...leadFormData, amount: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                      placeholder="Expected amount"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Enquiry Source</label>
                    <select
                      value={leadFormData.leadSource}
                      onChange={(e) => setLeadFormData({ ...leadFormData, leadSource: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                    >
                      <option value="">Select enquiry source</option>
                      {leadSources.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch</label>
                    <select
                      value={leadFormData.branch}
                      onChange={(e) => setLeadFormData({ ...leadFormData, branch: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                    >
                      <option value="">Select branch</option>
                      {branches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Sales Exicutive</label>
                    <input
                      value={leadFormData.salesExecutive}
                      onChange={(e) => setLeadFormData({ ...leadFormData, salesExecutive: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                      placeholder="Name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                    <textarea
                      placeholder="Additional notes..."
                      value={leadFormData.notes}
                      onChange={(e) => setLeadFormData({ ...leadFormData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowAddLeadModal(false);
                    resetLeadForm();
                  }}
                  className="flex-1 h-10 border border-border text-card-foreground rounded-lg hover:text-primary transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!canSaveLead) return;
                    addLead({
                      name: leadFormData.name,
                      phone: leadFormData.phone,
                      address: leadFormData.address,
                      services: leadFormData.services,
                      amount: leadFormData.amount.trim() ? Number(leadFormData.amount) : null,
                      expectedDateTime: leadFormData.expectedDateTime,
                      leadSource: leadFormData.leadSource,
                      urgencyLevel: leadFormData.urgencyLevel,
                      branch: leadFormData.branch,
                      salesExecutive: leadFormData.salesExecutive,
                      notes: leadFormData.notes,
                      status: "New",
                      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                      quoteIsViewed: false,
                      quoteViewedAt: null,
                    });
                    toast.success("Lead created successfully!");
                    setShowAddLeadModal(false);
                    resetLeadForm();
                    navigate("/leads");
                  }}
                  className={`flex-1 h-10 text-white rounded-lg transition-all font-semibold text-sm shadow-[0px_5px_12px_rgba(39,47,158,0.2)] ${canSaveLead ? "hover:opacity-90" : "opacity-60 cursor-not-allowed"}`}
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  Save & Go to Enquiries
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Work Order Reports */}
      <WorkOrderReports workOrders={filteredWorkOrders} />

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl card-shadow">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground">Recent Transactions</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Service ID", "Customer", "Technician", "Payment Mode", "Amount", "Status"].map((h) => (
                <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentServices.map((s, i) => {
              const wo = workOrders.find((w) => w.customer.toLowerCase().includes(s.customer.split(" ")[0].toLowerCase()));
              return (
                <tr
                  key={i}
                  onClick={() => navigate("/payments", { state: { workOrderId: wo?.id } })}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-3 font-semibold text-primary text-xs">{s.id}</td>
                  <td className="px-3 py-3 text-card-foreground text-xs">{s.customer}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{s.tech}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{s.mode}</td>
                  <td className="px-3 py-3 font-semibold text-card-foreground text-xs">{s.amount}</td>
                  <td className="px-3 py-3"><StatusBadge label={s.status} variant={s.badge} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leads Table */}
      <DashboardLeadsSection />
    </div>  );
};

export default Dashboard;