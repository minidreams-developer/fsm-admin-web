import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, X, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Select from "react-select";
import { useLeadsStore, type UrgencyLevel } from "@/store/leadsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useProductsStore } from "@/store/productsStore";
import { useCustomersStore } from "@/store/customersStore";
import { useServicesStore } from "@/store/servicesStore";

const urgencyLevels: UrgencyLevel[] = ["Low", "Medium", "High"];
          
const leadSources = ["Website", "Call", "Referral", "Walk-in", "Google", "Facebook/Instagram", "Custom"];
const branches = ["Kochi", "Calicut", "Thrissur", "Trivandrum", "Palakkad", "Munnar", "Other"];

type AddressEntry = {
  id: string;
  address: string;
  city: string;
  pincode: string;
};

type AddressOption = {
  label: string;
  address: string;
  city: string;
  pincode: string;
};

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillCustomer = (location.state as any)?.prefillCustomer;
  const { addLead } = useLeadsStore();
  const { employees } = useEmployeesStore();
  const { products } = useProductsStore();
  const { customers } = useCustomersStore();
  const { appointments } = useServicesStore();

  // All services: from products + from service appointments
  const productServices = products.filter((p) => p.category === "Services" && p.status === "Active");
  const appointmentServices = appointments.filter(a => a.subject).map(a => ({
    name: a.subject || "",
    description: a.serviceDescription || "",
    unitPrice: a.unitPrice ? parseFloat(a.unitPrice.replace(/[₹,\s]/g, "")) || 0 : (a.payment?.amount || 0),
  }));
  const allServiceOptions = [
    ...productServices.map(p => ({ name: p.name, description: p.description || "", unitPrice: p.unitPrice })),
    ...appointmentServices,
  ];
  const uniqueServiceOptions = Array.from(new Map(allServiceOptions.map(s => [s.name, s])).values());
  const serviceOptions = uniqueServiceOptions.map(s => s.name);

  const [form, setForm] = useState({
    name: prefillCustomer?.name || "",
    phone: prefillCustomer?.phone || "",
    address: prefillCustomer?.address || "",
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

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Customer options for React Select
  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: `${c.firstName} ${c.lastName} — ${c.mobile || c.landline}`,
    customer: c,
  }));

  // Custom styles matching the app theme
  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--secondary))',
      borderColor: state.isFocused ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))',
      borderRadius: '0.5rem',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--primary) / 0.2)' : 'none',
      '&:hover': { borderColor: 'hsl(var(--border))' },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? 'hsl(var(--primary))' : state.isFocused ? 'hsl(var(--secondary))' : 'transparent',
      color: state.isSelected ? 'white' : 'hsl(var(--card-foreground))',
      fontSize: '0.875rem',
      cursor: 'pointer',
    }),
    input: (base: any) => ({ ...base, color: 'hsl(var(--card-foreground))', fontSize: '0.875rem' }),
    placeholder: (base: any) => ({ ...base, color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }),
    singleValue: (base: any) => ({ ...base, color: 'hsl(var(--card-foreground))', fontSize: '0.875rem' }),
    noOptionsMessage: (base: any) => ({ ...base, color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }),
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setField("name", `${customer.firstName} ${customer.lastName}`.trim());
      setField("phone", customer.mobile || customer.landline || "");

      // Build structured address options from customer's saved address fields
      const opts: AddressOption[] = [];

      // Primary site address from structured fields
      if (customer.siteAddressFields) {
        const f = customer.siteAddressFields;
        const street = [f.street1, f.street2].filter(Boolean).join(", ");
        if (street || f.city) {
          opts.push({ label: `Site: ${[street, f.city, f.state, f.pinCode].filter(Boolean).join(", ")}`, address: street, city: f.city, pincode: f.pinCode });
        }
      } else if (customer.siteAddress) {
        opts.push({ label: `Site: ${customer.siteAddress}`, address: customer.siteAddress, city: "", pincode: "" });
      }

      // Additional site addresses
      if (customer.additionalSiteAddressFields) {
        customer.additionalSiteAddressFields.forEach((f, idx) => {
          const street = [f.street1, f.street2].filter(Boolean).join(", ");
          if (street || f.city) {
            opts.push({ label: `Site ${idx + 2}: ${[street, f.city, f.state, f.pinCode].filter(Boolean).join(", ")}`, address: street, city: f.city, pincode: f.pinCode });
          }
        });
      }

      // Billing address
      if (customer.billingAddressFields) {
        const f = customer.billingAddressFields;
        const street = [f.street1, f.street2].filter(Boolean).join(", ");
        if (street || f.city) {
          opts.push({ label: `Billing: ${[street, f.city, f.state, f.pinCode].filter(Boolean).join(", ")}`, address: street, city: f.city, pincode: f.pinCode });
        }
      } else if (customer.billingAddress) {
        opts.push({ label: `Billing: ${customer.billingAddress}`, address: customer.billingAddress, city: "", pincode: "" });
      }

      setCustomerAddressOptions(opts);
      if (opts.length > 0) {
        setAddresses([{ id: crypto.randomUUID(), address: opts[0].address, city: opts[0].city, pincode: opts[0].pincode }]);
      } else {
        setAddresses([{ id: crypto.randomUUID(), address: "", city: "", pincode: "" }]);
      }
    } else {
      setCustomerAddressOptions([]);
    }
  };

  const [addresses, setAddresses] = useState<AddressEntry[]>([
    { id: crypto.randomUUID(), address: prefillCustomer?.address || "", city: "", pincode: "" }
  ]);

  const [customerAddressOptions, setCustomerAddressOptions] = useState<AddressOption[]>(
    prefillCustomer?.address ? [{ label: prefillCustomer.address, address: prefillCustomer.address, city: "", pincode: "" }] : []
  );

  const [customLeadSource, setCustomLeadSource] = useState("");

  // Service items table state
  type ServiceItem = {
    id: string;
    serviceType: string;
    name: string;
    description: string;
    unitPrice: number;
    qty: number;
    amount: number;
  };
  type ServiceSchedule = {
    id: string;
    service: string;
    scheduleDate: string;
    fromTime: string;
    toTime: string;
    requiredEmployees: number;
  };
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>([]);

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
    if (!form.name.trim() || !form.phone.trim() || serviceItems.length === 0) {
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
      services: serviceItems.map(s => s.name),
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
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  options={customerOptions}
                  value={customerOptions.find((opt) => opt.value === selectedCustomerId) || null}
                  onChange={(option) => {
                    if (option) {
                      handleCustomerSelect(option.value);
                    } else {
                      setSelectedCustomerId("");
                      setCustomerAddressOptions([]);
                      setAddresses([{ id: crypto.randomUUID(), address: "", city: "", pincode: "" }]);
                      setField("name", "");
                      setField("phone", "");
                    }
                  }}
                  onInputChange={(inputValue) => {
                    // Allow typing a new name not in the list
                    if (!selectedCustomerId) setField("name", inputValue);
                  }}
                  inputValue={selectedCustomerId ? undefined : form.name}
                  styles={customSelectStyles}
                  placeholder="Search existing customer or type new name..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No customers found — type to enter a new name"}
                />
              </div>
              {selectedCustomerId && (
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${selectedCustomerId}?edit=true`)}
                  className="h-[38px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-xs font-semibold text-card-foreground flex-shrink-0"
                  title="Edit customer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
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
                      {customerAddressOptions.length > 0 ? (
                        <>
                          <select
                            value={customerAddressOptions.findIndex(o => o.address === addr.address && o.city === addr.city && o.pincode === addr.pincode)}
                            onChange={(e) => {
                              const idx = parseInt(e.target.value);
                              if (idx === -1) {
                                // Custom — clear fields for manual entry
                                setAddresses(prev => prev.map(a => a.id === addr.id
                                  ? { ...a, address: "", city: "", pincode: "" }
                                  : a
                                ));
                              } else {
                                const opt = customerAddressOptions[idx];
                                setAddresses(prev => prev.map(a => a.id === addr.id
                                  ? { ...a, address: opt.address, city: opt.city, pincode: opt.pincode }
                                  : a
                                ));
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value={-1}>+ Enter custom address</option>
                            {customerAddressOptions.map((opt, i) => (
                              <option key={i} value={i}>{opt.label}</option>
                            ))}
                          </select>
                          {/* Show manual inputs when custom is selected */}
                          {customerAddressOptions.findIndex(o => o.address === addr.address && o.city === addr.city && o.pincode === addr.pincode) === -1 && (
                            <input
                              value={addr.address}
                              onChange={(e) => updateAddress(addr.id, "address", e.target.value)}
                              placeholder="Enter address"
                              className="w-full mt-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          )}
                        </>
                      ) : (
                        <input
                          value={addr.address}
                          onChange={(e) => updateAddress(addr.id, "address", e.target.value)}
                          placeholder="e.g. 12 MG Road, Kochi"
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      )}
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
            <label className="text-xs font-medium text-muted-foreground mb-2 block">sales executive</label>
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
              onChange={(e) => {
                const name = e.target.value;
                if (!name) return;
                const svc = uniqueServiceOptions.find(s => s.name === name);
                const newItem: ServiceItem = {
                  id: `${Date.now()}-${Math.random().toString(36).substr(2,6)}`,
                  serviceType: name,
                  name,
                  description: svc?.description || "",
                  unitPrice: svc?.unitPrice || 0,
                  qty: 1,
                  amount: svc?.unitPrice || 0,
                };
                setServiceItems(prev => [...prev, newItem]);
                e.target.value = "";
              }}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
              defaultValue=""
            >
              <option value="" disabled>Select a service to add...</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Services Table */}
            {serviceItems.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      {["Service Type", "Service", "Description", "Unit Price", "Qty", "Amount", "Action"].map(h => (
                        <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {serviceItems.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                        <td className="px-3 py-2.5 text-xs text-card-foreground font-medium">{item.serviceType}</td>
                        <td className="px-3 py-2.5">
                          <input
                            value={item.name}
                            onChange={e => setServiceItems(prev => prev.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                            className="w-full px-2 py-1 rounded bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            value={item.description}
                            onChange={e => setServiceItems(prev => prev.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}
                            placeholder="Description"
                            className="w-full px-2 py-1 rounded bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={e => {
                              const unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                              setServiceItems(prev => prev.map(i => i.id === item.id ? { ...i, unitPrice, amount: unitPrice * i.qty } : i));
                            }}
                            className="w-20 px-2 py-1 rounded bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setServiceItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1), amount: i.unitPrice * Math.max(1, i.qty - 1) } : i))} className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-secondary text-xs">−</button>
                            <span className="text-xs font-semibold text-card-foreground w-6 text-center">{item.qty}</span>
                            <button type="button" onClick={() => setServiceItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1, amount: i.unitPrice * (i.qty + 1) } : i))} className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-secondary text-xs">+</button>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-bold text-card-foreground">₹ {item.amount.toLocaleString()}</td>
                        <td className="px-3 py-2.5">
                          <button type="button" onClick={() => setServiceItems(prev => prev.filter(i => i.id !== item.id))} className="p-1.5 rounded border border-border hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Summary */}
                <div className="border-t border-border bg-secondary/10 px-4 py-3 flex justify-end">
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between gap-8 text-xs text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-card-foreground">₹ {serviceItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-8 text-sm font-bold">
                      <span className="text-card-foreground">Total</span>
                      <span className="text-primary">₹ {serviceItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service Appointments Schedule */}
          {serviceItems.length > 0 && (
            <div className="md:col-span-2">
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/10">
                  <h3 className="text-sm font-bold text-card-foreground">Service Appointments Schedule</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Schedule service visits</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        {["#", "Service", "Schedule Date", "From Time", "To Time", "Required Employees"].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {serviceItems.map((item, index) => {
                        const sched = serviceSchedules.find(s => s.id === item.id) || { id: item.id, service: item.name, scheduleDate: "", fromTime: "", toTime: "", requiredEmployees: 1 };
                        const updateSched = (field: string, value: string | number) => {
                          setServiceSchedules(prev => {
                            const existing = prev.find(s => s.id === item.id);
                            if (existing) return prev.map(s => s.id === item.id ? { ...s, [field]: value } : s);
                            return [...prev, { ...sched, [field]: value }];
                          });
                        };
                        return (
                          <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{index + 1}</td>
                            <td className="px-3 py-2.5 text-xs font-medium text-card-foreground">{item.name}</td>
                            <td className="px-3 py-2.5">
                              <input type="date" value={sched.scheduleDate} onChange={e => updateSched("scheduleDate", e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-1 focus:ring-primary/20 text-card-foreground" />
                            </td>
                            <td className="px-3 py-2.5">
                              <input type="time" value={sched.fromTime} onChange={e => updateSched("fromTime", e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-1 focus:ring-primary/20 text-card-foreground" />
                            </td>
                            <td className="px-3 py-2.5">
                              <input type="time" value={sched.toTime} onChange={e => updateSched("toTime", e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-1 focus:ring-primary/20 text-card-foreground" />
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => updateSched("requiredEmployees", Math.max(0, sched.requiredEmployees - 1))} className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-secondary text-sm">−</button>
                                <span className="text-xs font-semibold text-card-foreground min-w-[2rem] text-center">{sched.requiredEmployees}</span>
                                <button type="button" onClick={() => updateSched("requiredEmployees", sched.requiredEmployees + 1)} className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-secondary text-sm">+</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

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
