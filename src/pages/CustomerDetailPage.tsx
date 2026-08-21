 import { CustomerFormModal } from "@/components/CustomerFormModal";
import { StatusBadge } from "@/components/StatusBadge";
import { useCustomersStore } from "@/store/customersStore";
import { useProjectsStore } from "@/store/projectsStore";
import { ArrowLeft, Briefcase, ChevronDown, ClipboardList, Edit2, FileText, FolderKanban, Trash2 } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DetailField } from "@/components/DetailField";
import {buildDisplayName,parseRupee,formatRupee,getCustomerWorkOrders,getLedger} from "@/utils/CustomerUtils";
import { DataTable, type DataTableColumn} from "@/components/table/Datatable";
import { ActionDropdown } from "@/components/ActionDropdown";


const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const customerId = params.id ?? "";
  const { customers, deleteCustomer } = useCustomersStore();
  const { workOrders } = useProjectsStore();
  const [showEdit, setShowEdit] = useState(searchParams.get("edit") === "true");
  const [activeTab, setActiveTab] = useState<"workorders" | "payments">("workorders");
  const [showActions, setShowActions] = useState(false);
  
  const detail = customers.find((c) => c.id === customerId) ?? null;
  
  if (!detail) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
            >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Customer</h2>
            <p className="text-sm text-muted-foreground">Customer not found</p>
          </div>
        </div>
        <div className="bg-card rounded-xl card-shadow p-6">
          <p className="text-sm text-muted-foreground">This customer may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }
  const name = buildDisplayName(detail);
  const customerWorkOrders = getCustomerWorkOrders(workOrders, name);
  const ledger = getLedger(workOrders, name);

  const paymentColumns: DataTableColumn<(typeof customerWorkOrders)[number]>[] = [
  {
    key: "id",
    header: "Work Order",
    render: (wo) => (
      <span className="font-medium text-card-foreground text-xs">
        {wo.id}
      </span>
    ),
  },
  {
    key: "serviceType",
    header: "Service",
    render: (wo) => (
      <span className="text-muted-foreground text-xs">
        {wo.serviceType}
      </span>
    ),
  },
  {
    key: "total",
    header: "Total",
    render: (wo) => (
      <span className="text-muted-foreground text-xs">
        {formatRupee(parseRupee(wo.totalValue))}
      </span>
    ),
  },
  {
    key: "paid",
    header: "Paid",
    render: (wo) => (
      <span className="text-success text-xs font-semibold">
        {formatRupee(parseRupee(wo.paidAmount))}
      </span>
    ),
  },
  {
    key: "balance",
    header: "Balance",
    render: (wo) => {
      const balance =
        parseRupee(wo.totalValue) - parseRupee(wo.paidAmount);

      return (
        <span
          className={`text-xs font-semibold ${
            balance <= 0 ? "text-success" : "text-destructive"
          }`}
        >
          {formatRupee(balance)}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (wo) => (
      <StatusBadge
        label={wo.status}
        variant={wo.status === "Completed" ? "neutral" : "warning"}
      />
    ),
  },
];

// action button
const actions = [
  {
    label: "Add Leads",
    icon: ClipboardList,
    onClick: () => {
      setShowActions(false);

      navigate("/leads/new", {
        state: {
          prefillCustomer: {
            name,
            phone: detail.mobile || detail.landline || "",
            address: detail.siteAddress || detail.billingAddress || "",
          },
        },
      });
    },
  },
  {
    label: "Convert to Quotation",
    icon: FileText,
    onClick: () => {
      setShowActions(false);

      navigate("/create-work-order", {
        state: {
          prefillCustomer: {
            id: detail.id,
            name,
            phone: detail.mobile || detail.landline || "",
            email: detail.emailAddress || "",
            address: detail.siteAddress || detail.billingAddress || "",
            siteAddress: detail.siteAddress || "",
            billingAddress: detail.billingAddress || "",
          },
        },
      });
    },
  },
  {
    label: "Convert to Work Order",
    icon: FolderKanban,
    onClick: () => {
      setShowActions(false);

      navigate("/create-work-order", {
        state: {
          prefillCustomer: {
            id: detail.id,
            name,
            phone: detail.mobile || detail.landline || "",
            email: detail.emailAddress || "",
            address: detail.siteAddress || detail.billingAddress || "",
            siteAddress: detail.siteAddress || "",
            billingAddress: detail.billingAddress || "",
          },
        },
      });
    },
  },
  {
    label: "Edit Customer",
    icon: Edit2,
    dividerBefore: true,
    onClick: () => {
      setShowActions(false);
      setShowEdit(true);
    },
  },
  {
    label: "Delete Customer",
    icon: Trash2,
    variant: "destructive" as const,
    onClick: () => {
      setShowActions(false);
      deleteCustomer(detail.id);
      navigate("/customers");
    },
  },
];


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground">{detail.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Actions dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowActions(v => !v)}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              Actions
              <ChevronDown className={`w-4 h-4 transition-transform ${showActions ? "rotate-180" : ""}`} />
            </button>
            {showActions && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <ActionDropdown actions={actions} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        {/* Header Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-primary">{name[0]}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-card-foreground">{name}</h1>
              <p className="text-lg text-muted-foreground mt-1">
                {detail.customerType}
                {detail.customerLanguage && (
                  <span className="ml-2 text-sm font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {detail.customerLanguage}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{detail.id}</p>
            </div>
          </div>
        </div>

        {/* All Information in Unified Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         <DetailField label="Mobile" value={detail.mobile || "—"} />

<DetailField label="Landline" value={detail.landline || "—"} />

<DetailField label="Email" value={detail.emailAddress || "—"} />

<DetailField label="GST Number" value={detail.gstNumber || "—"} />

<DetailField
  label="Total Billed"
  value={formatRupee(ledger.total)}
  valueClassName="text-lg font-bold text-primary"
/>

<DetailField
  label="Paid"
  value={formatRupee(ledger.paid)}
  valueClassName="text-lg font-bold text-success"
/>
        <DetailField
  label="Pending"
  value={formatRupee(ledger.balance)}
  valueClassName={`text-lg font-bold ${
    ledger.balance <= 0 ? "text-success" : "text-destructive"
  }`}
/>

<DetailField
  label="Work Orders"
  value={ledger.projects}
/>
        </div>

        {/* Addresses */}
        <DetailField
  label="Billing Address"
  value={detail.billingAddress || "—"}
  valueClassName="text-sm font-semibold text-card-foreground"
/>
          {/* Primary site address */}
          <DetailField
  label="Site Address 1"
  value={
    detail.siteAddressFields
      ? [
          detail.siteAddressFields.street1,
          detail.siteAddressFields.street2,
          detail.siteAddressFields.city,
          detail.siteAddressFields.state,
          detail.siteAddressFields.pinCode,
        ]
          .filter(Boolean)
          .join(", ") || detail.siteAddress || "—"
      : detail.siteAddress || "—"
  }
  valueClassName="text-sm font-semibold text-card-foreground"
/>
          {/* Additional site addresses */}
          {detail.additionalSiteAddressFields?.map((addr, idx) => (
            <DetailField
  key={idx}
  label={`Site Address ${idx + 2}`}
  value={
    [
      addr.street1,
      addr.street2,
      addr.city,
      addr.state,
      addr.pinCode,
    ]
      .filter(Boolean)
      .join(", ") || "—"
  }
  valueClassName="text-sm font-semibold text-card-foreground"
/>
          ))}
          {(detail.companyDocumentFiles?.length || detail.companyDocuments?.length || detail.companyDocument) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Documents</p>
              <div className="space-y-2">
                {(detail.companyDocumentFiles?.length
                  ? detail.companyDocumentFiles
                  : detail.companyDocuments?.length
                  ? detail.companyDocuments.map(name => ({ name, dataUrl: undefined }))
                  : detail.companyDocument
                  ? [{ name: detail.companyDocument, dataUrl: undefined }]
                  : []
                ).map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-secondary border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                      </svg>
                      <span className="text-sm font-medium text-card-foreground truncate max-w-[200px]">{doc.name}</span>
                    </div>
                    {doc.dataUrl && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            // Convert base64 data URL to Blob URL for reliable browser viewing
                            const [header, base64] = doc.dataUrl!.split(",");
                            const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
                            const binary = atob(base64);
                            const bytes = new Uint8Array(binary.length);
                            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                            const blob = new Blob([bytes], { type: mime });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, "_blank");
                            // Revoke after a short delay to allow the tab to load
                            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                          title="View document"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const [header, base64] = doc.dataUrl!.split(",");
                            const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
                            const binary = atob(base64);
                            const bytes = new Uint8Array(binary.length);
                            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                            const blob = new Blob([bytes], { type: mime });
                            const blobUrl = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = blobUrl;
                            a.download = doc.name;
                            a.click();
                            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors"
                          title="Download document"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {detail.contactPersonsDetails && detail.contactPersonsDetails.length > 0 && (
            <div className="space-y-2 md:col-span-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Persons</p>
              <div className="space-y-2">
                {detail.contactPersonsDetails.map((contact, index) => (
                  <div key={index} className="text-sm font-semibold text-card-foreground">
                    <p className="font-bold">{contact.name}</p>
                    {contact.phone && <p className="text-xs text-muted-foreground">Phone: {contact.phone}</p>}
                    {contact.email && <p className="text-xs text-muted-foreground">Email: {contact.email}</p>}
                    {(contact as any).designation && <p className="text-xs text-muted-foreground">Designation: {(contact as any).designation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabbed Work Orders / Payment History */}
      <div className="bg-card rounded-xl card-shadow border border-border">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("workorders")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "workorders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Briefcase className="w-4 h-4" />
              Assigned Work Orders {customerWorkOrders.length}
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "payments" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Payment History
            </button>
          </div>

          <div className="p-6">
            {activeTab === "workorders" && (
              <div className="space-y-3">
                {customerWorkOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No work orders assigned to this customer yet.</p>
                  </div>
                ) : customerWorkOrders.map((wo) => (
                  <button
                    key={wo.id}
                    onClick={() => navigate(`/work-order/${wo.id}`)}
                    className="w-full p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 hover:border-primary/30 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground">{wo.id}</p>
                        <p className="text-sm text-muted-foreground">{wo.serviceType}</p>
                      </div>
                      <StatusBadge label={wo.status} variant={wo.status === "Completed" ? "neutral" : "warning"} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{wo.address}</span>
                      <span className="font-semibold text-primary">{wo.totalValue}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "payments" && (


              <div className="overflow-x-auto">
                {customerWorkOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-muted-foreground">No payment history available for this customer yet.</p>
                  </div>
                ) : (
                 <DataTable
  columns={paymentColumns}
  data={customerWorkOrders}
  getRowKey={(wo) => wo.id}
  onRowClick={(wo) =>
    navigate("/payments", {
      state: { workOrderId: wo.id },
    })
  }
  emptyMessage="No payment history available for this customer yet."
/>
                )}
                </div>
            )}
            </div>
         </div>

      <CustomerFormModal
        open={showEdit}
        mode="edit"
        customer={detail}
        onClose={() => setShowEdit(false)}
      />
    </div>
  );
};

export default CustomerDetailPage