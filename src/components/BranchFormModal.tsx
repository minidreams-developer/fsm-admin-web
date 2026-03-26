import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useBranchesStore, type Branch } from "@/store/branchesStore";
import { useEmployeesStore } from "@/store/employeesStore";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  branch?: Branch;
  onClose: () => void;
  onSaved?: (branch: Branch) => void;
};

const LABELS = {
  title: "Branch Information",
  branchId: "Branch ID (Auto Generated)",
  name: "Branch Name",
  type: "Branch Type",
  address: "Address",
  city: "City",
  state: "State",
  postalCode: "Postal Code",
  contactNumber: "Contact Number",
  email: "Email Address",
  manager: "Manager",
  operatingHoursFrom: "Operating Hours From",
  operatingHoursTo: "Operating Hours To",
  establishedDate: "Established Date",
  status: "Status",
  notes: "Notes",
} as const;

export function BranchFormModal({ open, mode, branch, onClose, onSaved }: Props) {
  const { addBranch, updateBranch, getNextBranchId } = useBranchesStore();
  const { employees } = useEmployeesStore();

  const [form, setForm] = useState<Branch>({
    id: getNextBranchId(),
    name: "",
    type: "Main Office",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    contactNumber: "",
    email: "",
    managerId: "",
    managerName: "",
    operatingHoursFrom: "09:00 AM",
    operatingHoursTo: "06:00 PM",
    establishedDate: "",
    status: "Active",
    notes: "",
    createdAt: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && branch) {
      setForm(branch);
      return;
    }
    const nextId = getNextBranchId();
    setForm({
      id: nextId,
      name: "",
      type: "Main Office",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      contactNumber: "",
      email: "",
      managerId: "",
      managerName: "",
      operatingHoursFrom: "09:00 AM",
      operatingHoursTo: "06:00 PM",
      establishedDate: "",
      status: "Active",
      notes: "",
      createdAt: new Date().toISOString().split("T")[0],
    });
  }, [open, mode, branch, getNextBranchId]);

  const setField = <K extends keyof Branch>(key: K, value: Branch[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleManagerChange = (managerId: string) => {
    const manager = employees.find((e) => e.id === managerId);
    setField("managerId", managerId);
    if (manager) {
      setField("managerName", manager.name);
    }
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error(`${LABELS.name} is required`);
      return;
    }
    if (!form.address.trim()) {
      toast.error(`${LABELS.address} is required`);
      return;
    }
    if (!form.contactNumber.trim()) {
      toast.error(`${LABELS.contactNumber} is required`);
      return;
    }

    const normalized: Branch = {
      ...form,
      name: form.name.trim(),
      address: form.address.trim(),
      contactNumber: form.contactNumber.trim(),
    };

    if (mode === "edit") {
      updateBranch(normalized.id, normalized);
      toast.success(`Branch updated: ${normalized.name}`);
      onSaved?.(normalized);
      onClose();
      return;
    }

    addBranch(normalized);
    toast.success(`Branch added: ${normalized.name}`);
    onSaved?.(normalized);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-black/75 rounded-[20px]">
      <div className="bg-card rounded-[20px] shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">{LABELS.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "create" ? "Add a new branch to your organization" : "Update branch information"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.branchId}</label>
              <input
                value={form.id}
                readOnly
                className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-card-foreground focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.name}</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Enter branch name"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.type}</label>
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value as Branch["type"])}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Main Office">Main Office</option>
                <option value="Service Center">Service Center</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Regional Office">Regional Office</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.status}</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as "Active" | "Inactive")}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.address}</label>
              <input
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Enter street address"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.city}</label>
              <input
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="Enter city"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.state}</label>
              <input
                value={form.state}
                onChange={(e) => setField("state", e.target.value)}
                placeholder="Enter state"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.postalCode}</label>
              <input
                value={form.postalCode}
                onChange={(e) => setField("postalCode", e.target.value)}
                placeholder="Enter postal code"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.contactNumber}</label>
              <input
                value={form.contactNumber}
                onChange={(e) => setField("contactNumber", e.target.value)}
                placeholder="Enter contact number"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.email}</label>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Enter email"
                type="email"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.manager}</label>
              <select
                value={form.managerId}
                onChange={(e) => handleManagerChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a manager</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.operatingHoursFrom}</label>
              <input
                value={form.operatingHoursFrom}
                onChange={(e) => setField("operatingHoursFrom", e.target.value)}
                type="time"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.operatingHoursTo}</label>
              <input
                value={form.operatingHoursTo}
                onChange={(e) => setField("operatingHoursTo", e.target.value)}
                type="time"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.establishedDate}</label>
              <input
                value={form.establishedDate}
                onChange={(e) => setField("establishedDate", e.target.value)}
                type="date"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.notes}</label>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Enter any additional notes"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 h-10 text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all rounded-lg"
            style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
          >
            {mode === "create" ? "Add Branch" : "Update Branch"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
