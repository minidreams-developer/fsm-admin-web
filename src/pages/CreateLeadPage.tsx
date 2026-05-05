import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLeadsStore, type UrgencyLevel } from "@/store/leadsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useProductsStore } from "@/store/productsStore";

const urgencyLevels: UrgencyLevel[] = ["Low", "Medium", "High"];
          
const leadSources = ["Website", "Call", "Referral", "Walk-in", "Google", "Facebook/Instagram", "Custom"];
const branches = ["Kochi", "Calicut", "Thrissur", "Trivandrum", "Palakkad", "Munnar", "Other"];

type AddressEntry = {
  id: string;
  address: string;
  city: string;
  pincode: string;
};

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const { addLead } = useLeadsStore();
  const { employees } = useEmployeesStore();
  const { products } = useProductsStore();

  const serviceOptions = products.filter((p) => p.category === "Services" && p.status === "Active").map((p) => p.name);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    services: [] as string[],
    amount: "",
    leadSource: "",
    urgencyLevel: "Medium" as UrgencyLevel,
    branch: "",
    salesExecutive: "",
    assignedOwner: "",
    leadIncharge: "",
    nextFollowUpDate: "",
    notes: "",
  });

  const [addresses, setAddresses] = useState<AddressEntry[]>([
    { id: crypto.randomUUID(), address: "", city: "", pincode: "" }
  ]);

  const [customLeadSource, setCustomLeadSource] = useState("");

  const setField = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addAddress = () => {
    setAddresses([...addresses, { id: crypto.randomUUID(), address: "", city: "", pincode: "" }]);
  };

  const removeAddress = (id: string) => {
    if (addresses.length === 1) {
      toast.error("At least one address is required");
      return;
    }
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const updateAddress = (id: string, field: keyof AddressEntry, value: string) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const toggleService = (s: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(s)
        ? prev.services.filter((x) => x !== s)
        : [...prev.services, s],
    }));
  };

  const removeService = (s: string) =>
    setForm((prev) => ({ ...prev, services: prev.services.filter((x) => x !== s) }));

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim() || form.services.length === 0) {
      toast.error("Please fill in all required fields and add at least one service");
      return;
    }

    // Validate at least one address has content
    const hasValidAddress = addresses.some(addr => addr.address.trim());
    if (!hasValidAddress) {
      toast.error("Please add at least one address");
      return;
    }

    // Validate custom source if "Custom" is selected
    if (form.leadSource === "Custom" && !customLeadSource.trim()) {
      toast.error("Please enter a custom source");
      return;
    }

    // Filter out empty addresses
    const validAddresses = addresses.filter(addr => addr.address.trim());

    // Use custom source value if "Custom" is selected
    const finalLeadSource = form.leadSource === "Custom" ? customLeadSource.trim() : form.leadSource;

    addLead({
      name: form.name,
      phone: form.phone,
      address: validAddresses[0].address, // Keep first address as primary for backward compatibility
      addresses: validAddresses,
      services: form.services,
      amount: form.amount.trim() ? Number(form.amount) : null,
      leadSource: finalLeadSource,
      urgencyLevel: form.urgencyLevel,
      branch: form.branch,
      salesExecutive: form.salesExecutive,
      assignedOwner: form.assignedOwner,
      leadIncharge: form.leadIncharge,
      nextFollowUpDate: form.nextFollowUpDate,
      notes: form.notes,
      status: "New",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      quoteIsViewed: false,
      quoteViewedAt: null,
    });
    toast.success("Enquiry created successfully!");
    navigate("/leads");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate("/leads")} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Add New Enquiry</h2>
          <p className="text-sm text-muted-foreground">Fill in the details to create a new enquiry</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
            <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Arun Sharma" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone *</label>
            <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="e.g. 9876543210" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          {/* Multiple Addresses Section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-muted-foreground"></label>
              <button
                type="button"
                onClick={addAddress}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </button>
            </div>
            <div className="space-y-4">
              {addresses.map((addr, index) => (
                <div key={addr.id} className="relative bg-secondary/30 rounded-lg p-4 border border-border">
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAddress(addr.id)}
                      className="absolute top-3 right-3 p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      title="Remove address"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-3">
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Address {index + 1} *
                      </label>
                      <input
                        value={addr.address}
                        onChange={(e) => updateAddress(addr.id, "address", e.target.value)}
                        placeholder="e.g. 12 MG Road, Kochi"
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                      <input
                        value={addr.city}
                        onChange={(e) => updateAddress(addr.id, "city", e.target.value)}
                        placeholder="e.g. Kochi"
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pincode</label>
                      <input
                        value={addr.pincode}
                        onChange={(e) => updateAddress(addr.id, "pincode", e.target.value)}
                        placeholder="e.g. 682001"
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Urgency Level</label>
            <select value={form.urgencyLevel} onChange={(e) => setField("urgencyLevel", e.target.value as UrgencyLevel)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
              {urgencyLevels.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Amount</label>
            <input type="number" value={form.amount} onChange={(e) => setField("amount", e.target.value)} placeholder="e.g. 5000" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Enquiry Source</label>
            <select 
              value={form.leadSource} 
              onChange={(e) => {
                setField("leadSource", e.target.value);
                if (e.target.value !== "Custom") {
                  setCustomLeadSource("");
                }
              }} 
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select source</option>
              {leadSources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Custom Source Input - Shows when "Custom" is selected */}
          {form.leadSource === "Custom" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Custom Source</label>
              <input 
                value={customLeadSource} 
                onChange={(e) => setCustomLeadSource(e.target.value)} 
                placeholder="Enter custom source" 
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Branch</label>
            <select value={form.branch} onChange={(e) => setField("branch", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Select branch</option>
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Enquiry Incharge</label>
            <select value={form.leadIncharge} onChange={(e) => setField("leadIncharge", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Unassigned</option>
              {employees.map((emp) => <option key={emp.id} value={emp.name}>{emp.name} — {emp.role}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Next Follow Up Date</label>
            <input type="date" value={form.nextFollowUpDate} onChange={(e) => setField("nextFollowUpDate", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Next Follow Up Time</label>
            <input type="time" value={(form as any).nextFollowUpTime || ""} onChange={(e) => setForm(prev => ({ ...prev, nextFollowUpTime: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Services * (select from list)</label>
            <select
              onChange={(e) => { if (e.target.value) toggleService(e.target.value); e.target.value = ""; }}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
              defaultValue=""
            >
              <option value="" disabled>Select a service...</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s} disabled={form.services.includes(s)}>{s}{form.services.includes(s) ? " ✓" : ""}</option>
              ))}
            </select>
            {form.services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.services.map((s) => (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="text-xs font-medium text-primary">{s}</span>
                    <button onClick={() => removeService(s)} className="text-primary hover:text-primary/70"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={3} placeholder="Additional notes..." className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
          <button onClick={() => navigate("/leads")} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
          <button onClick={handleSave} className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Save Enquiry</button>
        </div>
      </div>
    </div>
  );
};

export default CreateLeadPage;
