import { StatusBadge } from "@/components/StatusBadge";
import { Search, CheckCircle } from "lucide-react";
import { useState } from "react";

const digitalPayments = [
  { id: "TXN-90812", service: "#SV-1042", customer: "Praveen Kumar", tech: "Safeeq", amount: "₹ 850", upiRef: "GPay-408291038", status: "Pending" },
  { id: "TXN-90810", service: "#SV-1038", customer: "Suresh Nair", tech: "Rajesh", amount: "₹ 1,200", upiRef: "PhonePe-50192831", status: "Pending" },
  { id: "TXN-90808", service: "#SV-1035", customer: "Meena Devi", tech: "Arun", amount: "₹ 650", upiRef: "GPay-301928371", status: "Verified" },
];

const cashBalances = [
  { employee: "Safeeq", balance: "₹ 5,800", services: 8, lastSettlement: "Mar 3" },
  { employee: "Rajesh", balance: "₹ 2,100", services: 4, lastSettlement: "Mar 5" },
  { employee: "Arun", balance: "₹ 950", services: 2, lastSettlement: "Mar 6" },
];

const partialPayments = [
  { customer: "Ramesh Singh", service: "#SV-1043", total: "₹ 850", paid: "₹ 700", balance: "₹ 150", mode: "Cash" },
  { customer: "Fatima Begum", service: "#SV-1036", total: "₹ 1,200", paid: "₹ 800", balance: "₹ 400", mode: "UPI + Cash" },
];

const PaymentsPage = () => {
  const [tab, setTab] = useState<"digital" | "cash" | "partial">("digital");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Payment Reconciliation</h2>
        <p className="text-sm text-muted-foreground">Verify digital payments and settle cash balances</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["digital", "cash", "partial"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`} style={tab === t ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}>
            {t === "digital" ? "Verify Digital Payments" : t === "cash" ? "Cash Balance Settlement" : "Partial Payments"}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Ref ID or name..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {tab === "digital" && (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead><tr className="border-b border-border">
                {["Txn ID", "Service", "Customer", "Technician", "Amount", "UPI Ref ID", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {digitalPayments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-primary">{p.id}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.service}</td>
                    <td className="px-5 py-3.5 text-card-foreground">{p.customer}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.tech}</td>
                    <td className="px-5 py-3.5 font-semibold text-card-foreground">{p.amount}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{p.upiRef}</td>
                    <td className="px-5 py-3.5"><StatusBadge label={p.status} variant={p.status === "Verified" ? "success" : "warning"} /></td>
                    <td className="px-5 py-3.5">
                      {p.status === "Pending" && (
                        <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Verified
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "cash" && (
        <div className="space-y-4">
          {cashBalances.map((c) => (
            <div key={c.employee} className="bg-card rounded-xl p-5 card-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{c.employee[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{c.employee}</p>
                  <p className="text-xs text-muted-foreground">{c.services} services · Last settled: {c.lastSettlement}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold text-card-foreground">{c.balance}</p>
                  <p className="text-xs text-muted-foreground">Cash liability</p>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Settle Cash</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "partial" && (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead><tr className="border-b border-border">
                {["Customer", "Service", "Total", "Paid", "Balance", "Mode", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {partialPayments.map((p, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{p.customer}</td>
                    <td className="px-5 py-3.5 text-primary font-semibold">{p.service}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.total}</td>
                    <td className="px-5 py-3.5 text-success font-semibold">{p.paid}</td>
                    <td className="px-5 py-3.5 text-destructive font-semibold">{p.balance}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.mode}</td>
                    <td className="px-5 py-3.5"><button className="text-xs font-semibold text-primary hover:underline">Record Payment</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
