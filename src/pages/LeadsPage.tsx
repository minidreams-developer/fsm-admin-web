import { useState } from "react";
import { createPortal } from "react-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Eye, EyeOff, X, Clock, CheckCircle2, Edit2, Users, TrendingUp, CheckCircle, XCircle, Bell, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLeadsStore, type LeadStatus, type Lead, type UrgencyLevel } from "@/store/leadsStore";
import { LeadDetailsModal } from "@/components/LeadDetailsModal";
import { ConvertLeadModal } from "@/components/ConvertLeadModal";
import { useBranchesStore } from "@/store/branchesStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { TimeInput12Hour } from "@/components/TimeInput12Hour";

const statusBadge: Record<LeadStatus, "info" | "warning" | "success" | "error" | "neutral"> = {
  New: "info", Contacted: "warning", "Follow Up": "info", Converted: "success", Lost: "error",
};

const statuses: LeadStatus[] = ["New", "Contacted", "Follow Up", "Converted", "Lost"];

const urgencyLevels: UrgencyLevel[] = ["Low", "Medium", "High"];
const leadSources = ["Website", "Call", "Referral", "Walk-in", "Google", "Facebook/Instagram", "Other"] as const;
const branches = ["Kochi", "Calicut", "Thrissur", "Trivandrum", "Palakkad", "Munnar", "Other"] as const;

function formatLeadId(id: number) {
  return `LEAD-${String(id).padStart(4, "0")}`;
}

