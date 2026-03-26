import { Search, ChevronRight, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
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

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Customer", "Phone", "Projects", "Total", "Balance", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.mobile}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{ledger.projects}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatRupee(ledger.total)}</td>
                    <td className="px-5 py-3.5">
                      {balance <= 0 ? (
                        <StatusBadge label="Cleared" variant="success" />
                      ) : (
                        <span className="font-semibold text-destructive">{formatRupee(balance)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerFormModal
        open={showAdd}
        mode="create"
        onClose={() => setShowAdd(false)}
        onSaved={(c) => navigate(`/customers/${c.id}`)}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground">{detail.id}</p>
          </div>
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
            onClick={() => {
              deleteCustomer(detail.id);
              navigate("/customers");
            }}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-card hover:bg-destructive/10 transition-colors text-sm font-semibold text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-6 card-shadow space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">{name[0]}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-card-foreground truncate">{name}</h3>
              <p className="text-sm text-muted-foreground truncate">{detail.mobile || "—"}</p>
              <p className="text-sm text-muted-foreground truncate">{detail.siteAddress || "—"}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Add Fields</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                ["Customer ID ( Automated Generated )", detail.id],
                ["Customer Type ( Residential / Commercial )", detail.customerType],
                ["First Name", detail.firstName],
                ["Last Name", detail.lastName],
                ["Email Address", detail.emailAddress || "—"],
                ["Landline", detail.landline || "—"],
                ["Mobile", detail.mobile || "—"],
                ["GST Number", detail.gstNumber || "—"],
                ["Place Of Supply", detail.placeOfSupply || "—"],
                ["Payment Terms", detail.paymentTerms || "—"],
                ["Billing Address", detail.billingAddress || "—"],
                ["Site Address", detail.siteAddress || "—"],
                ["Add Contact Persons Details", detail.contactPersonsDetails || "—"],
                ["Customer Documents", detail.customerDocuments.length ? `${detail.customerDocuments.length}` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/30 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">{k}</span>
                  <span className="text-sm font-semibold text-card-foreground text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 card-shadow space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Ledger</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Billed</span>
                <span className="font-semibold text-card-foreground">{formatRupee(ledger.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-semibold text-success">{formatRupee(ledger.paid)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="font-semibold text-card-foreground">Pending</span>
                <span className={`font-bold ${ledger.balance <= 0 ? "text-success" : "text-destructive"}`}>
                  {formatRupee(ledger.balance)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projects ({ledger.projects})</h4>
            <p className="text-sm text-muted-foreground">View all projects for this customer in the Projects tab.</p>
          </div>
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

export default CustomersPage;
