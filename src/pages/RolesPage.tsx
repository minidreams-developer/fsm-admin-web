import { useState } from "react";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRolesStore } from "@/store/rolesStore";

const PERMISSIONS = ["Dashboard", "Leads", "Customers", "Employees", "Work Orders", "Payments", "Inventory", "Service Management", "Branches", "Products"];

const RolesPage = () => {
  const { roles, addRole, updateRole, deleteRole } = useRolesStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[], active: true });

  const openCreate = () => {
    setEditingRole(null);
    setForm({ name: "", description: "", permissions: [], active: true });
    setShowForm(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description, permissions: [...role.permissions], active: role.active });
    setShowForm(true);
  };

  const togglePermission = (p: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(p) ? prev.permissions.filter((x) => x !== p) : [...prev.permissions, p],
    }));
  };

  const save = () => {
    if (!form.name.trim()) { toast.error("Role name is required"); return; }
    if (editingRole) {
      updateRole(editingRole.id, form);
      toast.success("Role updated");
    } else {
      addRole({ id: `ROLE-${Date.now()}`, ...form });
      toast.success("Role created");
    }
    setShowForm(false);
  };

  const deleteRoleHandler = (id: string) => {
    deleteRole(id);
    toast.success("Role deleted");
  };

  const toggleActive = (id: string) => {
    const role = roles.find((r) => r.id === id);
    if (role) updateRole(id, { active: !role.active });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Roles</h2>
          <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all hover:opacity-90" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["S.No", "Role", "Active/Inactive", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role, idx) => (
              <tr key={role.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground">{role.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(role.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${role.active ? "bg-green-500" : "bg-muted"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${role.active ? "translate-x-4" : "translate-x-1"}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(role)} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteRoleHandler(role.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold text-card-foreground">{editingRole ? "Edit Role" : "Add Role"}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Role Name *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Manager" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Role description" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePermission(p)} className="w-4 h-4 rounded accent-primary" />
                      <span className="text-xs text-card-foreground">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setShowForm(false)} className="px-5 py-2 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
                <button onClick={save} className="px-5 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
