import { Search, Plus, Edit2, UserCheck, Clock, UserX, Users } from "lucide-react";
import { useState } from "react";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { PaginationControls } from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { useCustomersStore, type Customer } from "@/store/customersStore";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { useNavigate } from "react-router-dom";
import { LeadSummaryCard } from "@/components/card/LeadSummaryCard";
import { DataTable } from "@/components/table/Datatable";
import {
  buildDisplayName,
  parseRupee,
  formatRupee,
  getCustomerWorkOrders,
  getLedger,
} from "@/utils/CustomerUtils";

// function buildDisplayName(c: Customer) {
//   return `${c.firstName} ${c.lastName}`.trim().replace(/\s+/g, " ");
// }

// function parseRupee(value: string) {
//   const n = Number(value.replace(/[₹,\s]/g, ""));
//   return Number.isFinite(n) ? n : 0;
// }

// function formatRupee(value: number) {
//   return `₹ ${Math.max(0, Math.round(value)).toLocaleString()}`;
// }

// function getCustomerWorkOrders(workOrders: WorkOrder[], customerName: string) {
//   return workOrders.filter((wo) => wo.customer.trim().toLowerCase() === customerName.trim().toLowerCase());
// }

// function getLedger(workOrders: WorkOrder[], customerName: string) {
//   const items = getCustomerWorkOrders(workOrders, customerName);
//   const total = items.reduce((acc, wo) => acc + parseRupee(wo.totalValue), 0);
//   const paid = items.reduce((acc, wo) => acc + parseRupee(wo.paidAmount), 0);
//   return { projects: items.length, total, paid, balance: total - paid };
// }

