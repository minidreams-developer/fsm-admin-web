import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Download, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useServicesStore } from "@/store/servicesStore";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceFormModal } from "@/components/ServiceFormModal";
import { PaginationControls } from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { useEmployeesStore } from "@/store/employeesStore";
import { useBranchesStore } from "@/store/branchesStore";
import type { ServiceAppointment } from "@/store/servicesStore";
import * as XLSX from 'xlsx';
import { DataTable } from "@/components/table/Datatable";

const statusMap = { Scheduled: "info", Unscheduled: "neutral", Completed: "success", Cancelled: "error" } as const;

const ServiceManagementPage = () => {
  const navigate = useNavigate();
  const { appointments, updateAppointment } = useServicesStore();
  const { employees } = useEmployeesStore();
  const { branches: branchList } = useBranchesStore();
  const activeEmployees = employees.filter(e => e.isActive !== false);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceAppointment | null>(null);

  const filtered = appointments.filter((apt) => {
    const matchStatus = statusFilter === "All" || (statusFilter === "Active" ? apt.status === "Completed" : apt.status !== "Completed");
    const matchSearch = 
      apt.subject?.toLowerCase().includes(search.toLowerCase()) ||
      apt.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      apt.refNo?.toLowerCase().includes(search.toLowerCase());
    const matchEmployee = employeeFilter === "All" || apt.employeeName === employeeFilter;
    const matchBranch = branchFilter === "All" || apt.state === branchFilter;
    
    // Date filter logic
    let matchDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const aptDate = new Date(apt.date);
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        matchDate = matchDate && aptDate >= startDate;
      }
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchDate = matchDate && aptDate <= endDate;
      }
    }
    
    return matchStatus && matchSearch && matchEmployee && matchBranch && matchDate;
  });

  const pagination = usePagination({
    items: filtered,
    itemsPerPage: 10,
  });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === "Scheduled").length,
    completed: appointments.filter(a => a.status === "Completed").length,
    cancelled: appointments.filter(a => a.status === "Cancelled").length,
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filtered.map((apt) => ({
        'Reference No': apt.refNo || '—',
        'Subject': apt.subject || '—',
        'Service Description': apt.serviceDescription || '—',
        'Work Order ID': apt.workOrderId,
        'Employee': apt.employeeName,
        'Date': apt.date,
        'Time': apt.time,
        'In Time': apt.inTime || '—',
        'Out Time': apt.outTime || '—',
        'Status': apt.status,
        'Warranty Period': apt.warrantyPeriod || '—',
        'Sales Executive': apt.salesExecutive || '—',
        'State': apt.state || '—',
        'Unit Price': apt.unitPrice || '—',
        'GST': apt.gst || '—',
        'IGST': apt.igst || '—',
        'CGST': apt.cgst || '—',
        'Technicians': apt.technicians?.join(', ') || '—',
        'Instructions': apt.instructions || '—',
        'Payment Mode': apt.payment?.mode || '—',
        'Payment Amount': apt.payment?.amount || '—',
        'Regular Billing': apt.payment?.regularBilling ? 'Yes' : 'No',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Reference No
        { wch: 30 }, // Subject
        { wch: 40 }, // Service Description
        { wch: 15 }, // Work Order ID
        { wch: 20 }, // Employee
        { wch: 12 }, // Date
        { wch: 10 }, // Time
        { wch: 10 }, // In Time
        { wch: 10 }, // Out Time
        { wch: 15 }, // Status
        { wch: 15 }, // Warranty Period
        { wch: 20 }, // Sales Executive
        { wch: 15 }, // State
        { wch: 12 }, // Unit Price
        { wch: 10 }, // GST
        { wch: 10 }, // IGST
        { wch: 10 }, // CGST
        { wch: 25 }, // Technicians
        { wch: 40 }, // Instructions
        { wch: 15 }, // Payment Mode
        { wch: 15 }, // Payment Amount
        { wch: 15 }, // Regular Billing
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Service Appointments');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `Service_Appointments_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast.success(`Exported ${filtered.length} service appointment${filtered.length !== 1 ? 's' : ''} to Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const serviceTableData = pagination.paginatedItems.map((apt, index) => ({
  ...apt,
  serialNumber: pagination.startIndex + index + 1,
}));

