import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useCustomersStore, type Customer, type CustomerDocument, type CustomerType, type ContactPerson } from "@/store/customersStore";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  customer?: Customer;
  prefill?: Partial<Omit<Customer, "id">>;
  onClose: () => void;
  onSaved?: (customer: Customer) => void;
};

const LABELS = {
  title: "Customer Add Fields",
  customerId: "Customer ID ( Automated Generated )",
  customerType: "Customer Type ( Residential / Commercial )",
  firstName: "First Name",
  lastName: "Last Name",
  emailAddress: "Email Address",
  landline: "Landline",
  mobile: "Mobile",
  gstNumber: "GST Number",
  placeOfSupply: "Place Of Supply",
  paymentTerms: "Payment Terms",
  billingAddress: "Billing Address",
  siteAddress: "Site Address",
  contactPersonsDetails: "Add Contact Persons Details",
  customerDocuments: "Customer Documents",
} as const;

function buildDisplayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim().replace(/\s+/g, " ");
}

export function CustomerFormModal({ open, mode, customer, prefill, onClose, onSaved }: Props) {
  const { addCustomer, updateCustomer, getNextCustomerId } = useCustomersStore();
  const [extraSiteAddresses, setExtraSiteAddresses] = useState<string[]>([]);
  const [isCustomPayment, setIsCustomPayment] = useState(false);
  const [commercialDoc, setCommercialDoc] = useState<File | null>(null);

  const [form, setForm] = useState<Customer>({
    id: getNextCustomerId(),
    customerType: "Residential",
    firstName: "",
    lastName: "",
    emailAddress: "",
    landline: "",
    mobile: "",
    gstNumber: "",
    placeOfSupply: "",
    paymentTerms: "",
    billingAddress: "",
    siteAddress: "",
    contactPersonsDetails: [{ name: "", email: "", city: "", pincode: "", address: "" }],
    customerDocuments: [],
  });

  useEffect(() => {
    if (!open) return;
    setExtraSiteAddresses([]);
    setIsCustomPayment(false);
    setCommercialDoc(null);
    if (mode === "edit" && customer) {
      const contacts = Array.isArray(customer.contactPersonsDetails) && customer.contactPersonsDetails.length > 0
        ? customer.contactPersonsDetails
        : [{ name: "", email: "", city: "", pincode: "", address: "" }];
      setForm({ ...customer, contactPersonsDetails: contacts });
      setIsCustomPayment(!["30", "60", "90", ""].includes(customer.paymentTerms));
      return;
    }
    const nextId = getNextCustomerId();
    const next = {
      id: nextId,
      customerType: "Residential",
      firstName: "",
      lastName: "",
      emailAddress: "",
      landline: "",
      mobile: "",
      gstNumber: "",
      placeOfSupply: "",
      paymentTerms: "",
      billingAddress: "",
      siteAddress: "",
      contactPersonsDetails: [{ name: "", email: "", city: "", pincode: "", address: "" }],
      customerDocuments: [],
    } satisfies Customer;
    const merged: Customer = { ...next, ...prefill, id: nextId };
    setForm(merged);
  }, [open, mode, customer, getNextCustomerId, prefill]);

  const setField = <K extends keyof Customer>(key: K, value: Customer[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const docs: CustomerDocument[] = Array.from(files).map((f, idx) => ({
      id: `DOC-${Date.now()}-${idx}`,
      fileName: f.name,
    }));
    setForm((prev) => ({ ...prev, customerDocuments: [...prev.customerDocuments, ...docs] }));
  };

  const removeDoc = (docId: string) => {
    setForm((prev) => ({
      ...prev,
      customerDocuments: prev.customerDocuments.filter((d) => d.id !== docId),
    }));
  };

  const save = () => {
    if (!form.firstName.trim()) {
      toast.error(`${LABELS.firstName} is required`);
      return;
    }
    if (!form.mobile.trim()) {
      toast.error(`${LABELS.mobile} is required`);
      return;
    }
    if (!form.siteAddress.trim()) {
      toast.error(`${LABELS.siteAddress} is required`);
      return;
    }

    const normalized: Customer = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      emailAddress: form.emailAddress.trim(),
      landline: form.landline.trim(),
      mobile: form.mobile.trim(),
      gstNumber: form.gstNumber.trim(),
      placeOfSupply: form.placeOfSupply.trim(),
      paymentTerms: form.paymentTerms.trim(),
      billingAddress: (form.billingAddress.trim() || form.siteAddress.trim()).trim(),
      siteAddress: form.siteAddress.trim(),
      contactPersonsDetails: form.contactPersonsDetails,
    };

    if (mode === "edit") {
      updateCustomer(normalized.id, normalized);
      toast.success(`Customer updated: ${buildDisplayName(normalized.firstName, normalized.lastName)}`);
      onSaved?.(normalized);
      onClose();
      return;
    }

    addCustomer(normalized);
    toast.success(`Customer added: ${buildDisplayName(normalized.firstName, normalized.lastName)}`);
    onSaved?.(normalized);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/75">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">{LABELS.title}</h3>
            {mode === "create" && (
              <p className="text-xs text-muted-foreground mt-1">Save once to use this customer anywhere (including Work Orders).</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.customerId}</label>
              <input
                value={form.id}
                readOnly
                className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-card-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.customerType}</label>
              <select
                value={form.customerType}
                onChange={(e) => {
                  setField("customerType", e.target.value as CustomerType);
                  if (e.target.value !== "Commercial") setCommercialDoc(null);
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {form.customerType === "Commercial" && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Company Document (PDF only)</label>
                <label className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-secondary border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {commercialDoc ? commercialDoc.name : "Click to upload PDF"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCommercialDoc(file);
                    }}
                  />
                </label>
                {commercialDoc && (
                  <button
                    type="button"
                    onClick={() => setCommercialDoc(null)}
                    className="mt-1 text-xs text-destructive hover:opacity-80 transition-opacity"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.firstName}</label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="e.g. Praveen"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.lastName}</label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="e.g. Kumar"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.mobile}</label>
              <input
                value={form.mobile}
                onChange={(e) => setField("mobile", e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground block">{LABELS.siteAddress}</label>
                <button
                  type="button"
                  onClick={() => setExtraSiteAddresses(prev => [...prev, ""])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <textarea
                value={form.siteAddress}
                onChange={(e) => setField("siteAddress", e.target.value)}
                placeholder="e.g. 12 MG Road, Kochi"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              {extraSiteAddresses.map((addr, idx) => (
                <div key={idx} className="relative mt-2">
                  <textarea
                    value={addr}
                    onChange={(e) => setExtraSiteAddresses(prev => prev.map((a, i) => i === idx ? e.target.value : a))}
                    placeholder={`e.g. Site Address ${idx + 2}`}
                    rows={2}
                    className="w-full px-3 py-2.5 pr-9 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => setExtraSiteAddresses(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-2.5 right-2.5 p-0.5 hover:bg-destructive/10 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Location URL</label>
              <input
                value={form.locationUrl || ""}
                onChange={(e) => setField("locationUrl", e.target.value)}
                placeholder="e.g. Google Maps link or coordinates"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="text-xs font-medium text-muted-foreground block">{LABELS.billingAddress}</label>
                
              </div>
              <textarea
                value={form.billingAddress}
                onChange={(e) => setField("billingAddress", e.target.value)}
                placeholder="e.g. 12 MG Road, Kochi"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.emailAddress}</label>
              <input
                type="email"
                value={form.emailAddress}
                onChange={(e) => setField("emailAddress", e.target.value)}
                placeholder="e.g. customer@email.com"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.landline}</label>
              <input
                value={form.landline}
                onChange={(e) => setField("landline", e.target.value)}
                placeholder="e.g. 044-12345678"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.gstNumber}</label>
              <input
                value={form.gstNumber}
                onChange={(e) => setField("gstNumber", e.target.value)}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.placeOfSupply}</label>
              <select
                value={form.placeOfSupply}
                onChange={(e) => setField("placeOfSupply", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="Delhi">Delhi</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Ladakh">Ladakh</option>
                <option value="Lakshadweep">Lakshadweep</option>
                <option value="Puducherry">Puducherry</option>
              </select>
            </div>

            <div className={isCustomPayment ? "md:col-span-2" : ""}>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.paymentTerms}</label>
              <div className={isCustomPayment ? "flex gap-2" : ""}>
                <select
                  value={isCustomPayment ? "custom" : form.paymentTerms}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setIsCustomPayment(true);
                      setField("paymentTerms", "");
                    } else {
                      setIsCustomPayment(false);
                      setField("paymentTerms", e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="custom">Custom</option>
                </select>
                {isCustomPayment && (
                  <input
                    value={form.paymentTerms}
                    onChange={(e) => setField("paymentTerms", e.target.value)}
                    placeholder="Enter custom payment terms"
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-card-foreground block">{LABELS.contactPersonsDetails}</label>
                <button
                  type="button"
                  onClick={() => {
                    const newContact: ContactPerson = { name: "", email: "", city: "", pincode: "", address: "" };
                    setField("contactPersonsDetails", [...form.contactPersonsDetails, newContact]);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Contact Person
                </button>
              </div>
              <div className="space-y-4">
                {form.contactPersonsDetails.map((cp, idx) => {
                  const update = (field: keyof ContactPerson, val: string) => {
                    const updated = form.contactPersonsDetails.map((p, i) => i === idx ? { ...p, [field]: val } : p);
                    setField("contactPersonsDetails", updated);
                  };
                  const removeContact = () => {
                    if (form.contactPersonsDetails.length === 1) {
                      toast.error("At least one contact person is required");
                      return;
                    }
                    const updated = form.contactPersonsDetails.filter((_, i) => i !== idx);
                    setField("contactPersonsDetails", updated);
                  };
                  return (
                    <div key={`contact-${idx}`} className="relative p-4 rounded-lg bg-secondary/30 border border-border">
                      {form.contactPersonsDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={removeContact}
                          className="absolute top-2 right-2 p-1 hover:bg-destructive/10 rounded transition-colors"
                          title="Remove contact person"
                        >
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                          <input value={cp.name} onChange={e => update("name", e.target.value)} placeholder="e.g. John" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                          <input value={cp.email} onChange={e => update("email", e.target.value)} placeholder="e.g. john@email.com" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">City</label>
                          <input value={cp.city} onChange={e => update("city", e.target.value)} placeholder="e.g. Kochi" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Pincode</label>
                          <input value={cp.pincode} onChange={e => update("pincode", e.target.value)} placeholder="e.g. 682001" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                          <input value={cp.address} onChange={e => update("address", e.target.value)} placeholder="e.g. 12 MG Road" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            Save Customer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
