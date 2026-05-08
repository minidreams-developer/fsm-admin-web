import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Upload, Copy } from "lucide-react";
import { toast } from "sonner";
import { useCustomersStore, type Customer, type CustomerDocument, type CustomerType, type ContactPerson, type AddressFields, type CompanyDocument } from "@/store/customersStore";

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
  title: "add Customer",
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

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const emptyAddress = (): AddressFields => ({
  attention: "", country: "India", street1: "", street2: "",
  city: "", state: "", pinCode: "", phone: "", fax: "",
});

function buildDisplayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim().replace(/\s+/g, " ");
}

function addressToString(a: AddressFields): string {
  const parts = [a.street1, a.street2, a.city, a.state, a.pinCode].filter(Boolean);
  if (parts.length === 0) return ""; // don't return just the country
  if (a.country && a.country !== "India") parts.push(a.country);
  return parts.join(", ");
}

// Reusable structured address block
function AddressBlock({
  title,
  fields,
  onChange,
  extra,
}: {
  title: string;
  fields: AddressFields;
  onChange: (updated: AddressFields) => void;
  extra?: React.ReactNode;
}) {
  const set = (key: keyof AddressFields, val: string) =>
    onChange({ ...fields, [key]: val });

  const inputCls = "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1.5 block";

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-card-foreground">{title}</h4>
        {extra}
      </div>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Attention</label>
          <input value={fields.attention} onChange={e => set("attention", e.target.value)} placeholder="e.g. Mr. Praveen Kumar" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Country / Region</label>
          <select value={fields.country} onChange={e => set("country", e.target.value)} className={inputCls}>
            <option value="">Select</option>
            <option value="India">India</option>
            <option value="UAE">UAE</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Address</label>
          <textarea value={fields.street1} onChange={e => set("street1", e.target.value)} placeholder="Street 1" rows={2} className={`${inputCls} resize-none`} />
          <textarea value={fields.street2} onChange={e => set("street2", e.target.value)} placeholder="Street 2" rows={2} className={`${inputCls} resize-none mt-2`} />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input value={fields.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Kochi" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>State</label>
          <select value={fields.state} onChange={e => set("state", e.target.value)} className={inputCls}>
            <option value="">Select or type to add</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Pin Code</label>
          <input value={fields.pinCode} onChange={e => set("pinCode", e.target.value)} placeholder="e.g. 682001" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <div className="flex gap-2">
            <select className="px-2 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none w-20">
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+971">+971</option>
            </select>
            <input value={fields.phone} onChange={e => set("phone", e.target.value)} placeholder="Phone number" className={`${inputCls} flex-1`} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Fax Number</label>
          <input value={fields.fax} onChange={e => set("fax", e.target.value)} placeholder="e.g. 044-12345678" className={inputCls} />
        </div>
      </div>
    </div>
  );
}

