import { StatusBadge } from "@/components/StatusBadge";
import { FileText, Download, Eye, Search } from "lucide-react";
import { useState } from "react";

const reports = [
  { id: "RPT-301", service: "#SV-1040", customer: "Hotel Grand", tech: "Rajesh", date: "Mar 6", chemicals: "Cypermethrin 1L, Gel Bait x3", odometer: "12,450 km", signature: true, images: 4, status: "Complete" },
  { id: "RPT-300", service: "#SV-1039", customer: "Lakshmi Stores", tech: "Arun", date: "Mar 5", chemicals: "Bifenthrin 500ml", odometer: "8,320 km", signature: true, images: 2, status: "Complete" },
  { id: "RPT-299", service: "#SV-1038", customer: "Suresh Nair", tech: "Safeeq", date: "Mar 5", chemicals: "Rodent Blocks x5", odometer: "15,100 km", signature: false, images: 3, status: "Pending Signature" },
  { id: "RPT-298", service: "#SV-1035", customer: "Meena Devi", tech: "Arun", date: "Mar 4", chemicals: "Termiticide 2L", odometer: "8,280 km", signature: true, images: 6, status: "Complete" },
];

const ReportsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = reports.filter((r) => r.customer.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Service Reports</h2>
        <p className="text-sm text-muted-foreground">View and download service completion reports</p>
      </div>
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["Report ID", "Service", "Customer", "Tech", "Date", "Chemicals Used", "Odometer", "Images", "Signature", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-3 py-3 font-semibold text-primary text-xs">{r.id}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{r.service}</td>
                <td className="px-3 py-3 text-card-foreground text-xs">{r.customer}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{r.tech}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{r.date}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs truncate">{r.chemicals}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{r.odometer}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{r.images} photos</td>
                <td className="px-3 py-3">{r.signature ? <StatusBadge label="Signed" variant="success" /> : <StatusBadge label="Pending" variant="warning" />}</td>
                <td className="px-3 py-3"><StatusBadge label={r.status} variant={r.status === "Complete" ? "success" : "warning"} /></td>
                <td className="px-3 py-3 flex gap-1">
                  <button className="p-1 rounded-md hover:bg-secondary text-primary"><Eye className="w-4 h-4" /></button>
                  <button className="p-1 rounded-md hover:bg-secondary text-primary"><Download className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