const LeadsPage = () => {
  const navigate = useNavigate();
  const { leads, updateLead, addLead } = useLeadsStore();
  const { branches: branchList } = useBranchesStore();
  const { employees } = useEmployeesStore();
  const salesExecutives = employees.filter(e => e.role === "Sales Executive" && e.isActive !== false);
  const activeEmployees = employees.filter(e => e.isActive !== false);
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<Lead | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({ amount: "", contract: "", notes: "" });
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [reminderLeadId, setReminderLeadId] = useState<number | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderText, setReminderText] = useState("");

  // Bulk transfer state
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
  const [showBulkTransfer, setShowBulkTransfer] = useState(false);
  const [transferTo, setTransferTo] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form state for new lead
  const [formData, setFormData] = useState({
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
  const [newService, setNewService] = useState("");

  const filtered = leads.filter((l) => {
    const matchStatus = filter === "All" || l.status === filter;
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
    const matchBranch = branchFilter === "All" || l.branch === branchFilter;
    const matchEmployee = employeeFilter === "All" || l.assignedOwner === employeeFilter;
    
    // Date filter logic
    let matchDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const leadDate = new Date(l.date);
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        matchDate = matchDate && leadDate >= startDate;
      }
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Include entire end date
        matchDate = matchDate && leadDate <= endDate;
      }
    }
    
    return matchStatus && matchSearch && matchBranch && matchEmployee && matchDate;
  }).sort((a, b) => {
    const statusOrder: Record<LeadStatus, number> = {
      "New": 0,
      "Contacted": 1,
      "Follow Up": 2,
      "Converted": 3,
      "Lost": 4,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const closeModal = () => setSelectedLead(null);

  const saveReminder = (leadId: number) => {
    if (!reminderDate || !reminderText.trim()) {
      toast.error("Please select a date and enter reminder text");
      return;
    }
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const newReminder = { id: `REM-${Date.now()}`, date: reminderDate, time: reminderTime, text: reminderText.trim(), createdAt: new Date().toISOString() };
    updateLead(leadId, { reminders: [...(lead.reminders ?? []), newReminder] });
    setReminderDate("");
    setReminderTime("");
    setReminderText("");
    setReminderLeadId(null);
    toast.success("Reminder saved");
  };

  const getServiceCount = (lead: Lead) => lead.services.length;

  const formatViewedAt = (value: string | null) => {
    if (!value) return "—";
    const ts = Date.parse(value);
    if (Number.isNaN(ts)) return value;
    return new Date(ts).toLocaleString();
  };

  const setQuoteViewed = (leadId: number, nextViewed: boolean) => {
    const nextViewedAt = nextViewed ? new Date().toISOString() : null;
    updateLead(leadId, { quoteIsViewed: nextViewed, quoteViewedAt: nextViewedAt });
    setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, quoteIsViewed: nextViewed, quoteViewedAt: nextViewedAt } : prev));
    toast.success(nextViewed ? "Marked as viewed" : "Marked as not viewed");
  };

  const handleSendQuote = () => {
    if (selectedLeadForQuote && quoteFormData.amount && quoteFormData.contract) {
      updateLead(selectedLeadForQuote.id, {
        status: "Follow Up",
        quoteAmount: parseInt(quoteFormData.amount),
        quoteContract: quoteFormData.contract,
        quoteNotes: quoteFormData.notes,
        quoteIsViewed: false,
        quoteViewedAt: null,
      });
      toast.success("Quote sent successfully!");
      setShowQuoteForm(false);
      setSelectedLeadForQuote(null);
      setQuoteFormData({ amount: "", contract: "", notes: "" });
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService]
      }));
      setNewService("");
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSaveLead = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || formData.services.length === 0) {
      toast.error("Please fill in all required fields and add at least one service");
      return;
    }

    addLead({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      services: formData.services,
      amount: formData.amount.trim() ? Number(formData.amount) : null,
      expectedDateTime: formData.expectedDateTime,
      leadSource: formData.leadSource,
      urgencyLevel: formData.urgencyLevel,
      branch: formData.branch,
      salesExecutive: formData.salesExecutive,
      notes: formData.notes,
      status: "New",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      quoteIsViewed: false,
      quoteViewedAt: null
    });

    toast.success("Leads created successfully!");
    setFormData({
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
    setShowMoreFields(false);
    setShowForm(false);
  };

  const handleBulkTransfer = () => {
    if (!transferTo.trim()) {
      toast.error("Please select a sales executive to transfer to");
      return;
    }
    selectedLeadIds.forEach(id => updateLead(id, { assignedOwner: transferTo }));
    toast.success(`${selectedLeadIds.size} enquir${selectedLeadIds.size === 1 ? "y" : "ies"} transferred to ${transferTo}`);
    setSelectedLeadIds(new Set());
    setShowBulkTransfer(false);
    setTransferTo("");
  };

  const toggleSelectLead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === filtered.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filtered.map(l => l.id)));
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filtered.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (newFilter: LeadStatus | "All") => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">Manage your sales pipeline</p>
        </div>

        
        <button onClick={() => navigate("/leads/new")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Plus className="w-4 h-4" /> Add New Leads
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Leads</p>
              <p className="text-2xl font-bold text-card-foreground">{leads.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">New</p>
              <p className="text-2xl font-bold text-card-foreground">{leads.filter(l => l.status === "New").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Converted</p>
              <p className="text-2xl font-bold text-card-foreground">{leads.filter(l => l.status === "Converted").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-lg flex-shrink-0">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Lost</p>
              <p className="text-2xl font-bold text-card-foreground">{leads.filter(l => l.status === "Lost").length}</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 card-shadow space-y-4">
          <h3 className="text-sm font-semibold text-card-foreground">Quick Add Leads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Info</label>
              <input 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="Customer name" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
              <input 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="Phone number" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
              <input 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="Service address" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Urgency Level ( Low, High, Medium )</label>
              <select
                value={formData.urgencyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, urgencyLevel: e.target.value as UrgencyLevel }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              >
                {urgencyLevels.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Expected Date & Time</label>
              <input
                type="datetime-local"
                value={formData.expectedDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDateTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Services (add multiple)</label>
            <div className="flex gap-2 mb-2">
              <input 
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="Enter service name" 
              />
              <button 
                onClick={handleAddService}
                className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                  <span className="text-xs font-medium text-primary">{service}</span>
                  <button 
                    onClick={() => handleRemoveService(index)}
                    className="text-primary hover:text-primary/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowMoreFields((v) => !v)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors text-sm font-semibold text-card-foreground"
          >
            {showMoreFields ? "Hide additional fields" : "Show additional Leads fields"}
          </button>

          {showMoreFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                  placeholder="Expected amount"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Leads Source</label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadSource: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                >
                  <option value="">Select Leads source</option>
                  {leadSources.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sales Executive</label>
                <input
                  value={formData.salesExecutive}
                  onChange={(e) => setFormData(prev => ({ ...prev, salesExecutive: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                  placeholder="Name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border" 
                  rows={2} 
                  placeholder="Additional notes..." 
                />
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button 
              onClick={handleSaveLead}
              className="h-10 px-6 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg" 
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              Save Leads
            </button>
            <button 
              onClick={() => {
                setShowForm(false);
                setFormData({ name: "", phone: "", address: "", services: [], amount: "", expectedDateTime: "", leadSource: "", urgencyLevel: "Medium", branch: "", salesExecutive: "", notes: "" });
                setNewService("");
                setShowMoreFields(false);
              }}
              className="h-10 px-6 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="space-y-3">
        {/* First Row: Dropdowns and Date Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            placeholder="Start Date"
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            placeholder="End Date"
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {(dateFilter.startDate || dateFilter.endDate) && (
            <button
              onClick={() => setDateFilter({ startDate: "", endDate: "" })}
              className="px-3 py-2 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              Clear Dates
            </button>
          )}

          <div className="relative w-full sm:flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Leads..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {/* Second Row: Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleFilterChange("All")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${filter === "All" ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`} style={filter === "All" ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}>All</button>
          {statuses.map((s) => (
            <button key={s} onClick={() => handleFilterChange(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${filter === s ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`} style={filter === s ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        {/* Bulk transfer bar */}
        {selectedLeadIds.size > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/5 border-b border-primary/20">
            <span className="text-sm font-semibold text-primary">{selectedLeadIds.size} enquir{selectedLeadIds.size === 1 ? "y" : "ies"} selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkTransfer(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                <ArrowRightLeft className="w-4 h-4" />
                Bulk Transfer
              </button>
              <button
                onClick={() => setSelectedLeadIds(new Set())}
                className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        <div className="w-full">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="px-3 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedLeadIds.size === filtered.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
              </th>
              {["Leads ID", "Customer Name", "Services", "Urgency", "sales executive", "Next Follow-Up-date", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {paginatedLeads.map((l) => {
                const serviceCount = getServiceCount(l);
                return (
                  <tr key={l.id} onClick={() => navigate(`/leads/${l.id}`)} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <td className="px-3 py-2.5" onClick={e => toggleSelectLead(l.id, e)}>
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.has(l.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-primary text-xs">{formatLeadId(l.id)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-card-foreground text-xs">{l.name}</span>
                      <div
                        className="inline-flex items-center justify-center w-5 h-5 rounded flex-shrink-0"
                        title={l.isViewed ? "Viewed" : "Not viewed"}
                      >
                        <Eye className={`w-3.5 h-3.5 ${l.isViewed ? "text-success" : "text-muted-foreground"}`} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">{serviceCount}</span>
                      <span className="text-xs text-muted-foreground">{serviceCount === 1 ? "Service" : "Services"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.urgencyLevel}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.assignedOwner || "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.nextFollowUpDate || "—"}</td>
                  <td className="px-3 py-2.5"><StatusBadge label={l.status} variant={statusBadge[l.status]} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingLead(l); setShowDetailsModal(true); }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                        title="Edit Leads"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <div className="relative">
                        {/* <button
                          onClick={(e) => { e.stopPropagation(); setReminderLeadId(reminderLeadId === l.id ? null : l.id); setReminderDate(""); setReminderTime(""); setReminderText(""); }}
                          className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                          title=""
                        >
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          {(l.reminders?.length ?? 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">{l.reminders?.length}</span>
                          )}
                        </button> */}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={10}>10</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-card-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                    : "border border-border text-card-foreground hover:bg-secondary"
                }`}
                style={currentPage === page ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-card-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        <div className="text-sm text-muted-foreground text-center sm:text-right">
          Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} entries
        </div>
      </div>

      {/* Reminder Modal */}
      {reminderLeadId !== null && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-card-foreground"></h3>
                <button
                  onClick={() => setReminderLeadId(null)}
                  className="p-1 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Date *</label>
                <input 
                  type="date" 
                  value={reminderDate} 
                  onChange={(e) => setReminderDate(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Time (Optional)</label>
                <TimeInput12Hour 
                  value={reminderTime} 
                  onChange={(e) => setReminderTime(e)} 
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Reminder Text *</label>
                <textarea 
                  value={reminderText} 
                  onChange={(e) => setReminderText(e.target.value)} 
                  placeholder="Enter reminder details..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button 
                onClick={() => setReminderLeadId(null)} 
                className="flex-1 h-10 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveReminder(reminderLeadId)} 
                className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white rounded-lg transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" 
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Quote View Details Dropdown */}
      {selectedLead && (
        <div className="bg-card rounded-xl border border-border shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">{selectedLead.name}</h3>
                  <p className="text-sm text-muted-foreground">Quote View Status</p>
                </div>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-secondary rounded-lg transition-colors ml-4 flex-shrink-0"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="p-6 space-y-4">

              {/* Lead Information Card */}
              <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                <h4 className="text-sm font-semibold text-card-foreground mb-4">Leads Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Leads ID ( Automated Generated )</p>
                    <p className="text-sm font-semibold text-primary">{formatLeadId(selectedLead.id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Company / Name</p>
                    <p className="text-sm font-semibold text-card-foreground">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contact Address</p>
                    <p className="text-sm font-semibold text-card-foreground">{selectedLead.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-card-foreground">{selectedLead.phone}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Urgency Level ( Low, High, Medium )</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedLead.urgencyLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Expected Date & Time</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedLead.expectedDateTime ? new Date(selectedLead.expectedDateTime).toLocaleString() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Leads Source</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedLead.leadSource || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Branch</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedLead.branch || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sales Executive</p>
                      <p className="text-sm font-semibold text-card-foreground">{selectedLead.salesExecutive || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount</p>
                      <p className="text-sm font-semibold text-primary">{typeof selectedLead.amount === "number" ? `₹ ${selectedLead.amount.toLocaleString()}` : "—"}</p>
                    </div>
                  </div>
                  {selectedLead.notes && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm font-semibold text-card-foreground whitespace-pre-wrap">{selectedLead.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Overview Card */}
              <div>
                <h4 className="text-sm font-semibold text-card-foreground mb-4 uppercase tracking-wider text-xs">Services</h4>
                <div className="space-y-2">
                  {selectedLead.services.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote Details Card */}
              <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                <h4 className="text-sm font-semibold text-card-foreground mb-4">Quote Details</h4>
                <div className="bg-card rounded-lg p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">Quote Amount</span>
                    <span className="text-sm font-semibold text-primary">₹{selectedLead.quoteAmount?.toLocaleString() || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">Contract Duration</span>
                    <span className="text-sm font-semibold text-card-foreground">{selectedLead.quoteContract || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">Quote Sent Date</span>
                    <span className="text-sm font-semibold text-primary">{selectedLead.date}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm font-medium text-card-foreground">Current Status</span>
                    <div className="flex items-center gap-2">
                      {selectedLead.status === "Lost" ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <X className="w-4 h-4 text-destructive" />
                          <span className="text-xs font-semibold text-destructive">Rejected</span>
                        </div>
                      ) : selectedLead.quoteIsViewed ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="text-xs font-semibold text-success">Viewed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg">
                          <Clock className="w-4 h-4 text-warning" />
                          <span className="text-xs font-semibold text-warning">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedLead.quoteIsViewed && selectedLead.quoteViewedAt && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Viewed On</p>
                      <p className="text-sm font-semibold text-success">{formatViewedAt(selectedLead.quoteViewedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedLead.status === "Follow Up" && (
                <div className="flex flex-col sm:flex-row gap-3 p-6">
                  {selectedLead.quoteIsViewed ? (
                    <button
                      onClick={() => {
                        closeModal();
                        navigate(`/projects?convertLeadId=${selectedLead.id}`);
                      }}
                      className="flex-1 h-10 text-white rounded-lg hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all font-semibold text-sm"
                      style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                    >
                      Convert to Work Order
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setQuoteViewed(selectedLead.id, true)}
                        className="flex-1 h-10 text-white rounded-lg hover:opacity-90 shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all font-semibold text-sm"
                        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                      >
                        Mark as Viewed
                      </button>
                      <button
                        onClick={() => {
                          toast.info("Reminder sent to customer");
                        }}
                        className="flex-1 h-10 text-warning border border-warning/20 rounded-lg hover:bg-warning/5 transition-all font-semibold text-sm"
                      >
                        Send Reminder
                      </button>
                    </>
                  )}
                </div>
              )}
              {selectedLead.status === "Converted" && (
                <div className="flex flex-col sm:flex-row gap-3 p-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 h-10 border border-border text-card-foreground rounded-lg hover:text-primary transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      
      {/* Lead Details Modal */}
      <LeadDetailsModal
        open={showDetailsModal}
        lead={editingLead ?? selectedLeadForDetails ?? undefined}
        initialEdit={!!editingLead}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLeadForDetails(null);
          setEditingLead(null);
        }}
      />

      {/* Convert Lead Modal */}
      <ConvertLeadModal
        lead={leadToConvert}
        isOpen={showConvertModal}
        onClose={() => {
          setShowConvertModal(false);
          setLeadToConvert(null);
        }}
        onSuccess={() => {
          setShowDetailsModal(false);
          setSelectedLeadForDetails(null);
        }}
      />

      {/* Bulk Transfer Modal */}
      {showBulkTransfer && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-card-foreground">Bulk Leads Transfer</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedLeadIds.size} enquir{selectedLeadIds.size === 1 ? "y" : "ies"} selected</p>
                </div>
              </div>
              <button onClick={() => setShowBulkTransfer(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-secondary/30 rounded-lg border border-border p-3 max-h-36 overflow-y-auto space-y-1">
                {filtered.filter(l => selectedLeadIds.has(l.id)).map(l => (
                  <div key={l.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-card-foreground">{l.name}</span>
                    <span className="text-muted-foreground">{formatLeadId(l.id)}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Transfer to Sales Executive *</label>
                <select
                  value={transferTo}
                  onChange={e => setTransferTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select sales executive...</option>
                  {salesExecutives.length > 0
                    ? salesExecutives.map(e => (
                        <option key={e.id} value={e.name}>{e.name} — {e.role}</option>
                      ))
                    : employees.map(e => (
                        <option key={e.id} value={e.name}>{e.name} — {e.role}</option>
                      ))
                  }
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={() => { setShowBulkTransfer(false); setTransferTo(""); }}
                className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkTransfer}
                className="flex-1 h-10 text-white text-sm font-semibold hover:opacity-90 transition-all rounded-lg shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                Transfer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeadsPage;
