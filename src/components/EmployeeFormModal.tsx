import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Camera } from "lucide-react";
import { toast } from "sonner";
import { useEmployeesStore, type Employee } from "@/store/employeesStore";
import { useRolesStore } from "@/store/rolesStore";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  employee?: Employee;
  onClose: () => void;
  onSaved?: (employee: Employee) => void;
};

const LABELS = {
  title: "Employee Add Fields",
  employeeId: "Employee ID (Auto Generated)",
  name: "Full Name",
  phone: "Phone Number",
  role: "Role/Position",
} as const;

export function EmployeeFormModal({ open, mode, employee, onClose, onSaved }: Props) {
  const { addEmployee, updateEmployee, getNextEmployeeId } = useEmployeesStore();
  const { roles } = useRolesStore();
  const activeRoles = roles.filter((r) => r.active);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Employee>({
    id: getNextEmployeeId(),
    name: "",
    phone: "",
    role: "",
    projects: 0,
    cashBalance: "₹ 0",
    performance: "0%",
    clockIn: "09:00 AM",
    clockOut: "06:00 PM",
    totalHours: 9,
    serviceHours: 0,
    breakHours: 1,
    idleHours: 8,
    servicesCompleted: 0,
    avgServiceTime: 0,
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && employee) {
      setForm(employee);
      return;
    }
    const nextId = getNextEmployeeId();
    setForm({
      id: nextId,
      name: "",
      phone: "",
      role: "",
      projects: 0,
      cashBalance: "₹ 0",
      performance: "0%",
      clockIn: "09:00 AM",
      clockOut: "06:00 PM",
      totalHours: 9,
      serviceHours: 0,
      breakHours: 1,
      idleHours: 8,
      servicesCompleted: 0,
      avgServiceTime: 0,
    });
  }, [open, mode, employee, getNextEmployeeId]);

  const setField = <K extends keyof Employee>(key: K, value: Employee[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("profilePhoto", reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error(`${LABELS.name} is required`);
      return;
    }
    if (!form.phone.trim()) {
      toast.error(`${LABELS.phone} is required`);
      return;
    }
    if (!form.role.trim()) {
      toast.error(`${LABELS.role} is required`);
      return;
    }

    const normalized: Employee = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      role: form.role.trim(),
    };

    if (mode === "edit") {
      updateEmployee(normalized.id, normalized);
      toast.success(`Employee updated: ${normalized.name}`);
      onSaved?.(normalized);
      onClose();
      return;
    }

    addEmployee(normalized);
    toast.success(`Employee added: ${normalized.name}`);
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
              {mode === "create" ? "Add a new employee to your team" : "Update employee information"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Photo */}
            <div className="md:col-span-2 flex flex-col items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden"
              >
                {form.profilePhoto ? (
                  <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              {form.profilePhoto && (
                <button type="button" onClick={() => setField("profilePhoto", undefined)} className="text-xs text-destructive hover:opacity-80 transition-opacity">Remove photo</button>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.employeeId}</label>
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
                placeholder="Enter full name"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.phone}</label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{LABELS.role}</label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select role</option>
                {activeRoles.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
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
            {mode === "create" ? "Add Employee" : "Update Employee"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}