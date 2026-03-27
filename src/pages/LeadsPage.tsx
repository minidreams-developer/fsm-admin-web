import { useState } from "react";
import { createPortal } from "react-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Eye, EyeOff, X, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLeadsStore, type LeadStatus, type Lead, type UrgencyLevel } from "@/store/leadsStore";
import { LeadDetailsModal } from "@/components/LeadDetailsModal";
import { ConvertLeadModal } from "@/components/ConvertLeadModal";

const statusBadge: Record<LeadStatus, "info" | "warning" | "success" | "error" | "neutral"> = {
  New: "info", Contacted: "warning", "Quote Sent": "warning", Converted: "success", Lost: "error",
};

const statuses: LeadStatus[] = ["New", "Contacted", "Quote Sent", "Converted", "Lost"];

const urgencyLevels: UrgencyLevel[] = ["Low", "Medium", "High"];
const leadSources = ["Website", "Call", "Referral", "Walk-in", "Google", "Facebook/Instagram", "Other"] as const;
const branches = ["Kochi", "Calicut", "Thrissur", "Trivandrum", "Palakkad", "Munnar", "Other"] as const;

function formatLeadId(id: number) {
  return `LEAD-${String(id).padStart(4, "0")}`;
}

const LeadsPage = () => {
  const navigate = useNavigate();
  const { leads, updateLead, addLead } = useLeadsStore();
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
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
    return matchStatus && matchSearch;
  }).sort((a, b) => {
    const statusOrder: Record<LeadStatus, number> = {
      "New": 0,
      "Contacted": 1,
      "Quote Sent": 2,
      "Converted": 3,
      "Lost": 4,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const closeModal = () => setSelectedLead(null);

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
        status: "Quote Sent",
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

    toast.success("Lead created successfully!");
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">Manage your sales pipeline</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Plus className="w-4 h-4" /> Add New Lead
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 card-shadow space-y-4">
          <h3 className="text-sm font-semibold text-card-foreground">Quick Add Lead</h3>
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
            {showMoreFields ? "Hide additional lead fields" : "Show additional lead fields"}
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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Lead Source</label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadSource: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                >
                  <option value="">Select lead source</option>
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
              Save Lead
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

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter("All")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${filter === "All" ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`} style={filter === "All" ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}>All</button>
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${filter === s ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`} style={filter === s ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="w-full">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Lead ID ( Automated Generated )", "Customer Info", "Services", "Amount", "Expected Date & Time", "Urgency", "Status", "Date", "View Details", "Action", "Convert"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((l) => {
                const serviceCount = getServiceCount(l);
                return (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-2.5 font-semibold text-primary text-xs">{formatLeadId(l.id)}</td>
                  <td className="px-3 py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-card-foreground text-xs">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.phone} • {l.address}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">{serviceCount}</span>
                      <span className="text-xs text-muted-foreground">{serviceCount === 1 ? "Service" : "Services"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{typeof l.amount === "number" ? `₹ ${l.amount.toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.expectedDateTime ? new Date(l.expectedDateTime).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.urgencyLevel}</td>
                  <td className="px-3 py-2.5"><StatusBadge label={l.status} variant={statusBadge[l.status]} /></td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{l.date}</td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => {
                        setSelectedLeadForDetails(l);
                        setShowDetailsModal(true);
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                      title="View lead details"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    {l.status === "New" && (
                      <button
                        onClick={() => {
                          updateLead(l.id, { status: "Contacted" });
                          toast.success("Lead marked as contacted");
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                        title="Mark as contacted"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {l.status === "Contacted" && (
                      <button
                        onClick={() => {
                          setSelectedLeadForQuote(l);
                          setShowQuoteForm(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-warning border border-warning/20 rounded-lg hover:bg-warning/5 transition-all"
                        title="Send quote to customer"
                      >
                        Send Quote
                      </button>
                    )}
                    {l.status === "Quote Sent" && (
                      l.quoteIsViewed ? (
                        <button
                          onClick={() => {
                            setLeadToConvert(l);
                            setShowConvertModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                          title="Convert to project"
                        >
                          Convert to Project
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            toast.info("Reminder sent to customer");
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-warning border border-warning/20 rounded-lg hover:bg-warning/5 transition-all"
                          title="Send reminder to customer"
                        >
                          Send Reminder
                        </button>
                      )
                    )}
                    {l.status === "Converted" && (
                      <button
                        onClick={() => setSelectedLead(l)}
                        className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-all"
                        title="View lead details"
                      >
                        View Details
                      </button>
                    )}
                    {l.status === "Lost" && (
                      <span className="text-xs font-medium text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {l.status !== "Converted" && l.status !== "Lost" ? (
                      <button
                        onClick={() => {
                          navigate("/create-work-order", { state: { leadData: l } });
                        }}
                        className="px-1.5 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(148,43,244,0.3)]"
                        style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                      >
                        Convert to Project
                      </button>
                    ) : l.status === "Converted" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-success bg-success/10 rounded-lg border border-success/20">
                        <span>✓</span>
                        <span>Converted</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

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
                <h4 className="text-sm font-semibold text-card-foreground mb-4">Lead Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Lead ID ( Automated Generated )</p>
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
                      <p className="text-xs text-muted-foreground mb-1">Lead Source</p>
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
              {selectedLead.status === "Quote Sent" && (
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
                      Convert to Project
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

      {/* Send Quote Form Modal */}
      {showQuoteForm && selectedLeadForQuote && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
          <div className="bg-card rounded-[20px] shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Send Quote</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedLeadForQuote.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowQuoteForm(false);
                  setSelectedLeadForQuote(null);
                  setQuoteFormData({ amount: "", contract: "", notes: "" });
                }}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Services Summary */}
              <div className="rounded-lg p-4 border border-border bg-secondary/30">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Services to Quote</p>
                <div className="space-y-2">
                  {selectedLeadForQuote.services.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-card rounded-lg border border-border/50">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote Amount */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Quote Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="Enter quote amount"
                  value={quoteFormData.amount}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                />
              </div>

              {/* Contract Duration */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Contract Duration</label>
                <select
                  value={quoteFormData.contract}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, contract: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                >
                  <option value="">Select contract duration</option>
                  <option value="One-Time">One-Time</option>
                  <option value="3 Months">3 Months</option>
                  <option value="4 Months">4 Months</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>

              {/* Quote Notes */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Quote Details</label>
                <textarea
                  placeholder="Add quote details, terms, or special notes..."
                  value={quoteFormData.notes}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowQuoteForm(false);
                    setSelectedLeadForQuote(null);
                    setQuoteFormData({ amount: "", contract: "", notes: "" });
                  }}
                  className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuote}
                  disabled={!quoteFormData.amount}
                  className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  Send Quote
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lead Details Modal */}
      <LeadDetailsModal
        open={showDetailsModal}
        lead={selectedLeadForDetails || undefined}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLeadForDetails(null);
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
    </div>
  );
};

export default LeadsPage;
