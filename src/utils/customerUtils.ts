import { Customer } from "@/store/customersStore";
import { WorkOrder } from "@/store/projectsStore";

export function buildDisplayName(c: Customer) {
  return `${c.firstName} ${c.lastName}`.trim().replace(/\s+/g, " ");
}

export function parseRupee(value: string) {
  const n = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function formatRupee(value: number) {
  return `₹ ${Math.max(0, Math.round(value)).toLocaleString()}`;
}

export function getCustomerWorkOrders(
  workOrders: WorkOrder[],
  customerName: string
) {
  return workOrders.filter(
    (wo) =>
      wo.customer.trim().toLowerCase() ===
      customerName.trim().toLowerCase()
  );
}

export function getLedger(
  workOrders: WorkOrder[],
  customerName: string
) {
  const items = getCustomerWorkOrders(workOrders, customerName);

  const total = items.reduce(
    (acc, wo) => acc + parseRupee(wo.totalValue),
    0
  );

  const paid = items.reduce(
    (acc, wo) => acc + parseRupee(wo.paidAmount),
    0
  );

  return {
    projects: items.length,
    total,
    paid,
    balance: total - paid,
  };
}