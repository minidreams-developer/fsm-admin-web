import { Search, Plus, Edit2, UserCheck, Clock, UserX, Users } from "lucide-react";
import { useState } from "react";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { PaginationControls } from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { useCustomersStore, type Customer } from "@/store/customersStore";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { useNavigate } from "react-router-dom";
import { LeadSummaryCard } from "@/components/card/LeadSummaryCard";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import {  buildDisplayName,  formatRupee,  getLedger} from "@/utils/customerUtils";

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

  const getCustomerStatus = (customer: Customer) => {
    const ledger = getLedger(workOrders, buildDisplayName(customer));
    if (ledger.projects === 0) return "Inactive";

    const isCleared =
      clearedOverrides[customer.id] !== undefined
        ? clearedOverrides[customer.id]
        : ledger.balance <= 0;

    return isCleared ? "Active" : "Pending";
  };

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
    value: customers.filter((c) => getCustomerStatus(c) === "Active").length,
    icon: UserCheck,
    color: "success" as const,
  },
  {
    title: "Pending",
    value: customers.filter((c) => getCustomerStatus(c) === "Pending").length,
    icon: Clock,
    color: "warning" as const,
  },
  {
    title: "Inactive",
    value: customers.filter((c) => getCustomerStatus(c) === "Inactive").length,
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

export default CustomersPage;