const CustomersPage = () => {
  const navigate = useNavigate();
  const { customers } = useCustomersStore();
  const { workOrders } = useProjectsStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [clearedOverrides, setClearedOverrides] = useState<Record<string, boolean>>({})

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = customers.filter((c) => {
    if (!normalizedSearch) return true;
    const name = buildDisplayName(c).toLowerCase();
    return (
      name.includes(normalizedSearch) ||
      c.id.toLowerCase().includes(normalizedSearch) ||
      c.mobile.toLowerCase().includes(normalizedSearch) ||
      c.emailAddress.toLowerCase().includes(normalizedSearch) ||
      c.gstNumber.toLowerCase().includes(normalizedSearch)
    );
  });

  const pagination = usePagination({
    items: filtered,
    itemsPerPage: 10,
  });

  const customerColumns: DataTableColumn<Customer>[] = [
  {
    key: "id",
    header: "CUST ID",
    render: (c) => (
      <span className="font-semibold text-primary text-xs">
        {c.id}
      </span>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (c) => (
      <span className="font-medium text-card-foreground text-xs">
        {buildDisplayName(c)}
      </span>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    render: (c) => (
      <span className="text-muted-foreground text-xs">
        {c.mobile}
      </span>
    ),
  },
  {
    key: "workOrders",
    header: "Work Orders",
    render: (c) => {
      const ledger = getLedger(workOrders, buildDisplayName(c));

      return (
        <span className="text-muted-foreground text-xs">
          {ledger.projects}
        </span>
      );
    },
  },
  {
    key: "total",
    header: "Total",
    render: (c) => {
      const ledger = getLedger(workOrders, buildDisplayName(c));

      return (
        <span className="text-muted-foreground text-xs">
          {formatRupee(ledger.total)}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "Active/Inactive",
    render: (c) => {
      const ledger = getLedger(workOrders, buildDisplayName(c));
      const balance = ledger.balance;

      const isCleared =
        clearedOverrides[c.id] !== undefined
          ? clearedOverrides[c.id]
          : balance <= 0;

      return (
        <button
          onClick={(e) => {
            e.stopPropagation();

            setClearedOverrides((prev) => ({
              ...prev,
              [c.id]: !isCleared,
            }));
          }}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            isCleared ? "bg-green-500" : "bg-muted"
          }`}
          title={isCleared ? "Cleared" : formatRupee(balance)}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              isCleared ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>
      );
    },
  },
  {
    key: "action",
    header: "Action",
    render: (c) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditCustomer(c);
        }}
        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
        title="Edit"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    ),
  },
];

  const customerCards = [
  {
    title: "Total Customers",
    value: customers.length,
    icon: Users,
    color: "primary" as const,
  },
  {
    title: "Active",
    value: customers.filter((c) => c.status === "Active").length,
    icon: UserCheck,
    color: "success" as const,
  },
  {
    title: "Pending",
    value: customers.filter((c) => c.status === "Pending").length,
    icon: Clock,
    color: "warning" as const,
  },
  {
    title: "Inactive",
    value: customers.filter((c) => c.status === "Inactive").length,
    icon: UserX,
    color: "destructive" as const,
  },
];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Customers</h2>
          <p className="text-sm text-muted-foreground">Customer profiles and payment history</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {customerCards.map((card) => (
    <LeadSummaryCard
      key={card.title}
      title={card.title}
      value={card.value}
      icon={card.icon}
      color={card.color}
    />
  ))}
</div>

{/* table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <DataTable
  columns={customerColumns}
  data={pagination.paginatedItems}
  getRowKey={(customer) => customer.id}
  onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
  emptyMessage="No customers found."
/>
      </div>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={filtered.length}
        onPageChange={pagination.setCurrentPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
      />

      <CustomerFormModal
        open={showAdd}
        mode="create"
        onClose={() => setShowAdd(false)}
        onSaved={(c) => {
          setShowAdd(false);
          // Use setTimeout to ensure store persists before navigation
          setTimeout(() => navigate(`/customers/${c.id}`), 100);
        }}
      />
      <CustomerFormModal
        open={!!editCustomer}
        mode="edit"
        customer={editCustomer ?? undefined}
        onClose={() => setEditCustomer(null)}
        onSaved={() => setEditCustomer(null)}
      />
    </div>
  );
};

// export const CustomerDetailPage = () => {
//   const navigate = useNavigate();
//   const params = useParams();
//   const [searchParams] = useSearchParams();
//   const customerId = params.id ?? "";
//   const { customers, deleteCustomer } = useCustomersStore();
//   const { workOrders } = useProjectsStore();
//   const [showEdit, setShowEdit] = useState(searchParams.get("edit") === "true");
//   const [activeTab, setActiveTab] = useState<"workorders" | "payments">("workorders");
//   const [showActions, setShowActions] = useState(false);

//   const detail = customers.find((c) => c.id === customerId) ?? null;

//   if (!detail) {
//     return (
//       <div className="space-y-6 animate-fade-in">
//         <div className="flex items-center gap-3">
//           <button
//             type="button"
//             onClick={() => navigate("/customers")}
//             className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back
//           </button>
//           <div>
//             <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Customer</h2>
//             <p className="text-sm text-muted-foreground">Customer not found</p>
//           </div>
//         </div>
//         <div className="bg-card rounded-xl card-shadow p-6">
//           <p className="text-sm text-muted-foreground">This customer may have been deleted or the link is invalid.</p>
//         </div>
//       </div>
//     );
//   }

//   const name = buildDisplayName(detail);
//   const ledger = getLedger(workOrders, name);

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex items-center gap-3">
//         <button
//           type="button"
//           onClick={() => navigate("/customers")}
//           className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back
//         </button>
//         <div className="flex-1">
//           <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{name}</h2>
//           <p className="text-sm text-muted-foreground">{detail.id}</p>
//         </div>
//         <div className="flex items-center gap-2">
//           {/* Actions dropdown */}
//           <div className="relative">
//             <button
//               type="button"
//               onClick={() => setShowActions(v => !v)}
//               className="h-10 px-4 inline-flex items-center gap-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
//               style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
//             >
//               Actions
//               <ChevronDown className={`w-4 h-4 transition-transform ${showActions ? "rotate-180" : ""}`} />
//             </button>
//             {showActions && (
//               <>
//                 {/* Backdrop */}
//                 <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
//                 <div className="absolute right-0 top-12 z-20 w-56 bg-card border border-border rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
//                   <button
//                     type="button"
//                     onClick={() => { setShowActions(false); navigate("/leads/new", { state: { prefillCustomer: { name, phone: detail.mobile || detail.landline || "", address: detail.siteAddress || detail.billingAddress || "" } } }); }}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
//                   >
//                     <ClipboardList className="w-4 h-4 text-muted-foreground" />
//                     Add Leads
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => { setShowActions(false); navigate("/create-work-order", { state: { prefillCustomer: { id: detail.id, name, phone: detail.mobile || detail.landline || "", email: detail.emailAddress || "", address: detail.siteAddress || detail.billingAddress || "", siteAddress: detail.siteAddress || "", billingAddress: detail.billingAddress || "" } } }); }}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
//                   >
//                     <FileText className="w-4 h-4 text-muted-foreground" />
//                     Convert to Quotation
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => { setShowActions(false); navigate("/create-work-order", { state: { prefillCustomer: { id: detail.id, name, phone: detail.mobile || detail.landline || "", email: detail.emailAddress || "", address: detail.siteAddress || detail.billingAddress || "", siteAddress: detail.siteAddress || "", billingAddress: detail.billingAddress || "" } } }); }}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
//                   >
//                     <FolderKanban className="w-4 h-4 text-muted-foreground" />
//                     Convert to Work Order
//                   </button>
//                   <div className="h-px bg-border mx-2 my-1" />
//                   <button
//                     type="button"
//                     onClick={() => { setShowActions(false); setShowEdit(true); }}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
//                   >
//                     <Edit2 className="w-4 h-4 text-muted-foreground" />
//                     Edit Customer
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => { setShowActions(false); deleteCustomer(detail.id); navigate("/customers"); }}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                     Delete Customer
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="bg-card rounded-xl p-8 card-shadow border border-border">
//         {/* Header Section */}
//         <div className="mb-8 pb-8 border-b border-border">
//           <div className="flex items-center gap-6">
//             <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
//               <span className="text-4xl font-bold text-primary">{name[0]}</span>
//             </div>
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-card-foreground">{name}</h1>
//               <p className="text-lg text-muted-foreground mt-1">
//                 {detail.customerType}
//                 {detail.customerLanguage && (
//                   <span className="ml-2 text-sm font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
//                     {detail.customerLanguage}
//                   </span>
//                 )}
//               </p>
//               <p className="text-sm text-muted-foreground mt-2">{detail.id}</p>
//             </div>
//           </div>
//         </div>

//         {/* All Information in Unified Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile</p>
//             <p className="text-lg font-bold text-card-foreground">{detail.mobile || "—"}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Landline</p>
//             <p className="text-lg font-bold text-card-foreground">{detail.landline || "—"}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
//             <p className="text-lg font-bold text-card-foreground">{detail.emailAddress || "—"}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GST Number</p>
//             <p className="text-lg font-bold text-card-foreground">{detail.gstNumber || "—"}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PAN Card Number</p>
//             <p className="text-lg font-bold text-card-foreground">{detail.panCardNumber || "—"}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Place of Supply</p>
//             <p className="text-lg font-bold text-card-foreground">{detail.placeOfSupply || "—"}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Terms</p>
//             <p className="text-lg font-bold text-card-foreground">{detail.paymentTerms || "—"}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Billed</p>
//             <p className="text-lg font-bold text-primary">{formatRupee(ledger.total)}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid</p>
//             <p className="text-lg font-bold text-success">{formatRupee(ledger.paid)}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
//             <p className={`text-lg font-bold ${ledger.balance <= 0 ? "text-success" : "text-destructive"}`}>{formatRupee(ledger.balance)}</p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Orders</p>
//             <p className="text-lg font-bold text-card-foreground">{ledger.projects}</p>
//           </div>
//         </div>

//         {/* Addresses */}
//         <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing Address</p>
//             <p className="text-sm font-semibold text-card-foreground">{detail.billingAddress || "—"}</p>
//           </div>
//           {/* Primary site address */}
//           <div className="space-y-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Address 1</p>
//             <p className="text-sm font-semibold text-card-foreground">
//               {detail.siteAddressFields ? [
//                 detail.siteAddressFields.street1,
//                 detail.siteAddressFields.street2,
//                 detail.siteAddressFields.city,
//                 detail.siteAddressFields.state,
//                 detail.siteAddressFields.pinCode,
//               ].filter(Boolean).join(", ") || detail.siteAddress || "—" : detail.siteAddress || "—"}
//             </p>
//           </div>
//           {/* Additional site addresses */}
//           {detail.additionalSiteAddressFields?.map((addr, idx) => (
//             <div key={idx} className="space-y-2">
//               <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Address {idx + 2}</p>
//               <p className="text-sm font-semibold text-card-foreground">
//                 {[addr.street1, addr.street2, addr.city, addr.state, addr.pinCode].filter(Boolean).join(", ") || "—"}
//               </p>
//             </div>
//           ))}
//           {(detail.companyDocumentFiles?.length || detail.companyDocuments?.length || detail.companyDocument) && (
//             <div className="space-y-2">
//               <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Documents</p>
//               <div className="space-y-2">
//                 {(detail.companyDocumentFiles?.length
//                   ? detail.companyDocumentFiles
//                   : detail.companyDocuments?.length
//                   ? detail.companyDocuments.map(name => ({ name, dataUrl: undefined }))
//                   : detail.companyDocument
//                   ? [{ name: detail.companyDocument, dataUrl: undefined }]
//                   : []
//                 ).map((doc, idx) => (
//                   <div key={idx} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-secondary border border-border">
//                     <div className="flex items-center gap-2 min-w-0">
//                       <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
//                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
//                       </svg>
//                       <span className="text-sm font-medium text-card-foreground truncate max-w-[200px]">{doc.name}</span>
//                     </div>
//                     {doc.dataUrl && (
//                       <div className="flex items-center gap-1.5 flex-shrink-0">
//                         <button
//                           type="button"
//                           onClick={() => {
//                             // Convert base64 data URL to Blob URL for reliable browser viewing
//                             const [header, base64] = doc.dataUrl!.split(",");
//                             const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
//                             const binary = atob(base64);
//                             const bytes = new Uint8Array(binary.length);
//                             for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
//                             const blob = new Blob([bytes], { type: mime });
//                             const blobUrl = URL.createObjectURL(blob);
//                             window.open(blobUrl, "_blank");
//                             // Revoke after a short delay to allow the tab to load
//                             setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
//                           }}
//                           className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
//                           title="View document"
//                         >
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
//                           View
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             const [header, base64] = doc.dataUrl!.split(",");
//                             const mime = header.match(/:(.*?);/)?.[1] || "application/pdf";
//                             const binary = atob(base64);
//                             const bytes = new Uint8Array(binary.length);
//                             for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
//                             const blob = new Blob([bytes], { type: mime });
//                             const blobUrl = URL.createObjectURL(blob);
//                             const a = document.createElement("a");
//                             a.href = blobUrl;
//                             a.download = doc.name;
//                             a.click();
//                             setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
//                           }}
//                           className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors"
//                           title="Download document"
//                         >
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
//                           Download
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//           {detail.contactPersonsDetails && detail.contactPersonsDetails.length > 0 && (
//             <div className="space-y-2 md:col-span-2">
//               <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Persons</p>
//               <div className="space-y-2">
//                 {detail.contactPersonsDetails.map((contact, index) => (
//                   <div key={index} className="text-sm font-semibold text-card-foreground">
//                     <p className="font-bold">{contact.name}</p>
//                     {contact.phone && <p className="text-xs text-muted-foreground">Phone: {contact.phone}</p>}
//                     {contact.email && <p className="text-xs text-muted-foreground">Email: {contact.email}</p>}
//                     {(contact as any).designation && <p className="text-xs text-muted-foreground">Designation: {(contact as any).designation}</p>}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//       </div>

//       {/* Tabbed Work Orders / Payment History */}
//       <div className="bg-card rounded-xl card-shadow border border-border">
//           <div className="flex border-b border-border">
//             <button
//               onClick={() => setActiveTab("workorders")}
//               className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "workorders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
//             >
//               <Briefcase className="w-4 h-4" />
//               Assigned Work Orders ({getCustomerWorkOrders(workOrders, name).length})
//             </button>
//             <button
//               onClick={() => setActiveTab("payments")}
//               className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "payments" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
//             >
//               Payment History
//             </button>
//           </div>

//           <div className="p-6">
//             {activeTab === "workorders" && (
//               <div className="space-y-3">
//                 {getCustomerWorkOrders(workOrders, name).length === 0 ? (
//                   <div className="text-center py-10">
//                     <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
//                     <p className="text-sm text-muted-foreground">No work orders assigned to this customer yet.</p>
//                   </div>
//                 ) : getCustomerWorkOrders(workOrders, name).map((wo) => (
//                   <button
//                     key={wo.id}
//                     onClick={() => navigate(`/work-order/${wo.id}`)}
//                     className="w-full p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 hover:border-primary/30 transition-all text-left"
//                   >
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex-1">
//                         <p className="font-semibold text-card-foreground">{wo.id}</p>
//                         <p className="text-sm text-muted-foreground">{wo.serviceType}</p>
//                       </div>
//                       <StatusBadge label={wo.status} variant={wo.status === "Completed" ? "neutral" : "warning"} />
//                     </div>
//                     <div className="flex items-center justify-between text-xs">
//                       <span className="text-muted-foreground">{wo.address}</span>
//                       <span className="font-semibold text-primary">{wo.totalValue}</span>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}

//             {activeTab === "payments" && (
//               <div className="overflow-x-auto">
//                 {getCustomerWorkOrders(workOrders, name).length === 0 ? (
//                   <div className="text-center py-10">
//                     <p className="text-sm text-muted-foreground">No payment history available for this customer yet.</p>
//                   </div>
//                 ) : (
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b border-border">
//                         {["Work Order", "Service", "Total", "Paid", "Balance", "Status"].map((h) => (
//                           <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getCustomerWorkOrders(workOrders, name).map((wo) => {
//                         const total = parseRupee(wo.totalValue);
//                         const paid = parseRupee(wo.paidAmount);
//                         const bal = total - paid;
//                         return (
//                           <tr key={wo.id} onClick={() => navigate("/payments", { state: { workOrderId: wo.id } })} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
//                             <td className="px-3 py-3 font-medium text-card-foreground text-xs">{wo.id}</td>
//                             <td className="px-3 py-3 text-muted-foreground text-xs">{wo.serviceType}</td>
//                             <td className="px-3 py-3 text-muted-foreground text-xs">{formatRupee(total)}</td>
//                             <td className="px-3 py-3 text-success text-xs font-semibold">{formatRupee(paid)}</td>
//                             <td className="px-3 py-3 text-xs font-semibold">
//                               <span className={bal <= 0 ? "text-success" : "text-destructive"}>{formatRupee(bal)}</span>
//                             </td>
//                             <td className="px-3 py-3">
//                               <StatusBadge label={wo.status} variant={wo.status === "Completed" ? "neutral" : "warning"} />
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//       <CustomerFormModal
//         open={showEdit}
//         mode="edit"
//         customer={detail}
//         onClose={() => setShowEdit(false)}
//       />
//     </div>
//   );
// };

export default CustomersPage;
