import { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useServicesStore } from "@/store/servicesStore";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceFormModal } from "@/components/ServiceFormModal";
import { ServiceDetailsModal } from "@/components/ServiceDetailsModal";
import type { ServiceAppointment } from "@/store/servicesStore";

const statusMap = { Scheduled: "info", Unscheduled: "neutral", Completed: "success", Cancelled: "error" } as const;

const ServiceManagementPage = () => {
  const { appointments, updateAppointment } = useServicesStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "Unscheduled" | "Completed" | "Cancelled">("All");
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceAppointment | null>(null);

  const filtered = appointments.filter((apt) => {
    const matchStatus = statusFilter === "All" || apt.status === statusFilter;
    const matchSearch = 
      apt.subject?.toLowerCase().includes(search.toLowerCase()) ||
      apt.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      apt.refNo?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === "Scheduled").length,
    completed: appointments.filter(a => a.status === "Completed").length,
    cancelled: appointments.filter(a => a.status === "Cancelled").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Service Management</h2>
          <p className="text-sm text-muted-foreground">Manage service appointments and tasks</p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Total Services</p>
          <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Scheduled</p>
          <p className="text-2xl font-bold text-primary">{stats.scheduled}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Completed</p>
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Cancelled</p>
          <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search services..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" 
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "Scheduled", "Unscheduled", "Completed", "Cancelled"] as const).map((status) => {
            const count = status === "All" ? appointments.length : appointments.filter(a => a.status === status).length;
            return (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === status 
                    ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" 
                    : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                }`}
                style={statusFilter === status ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Ref No", "Subject", "Active/Inactive", "Warranty", "Tasks", "Action"].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt) => (
                <tr
                  key={apt.id}
                  onClick={() => { setSelectedService(apt); setShowDetailsModal(true); }}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-2.5 font-semibold text-primary text-xs">{apt.refNo || "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-card-foreground text-xs">{apt.subject || "—"}</p>
                      <p className="text-xs text-muted-foreground">{apt.serviceDescription || "—"}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = apt.status === "Completed" ? "Scheduled" : "Completed";
                        updateAppointment(apt.id, { status: next });
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${apt.status === "Completed" ? "bg-green-500" : "bg-muted"}`}
                      title={apt.status}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${apt.status === "Completed" ? "translate-x-4" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-card-foreground">{apt.warrantyPeriod || "—"}</td>
                  <td className="px-3 py-2.5 text-xs">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                      {apt.tasks?.length || 0}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 transition-colors"
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); toast.error("Delete functionality coming soon"); }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Form Modal */}
      <ServiceFormModal open={showForm} onClose={() => setShowForm(false)} />

      {/* Service Details Modal */}
      <ServiceDetailsModal 
        open={showDetailsModal} 
        service={selectedService || undefined}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedService(null);
        }}
      />
    </div>
  );
};

export default ServiceManagementPage;
