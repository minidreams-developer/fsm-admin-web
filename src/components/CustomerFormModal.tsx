import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCustomersStore, type Customer, type CustomerDocument, type CustomerType } from "@/store/customersStore";

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
    contactPersonsDetails: "",
    customerDocuments: [],
  });
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && customer) {
      setForm(customer);
      setShowMore(true);
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
      contactPersonsDetails: "",
      customerDocuments: [],
    } satisfies Customer;
    const merged: Customer = { ...next, ...prefill, id: nextId };
    setForm(merged);
    const hasOptional =
      Boolean(merged.emailAddress.trim()) ||
      Boolean(merged.landline.trim()) ||
      Boolean(merged.gstNumber.trim()) ||
      Boolean(merged.placeOfSupply.trim()) ||
      Boolean(merged.paymentTerms.trim()) ||
      Boolean(merged.billingAddress.trim()) ||
      Boolean(merged.contactPersonsDetails.trim()) ||
      merged.customerDocuments.length > 0;
    setShowMore(hasOptional);
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
      contactPersonsDetails: form.contactPersonsDetails.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
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
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.firstName}</label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.lastName}</label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.mobile}</label>
              <input
                value={form.mobile}
                onChange={(e) => setField("mobile", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.siteAddress}</label>
              <textarea
                value={form.siteAddress}
                onChange={(e) => setField("siteAddress", e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors text-sm font-semibold text-card-foreground"
              >
                {showMore ? "Hide additional customer fields" : "Show additional customer fields"}
              </button>
            </div>

            {showMore && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.emailAddress}</label>
                  <input
                    type="email"
                    value={form.emailAddress}
                    onChange={(e) => setField("emailAddress", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.landline}</label>
                  <input
                    value={form.landline}
                    onChange={(e) => setField("landline", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.gstNumber}</label>
                  <input
                    value={form.gstNumber}
                    onChange={(e) => setField("gstNumber", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.placeOfSupply}</label>
                  <input
                    value={form.placeOfSupply}
                    onChange={(e) => setField("placeOfSupply", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.paymentTerms}</label>
                  <input
                    value={form.paymentTerms}
                    onChange={(e) => setField("paymentTerms", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="text-xs font-medium text-muted-foreground block">{LABELS.billingAddress}</label>
                    <button
                      type="button"
                      onClick={() => setField("billingAddress", form.siteAddress)}
                      className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                    >
                      Same as Site Address
                    </button>
                  </div>
                  <textarea
                    value={form.billingAddress}
                    onChange={(e) => setField("billingAddress", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.contactPersonsDetails}</label>
                  <textarea
                    value={form.contactPersonsDetails}
                    onChange={(e) => setField("contactPersonsDetails", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.customerDocuments}</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-xs file:font-semibold"
                  />
                  {form.customerDocuments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {form.customerDocuments.map((d) => (
                        <div key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                          <span className="text-sm text-card-foreground truncate">{d.fileName}</span>
                          <button
                            type="button"
                            onClick={() => removeDoc(d.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
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
