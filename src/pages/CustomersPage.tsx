import { Search, Eye, Plus, Edit2, Trash2, ArrowLeft, Users, Briefcase } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { useCustomersStore, type Customer } from "@/store/customersStore";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { useNavigate, useParams } from "react-router-dom";

function buildDisplayName(c: Customer) {
  return `${c.firstName} ${c.lastName}`.trim().replace(/\s+/g, " ");
}

function parseRupee(value: string) {
  const n = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatRupee(value: number) {
  return `₹ ${Math.max(0, Math.round(value)).toLocaleString()}`;
}

function getCustomerWorkOrders(workOrders: WorkOrder[], customerName: string) {
  return workOrders.filter((wo) => wo.customer.trim().toLowerCase() === customerName.trim().toLowerCase());
}

function getLedger(workOrders: WorkOrder[], customerName: string) {
  const items = getCustomerWorkOrders(workOrders, customerName);
  const total = items.reduce((acc, wo) => acc + parseRupee(wo.totalValue), 0);
  const paid = items.reduce((acc, wo) => acc + parseRupee(wo.paidAmount), 0);
  return { projects: items.length, total, paid, balance: total - paid };
}

const CustomersPage = () => {
  const navigate = useNavigate();
  const { customers } = useCustomersStore();
  const { workOrders } = useProjectsStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [clearedOverrides, setClearedOverrides] = useState<Record<string, boolean>>({});

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-card-foreground">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Active Customers</p>
              <p className="text-2xl font-bold text-card-foreground">
                {customers.filter((c) => c.customerType === "Commercial" || c.customerType === "Residential").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Inactive Customers</p>
              <p className="text-2xl font-bold text-card-foreground">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Customer", "Phone", "Work Orders", "Total", "Active/Inactive", "Action"].map((h) => (
                <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const name = buildDisplayName(c);
              const ledger = getLedger(workOrders, name);
              const balance = ledger.balance;
              const isCleared = clearedOverrides[c.id] !== undefined ? clearedOverrides[c.id] : balance <= 0;
              return (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-secondary/30"
                >
                  <td className="px-3 py-3 font-medium text-card-foreground text-xs">{name}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{c.mobile}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{ledger.projects}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{formatRupee(ledger.total)}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setClearedOverrides((prev) => ({ ...prev, [c.id]: !isCleared })); }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isCleared ? "bg-green-500" : "bg-muted"}`}
                      title={isCleared ? "Cleared" : formatRupee(balance)}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isCleared ? "translate-x-4" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditCustomer(c); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CustomerFormModal
        open={showAdd}
        mode="create"
        onClose={() => setShowAdd(false)}
        onSaved={(c) => navigate(`/customers/${c.id}`)}
      />
      <CustomerFormModal
        open={!!editCustomer}
        mode="edit"
        customer={editCustomer ?? undefined}
        onClose={() => setEditCustomer(null)}
      />
    </div>
  );
};

export const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const customerId = params.id ?? "";
  const { customers, deleteCustomer } = useCustomersStore();
  const { workOrders } = useProjectsStore();
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"workorders" | "payments">("workorders");

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
  const ledger = getLedger(workOrders, name);

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
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => { deleteCustomer(detail.id); navigate("/customers"); }}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-card hover:bg-destructive/10 transition-colors text-sm font-semibold text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
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
              <p className="text-lg text-muted-foreground mt-1">{detail.customerType}</p>
              <p className="text-sm text-muted-foreground mt-2">{detail.id}</p>
            </div>
          </div>
        </div>

        {/* All Information in Unified Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile</p>
            <p className="text-lg font-bold text-card-foreground">{detail.mobile || "—"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Landline</p>
            <p className="text-lg font-bold text-card-foreground">{detail.landline || "—"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
            <p className="text-lg font-bold text-card-foreground">{detail.emailAddress || "—"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GST Number</p>
            <p className="text-lg font-bold text-card-foreground">{detail.gstNumber || "—"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Place of Supply</p>
            <p className="text-lg font-bold text-card-foreground">{detail.placeOfSupply || "—"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Terms</p>
            <p className="text-lg font-bold text-card-foreground">{detail.paymentTerms || "—"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Billed</p>
            <p className="text-lg font-bold text-primary">{formatRupee(ledger.total)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid</p>
            <p className="text-lg font-bold text-success">{formatRupee(ledger.paid)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
            <p className={`text-lg font-bold ${ledger.balance <= 0 ? "text-success" : "text-destructive"}`}>{formatRupee(ledger.balance)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Orders</p>
            <p className="text-lg font-bold text-card-foreground">{ledger.projects}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Address</p>
            <p className="text-sm font-semibold text-card-foreground">{detail.siteAddress || "—"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing Address</p>
            <p className="text-sm font-semibold text-card-foreground">{detail.billingAddress || "—"}</p>
          </div>
          {detail.contactPersonsDetails && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Persons</p>
              <p className="text-sm font-semibold text-card-foreground">{detail.contactPersonsDetails}</p>
            </div>
          )}
        </div>

      </div>

      {/* Tabbed Work Orders / Payment History */}
      {getCustomerWorkOrders(workOrders, name).length > 0 && (
        <div className="bg-card rounded-xl card-shadow border border-border">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("workorders")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === "workorders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Briefcase className="w-4 h-4" />
              Assigned Work Orders ({getCustomerWorkOrders(workOrders, name).length})
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
                {getCustomerWorkOrders(workOrders, name).map((wo) => (
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
                      <StatusBadge label={wo.status} variant={wo.status === "Completed" ? "neutral" : wo.status === "Scheduled" ? "success" : "warning"} />
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Work Order", "Service", "Total", "Paid", "Balance", "Status"].map((h) => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getCustomerWorkOrders(workOrders, name).map((wo) => {
                      const total = parseRupee(wo.totalValue);
                      const paid = parseRupee(wo.paidAmount);
                      const bal = total - paid;
                      return (
                        <tr key={wo.id} onClick={() => navigate("/payments", { state: { workOrderId: wo.id } })} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                          <td className="px-3 py-3 font-medium text-card-foreground text-xs">{wo.id}</td>
                          <td className="px-3 py-3 text-muted-foreground text-xs">{wo.serviceType}</td>
                          <td className="px-3 py-3 text-muted-foreground text-xs">{formatRupee(total)}</td>
                          <td className="px-3 py-3 text-success text-xs font-semibold">{formatRupee(paid)}</td>
                          <td className="px-3 py-3 text-xs font-semibold">
                            <span className={bal <= 0 ? "text-success" : "text-destructive"}>{formatRupee(bal)}</span>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge label={wo.status} variant={wo.status === "Completed" ? "neutral" : wo.status === "Scheduled" ? "success" : "warning"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <CustomerFormModal
        open={showEdit}
        mode="edit"
        customer={detail}
        onClose={() => setShowEdit(false)}
      />
    </div>
  );
};

export default CustomersPage;