export function CustomerFormModal({ open, mode, customer, prefill, onClose, onSaved }: Props) {
  const { addCustomer, updateCustomer, getNextCustomerId } = useCustomersStore();
  const [extraSiteAddresses, setExtraSiteAddresses] = useState<string[]>([]);
  const [isCustomPayment, setIsCustomPayment] = useState(false);
  const [commercialDocs, setCommercialDocs] = useState<{ file: File; dataUrl: string }[]>([]);
  const [existingDocFiles, setExistingDocFiles] = useState<CompanyDocument[]>([]);
  const [billingFields, setBillingFields] = useState<AddressFields>(emptyAddress());
  const [siteFields, setSiteFields] = useState<AddressFields>(emptyAddress());
  const [extraSiteFields, setExtraSiteFields] = useState<AddressFields[]>([]);

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
    contactPersonsDetails: [{ name: "", phone: "", email: "", designation: "" }],
    customerDocuments: [],
  });

  useEffect(() => {
    if (!open) return;
    setExtraSiteAddresses([]);
    setIsCustomPayment(false);
    setCommercialDocs([]);
    if (mode === "edit" && customer) {
      const contacts = Array.isArray(customer.contactPersonsDetails) && customer.contactPersonsDetails.length > 0
        ? customer.contactPersonsDetails
        : [{ name: "", phone: "", email: "", designation: "" }];
      setForm({ ...customer, contactPersonsDetails: contacts });
      setIsCustomPayment(!["30", "60", "90", ""].includes(customer.paymentTerms));
      setBillingFields(customer.billingAddressFields ?? emptyAddress());
      setSiteFields(customer.siteAddressFields ?? emptyAddress());
      setExtraSiteFields(customer.additionalSiteAddressFields ?? []);
      // Load existing docs: prefer companyDocumentFiles, fall back to legacy arrays
      const existing: CompanyDocument[] = customer.companyDocumentFiles?.length
        ? customer.companyDocumentFiles
        : customer.companyDocuments?.length
        ? customer.companyDocuments.map(name => ({ name }))
        : customer.companyDocument
        ? [{ name: customer.companyDocument }]
        : [];
      setExistingDocFiles(existing);
      return;
    }
    setExistingDocFiles([]);
    setBillingFields(emptyAddress());
    setSiteFields(emptyAddress());
    setExtraSiteFields([]);
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
      contactPersonsDetails: [{ name: "", phone: "", email: "", designation: "" }],
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

    const derivedSiteAddress = addressToString(siteFields) || form.siteAddress.trim();
    const allSiteAddresses = [
      derivedSiteAddress,
      ...extraSiteFields.map(f => addressToString(f)).filter(Boolean),
    ].filter(Boolean).join(" | ");
    const derivedBillingAddress = addressToString(billingFields) || derivedSiteAddress;

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
      billingAddress: derivedBillingAddress,
      siteAddress: allSiteAddresses || derivedSiteAddress,
      billingAddressFields: billingFields,
      siteAddressFields: siteFields,
      additionalSiteAddressFields: extraSiteFields,
      contactPersonsDetails: form.contactPersonsDetails,
      companyDocument: commercialDocs.length > 0 ? commercialDocs[0].file.name : (existingDocFiles[0]?.name || form.companyDocument || ""),
      companyDocuments: [
        ...existingDocFiles.map(d => d.name),
        ...commercialDocs.map(d => d.file.name),
      ].filter(Boolean),
      companyDocumentFiles: [
        ...existingDocFiles,
        ...commercialDocs.map(d => ({ name: d.file.name, dataUrl: d.dataUrl })),
      ],
      customerLanguage: form.customerLanguage || "",
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
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
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
                onChange={(e) => setField("customerType", e.target.value as CustomerType)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Language</label>
              <select
                value={form.customerLanguage || ""}
                onChange={(e) => setField("customerLanguage", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Marathi">Marathi</option>
                <option value="Bengali">Bengali</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Odia">Odia</option>
                <option value="Urdu">Urdu</option>
                <option value="Arabic">Arabic</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Company Document - Multiple PDF uploads */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Company Documents (PDF only)</label>
              <label className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-secondary border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Click to upload PDF(s)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCommercialDocs(prev => [...prev, { file, dataUrl: reader.result as string }]);
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = "";
                  }}
                />
              </label>
              {/* Existing saved docs */}
              {existingDocFiles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {existingDocFiles.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{doc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExistingDocFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-destructive hover:opacity-80 transition-opacity flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Newly selected docs */}
              {commercialDocs.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {commercialDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <Upload className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-xs text-card-foreground truncate">{doc.file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCommercialDocs(prev => prev.filter((_, i) => i !== idx))}
                        className="text-destructive hover:opacity-80 transition-opacity flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {(existingDocFiles.length > 0 || commercialDocs.length > 0) && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {existingDocFiles.length + commercialDocs.length} document(s) total
                </p>
              )}
            </div>

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

            {/* Structured Address Section */}
            <div className="md:col-span-2">
              <div className="flex flex-col gap-6 p-5 rounded-xl bg-secondary/20 border border-border">
                {/* Billing + Primary Site side by side */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Billing Address */}
                  <AddressBlock
                    title="Billing Address"
                    fields={billingFields}
                    onChange={setBillingFields}
                  />

                  <div className="hidden md:block w-px bg-border flex-shrink-0" />
                  <div className="md:hidden h-px bg-border" />

                  {/* Primary Site Address */}
                  <AddressBlock
                    title="Site Address 1"
                    fields={siteFields}
                    onChange={setSiteFields}
                    extra={
                      <button
                        type="button"
                        onClick={() => setSiteFields({ ...billingFields })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                        title="Copy billing address to site address"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy billing
                      </button>
                    }
                  />
                </div>

                {/* Extra Site Addresses */}
                {extraSiteFields.map((fields, idx) => (
                  <div key={idx}>
                    <div className="h-px bg-border mb-6" />
                    <AddressBlock
                      title={`Site Address ${idx + 2}`}
                      fields={fields}
                      onChange={(updated) =>
                        setExtraSiteFields(prev => prev.map((f, i) => i === idx ? updated : f))
                      }
                      extra={
                        <button
                          type="button"
                          onClick={() =>
                            setExtraSiteFields(prev => prev.filter((_, i) => i !== idx))
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:opacity-80 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      }
                    />
                  </div>
                ))}

                {/* Add Site Address button */}
                <button
                  type="button"
                  onClick={() => setExtraSiteFields(prev => [...prev, emptyAddress()])}
                  className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Site Address
                </button>
              </div>
            </div>

            {/* Location URL */}
            {/* <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Location URL</label>
              <input
                value={form.locationUrl || ""}
                onChange={(e) => setField("locationUrl", e.target.value)}
                placeholder="e.g. Google Maps link or coordinates"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div> */}

            {/* <div className="md:col-span-2">
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
            </div> */}

            {/* <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Location URL</label>
              <input
                value={form.locationUrl || ""}
                onChange={(e) => setField("locationUrl", e.target.value)}
                placeholder="e.g. Google Maps link or coordinates"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div> */}
{/* 
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
            </div> */}

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
              <label className="text-xs font-medium text-muted-foreground mb-2 block">PAN Card Number</label>
              <input
                value={form.panCardNumber || ""}
                onChange={(e) => setField("panCardNumber", e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
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
                    const newContact: ContactPerson = { name: "", phone: "", email: "", designation: "" };
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
                          <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                          <input value={cp.phone || ""} onChange={e => update("phone", e.target.value)} placeholder="e.g. 9876543210" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                          <input value={cp.email} onChange={e => update("email", e.target.value)} placeholder="e.g. john@email.com" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Designation</label>
                          <input value={(cp as any).designation || ""} onChange={e => update("designation" as keyof ContactPerson, e.target.value)} placeholder="e.g. Manager" className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-xs text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