const serviceColumns = [
  {
    key: "serialNumber",
    header: "#",
    render: (apt: any) => (
      <span className="text-xs text-muted-foreground font-medium">
        {apt.serialNumber}
      </span>
    ),
  },
  {
    key: "subject",
    header: "Subject",
    render: (apt: any) => (
      <div className="space-y-0.5">
        <p className="font-semibold text-card-foreground text-xs">
          {apt.subject || "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          {apt.serviceDescription || "—"}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Active/Inactive",
    render: (apt: any) => (
      <button
        onClick={(e) => {
          e.stopPropagation();

          const next =
            apt.status === "Completed"
              ? "Scheduled"
              : "Completed";

          updateAppointment(apt.id, { status: next });
        }}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          apt.status === "Completed"
            ? "bg-green-500"
            : "bg-muted"
        }`}
        title={apt.status}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            apt.status === "Completed"
              ? "translate-x-4"
              : "translate-x-1"
          }`}
        />
      </button>
    ),
  },
  {
    key: "actions",
    header: "Action",
    render: (apt: any) => (
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setEditingService(apt);
            setShowForm(true);
          }}
          className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() =>
            toast.error("Delete functionality coming soon")
          }
          className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    ),
  },
];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Service list</h2>
          <p className="text-sm text-muted-foreground">Manage service appointments and tasks</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* <button 
            onClick={handleExportToExcel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button> */}
          <button 
            onClick={() => setShowForm(true)} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]" 
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            <Plus className="w-4 h-4" /> 
            Add Service
          </button>
        </div>
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
  <div className="space-y-3">
  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
    
    <select
      value={branchFilter}
      onChange={(e) => setBranchFilter(e.target.value)}
      className="w-full sm:w-auto px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="All">All Branches</option>
      {branchList.filter(b => b.status === "Active").map(b => (
        <option key={b.id} value={b.name}>{b.name}</option>
      ))}
    </select>

    <select
      value={employeeFilter}
      onChange={(e) => setEmployeeFilter(e.target.value)}
      className="w-full sm:w-auto px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="All">All Employees</option>
      {activeEmployees.map(emp => (
        <option key={emp.id} value={emp.name}>
          {emp.name} — {emp.role}
        </option>
      ))}
    </select>

    {/* Start Date */}
    <div className="w-full sm:w-auto">
      <label className="mb-1 block text-xs font-medium text-muted-foreground sm:hidden">
        Start Date
      </label>
      <input
        type="date"
        value={dateFilter.startDate}
        onChange={(e) =>
          setDateFilter(prev => ({
            ...prev,
            startDate: e.target.value,
          }))
        }
        className="w-full sm:w-auto px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>

    {/* End Date */}
    <div className="w-full sm:w-auto">
      <label className="mb-1 block text-xs font-medium text-muted-foreground sm:hidden">
        End Date
      </label>
      <input
        type="date"
        value={dateFilter.endDate}
        onChange={(e) =>
          setDateFilter(prev => ({
            ...prev,
            endDate: e.target.value,
          }))
        }
        className="w-full sm:w-auto px-3 py-2 rounded-lg bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>

    {(dateFilter.startDate || dateFilter.endDate) && (
      <button
        onClick={() =>
          setDateFilter({
            startDate: "",
            endDate: "",
          })
        }
        className="w-full sm:w-auto px-3 py-2 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
      >
        Clear Dates
      </button>
    )}

    <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search services..."
        className="w-full h-10 pl-9 pr-4 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  </div>

  {/* Status Filter */}
  <div className="flex flex-wrap gap-2">
    {(["All", "Active", "Inactive"] as const).map((status) => {
      const count =
        status === "All"
          ? appointments.length
          : status === "Active"
          ? appointments.filter(a => a.status === "Completed").length
          : appointments.filter(a => a.status !== "Completed").length;

      return (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            statusFilter === status
              ? "text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
              : "bg-card text-muted-foreground border border-border hover:bg-secondary"
          }`}
          style={
            statusFilter === status
              ? {
                  background:
                    "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)",
                }
              : {}
          }
        >
          {status} ({count})
        </button>
      );
    })}
  </div>
</div>

      {/* Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
  <DataTable
    columns={serviceColumns}
    data={serviceTableData}
    getRowKey={(apt) => apt.id}
    onRowClick={(apt) => navigate(`/service/${apt.id}`)}
    emptyMessage="No services found."
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

      {/* Service Form Modal */}
      <ServiceFormModal
        open={showForm}
        mode={editingService ? "edit" : "create"}
        appointment={editingService || undefined}
        onClose={() => { setShowForm(false); setEditingService(null); }}
      />
    </div>
  );
};

export default ServiceManagementPage;
