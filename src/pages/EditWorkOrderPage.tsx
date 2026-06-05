import { useNavigate, useLocation, useParams } from "react-router-dom";
import { X, Edit2, Plus, User, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Select from "react-select";
import SignatureCanvas from "react-signature-canvas";
import { useProjectsStore } from "@/store/projectsStore";
import { useTasksStore } from "@/store/tasksStore";
import { useProductsStore } from "@/store/productsStore";
import { useEmployeesStore } from "@/store/employeesStore";
import { useCustomersStore } from "@/store/customersStore";
import { useServicesStore } from "@/store/servicesStore";

const workOrderSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  liveLocation: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  serviceType: z.string().optional(),
  frequency: z.string().optional(),
  totalValue: z.string().optional(),
  paidAmount: z.string().optional(),
  start: z.string().min(1, "Start date is required"),
  end: z.string().optional(),
  status: z.enum(["Authorization Pending", "Ongoing", "Upcoming", "Missed", "Cancelled", "Completed", "Converted", "Overdue"]),
  assignedTech: z.string().optional(),
  workOrderIncharge: z.string().optional(),
  notes: z.string().optional(),
  siteAddress: z.string().optional(),
  billingAddress: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

type TaskStatus = "Pending" | "In Progress" | "Completed";

type Task = {
  id: string;
  title: string;
  description: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  startDate: string;
  endDate: string;
  fromTime: string;
  toTime: string;
  assignedTo: string;
  assignedEmployees: string[];
  status: TaskStatus;
  gst?: string;
  igst?: string;
  cgst?: string;
};

const EditWorkOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: workOrderId } = useParams<{ id: string }>();
  const { getWorkOrder, updateWorkOrder } = useProjectsStore();
  const { updateTask, getTasksByWorkOrder } = useTasksStore();
  const { products } = useProductsStore();
  const { employees } = useEmployeesStore();
  const { customers } = useCustomersStore();
  const { appointments } = useServicesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerState, setCustomerState] = useState<string>("");
  const [extraSiteAddresses, setExtraSiteAddresses] = useState<string[]>([]);
  const [isCustomFrequency, setIsCustomFrequency] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [executiveSignatureImage, setExecutiveSignatureImage] = useState<string | null>(null);
  const execSignatureRef = useRef<SignatureCanvas>(null);
  const [showCustomerSignatureModal, setShowCustomerSignatureModal] = useState(false);
  const [customerSignatureImage, setCustomerSignatureImage] = useState<string | null>(null);
  const customerSignatureRef = useRef<SignatureCanvas>(null);
  const [cashCollectionMap, setCashCollectionMap] = useState<Record<string, boolean>>({});
  
  // Address options for site address selection
  type AddressOption = {
    label: string;
    address: string;
  };
  const [siteAddressOptions, setSiteAddressOptions] = useState<AddressOption[]>([]);
  
  // Service Appointments Schedule state
  type ServiceSchedule = {
    id: string;
    service: string;
    scheduleDate: string;
    fromTime: string;
    toTime: string;
    requiredEmployees: number;
  };
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [termsList, setTermsList] = useState([
    "Services will be performed as per the scheduled appointments",
    "Customer must provide access to all areas requiring treatment",
    "Payment is due within 30 days of invoice date",
    "24-hour advance notice required for rescheduling",
    "Service warranty valid for 30 days after each treatment",
  ]);

  // Get services from both Products (Services category) and Service Appointments
  const productServices = products.filter((p) => p.category === "Services" && p.status === "Active");
  const appointmentServices = appointments
    .filter((a) => a.subject) // Only include appointments with a subject
    .map((a) => {
      // Parse unitPrice - remove currency symbols and commas, then convert to number
      let parsedUnitPrice = 0;
      if (a.unitPrice) {
        const cleanPrice = a.unitPrice.replace(/[₹,\s]/g, '');
        parsedUnitPrice = parseFloat(cleanPrice) || 0;
      } else if (a.payment?.amount) {
        parsedUnitPrice = a.payment.amount;
      }
      
      return {
        name: a.subject || "",
        description: a.serviceDescription || "",
        unitPrice: parsedUnitPrice,
      };
    });
  
  // Combine and deduplicate services by name
  const allServices = [
    ...productServices.map(p => ({ name: p.name, description: p.description, unitPrice: p.unitPrice })),
    ...appointmentServices
  ];
  const uniqueServices = Array.from(
    new Map(allServices.map(s => [s.name, s])).values()
  );
  const serviceOptions = uniqueServices.map(s => s.name);
  
  // Prepare customer options for React Select
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.firstName} ${customer.lastName} — ${customer.mobile || customer.landline}`,
    customer: customer,
  }));

  // Filter employees to show only Sales Executives
  const salesExecutives = employees.filter((emp) => emp.role === "Sales Executive");

  // Custom styles for React Select to match the theme
  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--secondary))',
      borderColor: state.isFocused ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))',
      borderRadius: '0.5rem',
      minHeight: '38px',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--primary) / 0.2)' : 'none',
      '&:hover': {
        borderColor: 'hsl(var(--border))',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary))'
        : state.isFocused
        ? 'hsl(var(--secondary))'
        : 'transparent',
      color: state.isSelected ? 'white' : 'hsl(var(--card-foreground))',
      fontSize: '0.875rem',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'hsl(var(--primary) / 0.9)',
      },
    }),
    input: (base: any) => ({
      ...base,
      color: 'hsl(var(--card-foreground))',
      fontSize: '0.875rem',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'hsl(var(--card-foreground))',
      fontSize: '0.875rem',
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const fullName = `${customer.firstName} ${customer.lastName}`.trim();
      setValue("customer", fullName);
      setValue("phone", customer.mobile || customer.landline || "");
      setValue("email", customer.emailAddress || "");
      setValue("address", customer.siteAddress || customer.billingAddress || "");
      setValue("siteAddress", customer.siteAddress || "", { shouldValidate: true, shouldDirty: true });
      setValue("billingAddress", customer.billingAddress || "", { shouldValidate: true, shouldDirty: true });
      // Capture customer state for tax calculation
      const state = customer.placeOfSupply || customer.siteAddressFields?.state || customer.billingAddressFields?.state || "";
      setCustomerState(state);

      // Build address options from customer's saved addresses
      const opts: AddressOption[] = [];

      // Primary site address
      if (customer.siteAddressFields) {
        const f = customer.siteAddressFields;
        const street = [f.street1, f.street2].filter(Boolean).join(", ");
        if (street || f.city) {
          opts.push({ label: `Site: ${[street, f.city, f.state, f.pinCode].filter(Boolean).join(", ")}`, address: street });
        }
      } else if (customer.siteAddress) {
        opts.push({ label: `Site: ${customer.siteAddress}`, address: customer.siteAddress });
      }

      // Additional site addresses
      if (customer.additionalSiteAddressFields) {
        customer.additionalSiteAddressFields.forEach((f, idx) => {
          const street = [f.street1, f.street2].filter(Boolean).join(", ");
          if (street || f.city) {
            opts.push({ label: `Site ${idx + 2}: ${[street, f.city, f.state, f.pinCode].filter(Boolean).join(", ")}`, address: street });
          }
        });
      }

      // Billing address
      if (customer.billingAddressFields) {
        const f = customer.billingAddressFields;
        const street = [f.street1, f.street2].filter(Boolean).join(", ");
        if (street || f.city) {
          opts.push({ label: `Billing: ${[street, f.city, f.state, f.pinCode].filter(Boolean).join(", ")}`, address: street });
        }
      } else if (customer.billingAddress) {
        opts.push({ label: `Billing: ${customer.billingAddress}`, address: customer.billingAddress });
      }

      setSiteAddressOptions(opts);
    } else {
      setSiteAddressOptions([]);
    }
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customer: "",
      phone: "",
      address: "",
      subject: "",
      serviceType: "",
      status: "Authorization Pending",
      start: new Date().toISOString().split("T")[0],
      siteAddress: "",
      billingAddress: "",
    },
  });

  // Load existing work order data on mount
  useEffect(() => {
    if (!workOrderId) {
      toast.error("Work Order ID not found");
      navigate("/projects");
      return;
    }

    const workOrder = getWorkOrder(workOrderId);
    if (!workOrder) {
      toast.error("Work Order not found");
      navigate("/projects");
      return;
    }

    // Load work order data into form
    setValue("customer", workOrder.customer);
    setValue("phone", workOrder.phone);
    setValue("address", workOrder.address);
    setValue("email", workOrder.email || "");
    setValue("location", workOrder.location || "");
    setValue("liveLocation", workOrder.liveLocation || "");
    setValue("subject", workOrder.subject);
    setValue("serviceType", workOrder.serviceType || "");
    setValue("frequency", workOrder.frequency || "");
    setValue("totalValue", workOrder.totalValue || "");
    setValue("paidAmount", workOrder.paidAmount || "");
    setValue("start", workOrder.start);
    setValue("end", workOrder.end || "");
    setValue("status", workOrder.status as any);
    setValue("workOrderIncharge", workOrder.workOrderIncharge || "");
    setValue("notes", workOrder.notes || "");
    setValue("siteAddress", workOrder.siteAddress || "");
    setValue("billingAddress", workOrder.billingAddress || "");

    // Load selected services
    const serviceTypes = workOrder.serviceTypes || [];
    setSelectedServices(serviceTypes);

    // Load selected employees
    if (workOrder.assignedTech && workOrder.assignedTech !== "Unassigned") {
      const techList = workOrder.assignedTech.split(", ").map(t => t.trim());
      setSelectedEmployees(techList);
    }

    // Load cash collection map
    if (workOrder.cashCollection) {
      setCashCollectionMap(workOrder.cashCollection);
    }

    // Load signatures
    if (workOrder.executiveSignatureImage) {
      setExecutiveSignatureImage(workOrder.executiveSignatureImage);
    }
    if (workOrder.customerSignature) {
      setCustomerSignatureImage(workOrder.customerSignature);
    }

    // Load terms and conditions
    if (workOrder.termsAndConditions) {
      const terms = workOrder.termsAndConditions.split("\n").filter(t => t.trim());
      setTermsList(terms);
    }

    // Load existing tasks for this work order
    const existingTasks = getTasksByWorkOrder(workOrderId);
    const formattedTasks: Task[] = existingTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      unitPrice: task.unitPrice || 0,
      quantity: task.quantity || 1,
      amount: task.amount || 0,
      startDate: task.startDate || "",
      endDate: task.endDate || "",
      fromTime: task.fromTime || "",
      toTime: task.toTime || "",
      assignedTo: task.assignedTo || "",
      assignedEmployees: task.assignedEmployees || [],
      status: task.status as TaskStatus || "Pending",
      gst: task.gst?.toString() || "",
      igst: task.igst?.toString() || "",
      cgst: task.cgst?.toString() || "",
    }));
    setTasks(formattedTasks);

    // Find and select the customer
    const customer = customers.find(c => c.firstName && c.lastName && 
      `${c.firstName} ${c.lastName}`.toLowerCase() === workOrder.customer.toLowerCase());
    if (customer) {
      handleCustomerSelect(customer.id);
    }

    // Check if custom frequency
    const commonFrequencies = ["Daily", "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Half-yearly", "Yearly"];
    if (workOrder.frequency && !commonFrequencies.includes(workOrder.frequency)) {
      setIsCustomFrequency(true);
    }
  }, [workOrderId]);

  const toggleService = (value: string) => {
    // Always add the service (allow duplicates)
    const service = uniqueServices.find(s => s.name === value);
    
    // Add to selected services array
    setSelectedServices((prev) => {
      const next = [...prev, value];
      setValue("serviceType", next[0] ?? "");
      return next;
    });
    
    // Add as a new task (always create a new task, even if service name is duplicate)
    setTasks((t) => [...t, { 
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID for each task
      title: value,
      description: service?.description || "",
      unitPrice: service?.unitPrice || 0,
      quantity: 1,
      amount: service?.unitPrice || 0,
      startDate: "", 
      endDate: "",
      fromTime: "",
      toTime: "",
      assignedTo: "", 
      assignedEmployees: [],
      status: "Pending"
    }]);
  };

  const toggleEmployee = (employeeName: string) => {
    setSelectedEmployees((prev) => 
      prev.includes(employeeName) 
        ? prev.filter((e) => e !== employeeName) 
        : [...prev, employeeName]
    );
  };

  const toggleCashCollection = (employeeName: string) => {
    setCashCollectionMap((prev) => ({
      ...prev,
      [employeeName]: !(prev[employeeName] ?? true),
    }));
  };

  const removeService = (index: number) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTaskLocal = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
    toast.success("Service updated");
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveExecSignature = () => {
    if (execSignatureRef.current?.isEmpty()) {
      toast.error("Please provide a signature before saving");
      return;
    }
    const signatureData = execSignatureRef.current?.toDataURL();
    setExecutiveSignatureImage(signatureData || null);
    setShowSignatureModal(false);
    toast.success("Sales Executive signature saved!");
  };

  const handleSaveCustomerSignature = () => {
    if (customerSignatureRef.current?.isEmpty()) {
      toast.error("Please provide a signature before saving");
      return;
    }
    const signatureData = customerSignatureRef.current?.toDataURL();
    setCustomerSignatureImage(signatureData || null);
    setShowCustomerSignatureModal(false);
    toast.success("Customer signature saved!");
  };

  const onSubmit = async (data: WorkOrderFormData) => {
    setIsSubmitting(true);
    try {
      // Combine all site addresses
      const allSiteAddresses = [
        data.siteAddress || data.address,
        ...extraSiteAddresses.filter(addr => addr.trim())
      ].filter(Boolean).join(" | ");

      // Compute grand total from services table (subtotal + all taxes)
      const subtotal = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalTax = tasks.reduce((sum, t) => {
        const gst = (t.amount || 0) * (parseFloat(t.gst || "0") / 100);
        const cgst = (t.amount || 0) * (parseFloat(t.cgst || "0") / 100);
        const igst = (t.amount || 0) * (parseFloat(t.igst || "0") / 100);
        return sum + gst + cgst + igst;
      }, 0);
      const grandTotal = Math.round(subtotal + totalTax);
      const computedTotalValue = grandTotal > 0
        ? `₹ ${grandTotal.toLocaleString()}`
        : data.totalValue ? `₹ ${parseInt(data.totalValue).toLocaleString()}` : "₹ 0";
      
      // Update the work order
      updateWorkOrder(workOrderId!, {
        customer: data.customer,
        address: data.address,
        phone: data.phone,
        email: data.email || "",
        location: data.location || "",
        liveLocation: data.liveLocation || "",
        subject: data.subject,
        serviceType: data.serviceType || "",
        serviceTypes: selectedServices,
        frequency: data.frequency || "",
        totalValue: computedTotalValue,
        paidAmount: data.paidAmount ? `₹ ${parseInt(data.paidAmount).toLocaleString()}` : "₹ 0",
        start: data.start,
        end: data.end || data.start,
        status: data.status,
        assignedTech: selectedEmployees.length > 0 ? selectedEmployees.join(", ") : "Unassigned",
        workOrderIncharge: data.workOrderIncharge || "",
        notes: data.notes || "",
        siteAddress: allSiteAddresses,
        billingAddress: data.billingAddress || data.address,
        termsAndConditions: termsList.filter(t => t.trim()).join("\n"),
        salesExecutive: selectedEmployees.length > 0 ? selectedEmployees[0] : undefined,
        executiveSignatureImage: executiveSignatureImage || undefined,
        customerSignature: customerSignatureImage || undefined,
        cashCollection: cashCollectionMap,
      });

      // Update existing tasks
      tasks.forEach((t) => {
        updateTask(t.id, {
          title: t.title,
          description: "",
          startDate: t.startDate,
          endDate: t.endDate,
          assignedTo: t.assignedEmployees.length > 0 ? t.assignedEmployees.join(", ") : t.assignedTo,
          assignedEmployees: t.assignedEmployees.length > 0 ? t.assignedEmployees : (t.assignedTo ? [t.assignedTo] : []),
          status: t.status,
        });
      });

      toast.success("Work Order updated successfully!");
      navigate("/projects");
    } catch {
      toast.error("Failed to update work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<TaskStatus, string> = {
    Pending: "bg-warning/10 text-warning border-warning/20",
    "In Progress": "bg-primary/10 text-primary border-primary/20",
    Completed: "bg-success/10 text-success border-success/20",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-card-foreground">Edit Work Order</h1>
          <p className="text-sm text-muted-foreground mt-2">Update the work order details</p>
        </div>
        <button onClick={() => navigate("/projects")} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Customer Name *</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  options={customerOptions}
                  value={customerOptions.find(opt => opt.value === selectedCustomerId) || null}
                  onChange={(option) => {
                    if (option) {
                      handleCustomerSelect(option.value);
                    } else {
                      setSelectedCustomerId("");
                      setCustomerState("");
                      setValue("customer", "");
                      setValue("phone", "");
                      setValue("email", "");
                      setValue("address", "");
                      setValue("siteAddress", "");
                      setValue("billingAddress", "");
                    }
                  }}
                  styles={customSelectStyles}
                  placeholder="Search or select customer..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No customers found"}
                />
              </div>
              {selectedCustomerId && (
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${selectedCustomerId}?edit=true`)}
                  className="h-[38px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-xs font-semibold text-card-foreground flex-shrink-0"
                  title="Edit customer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
            {/* Hidden input for form validation */}
            <input type="hidden" {...register("customer")} />
            {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone *</label>
            <input type="tel" placeholder="9876543210" {...register("phone")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
            <input type="email" placeholder="customer@email.com" {...register("email")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
          </div>

          <div className="text-xs font-medium text-muted-foreground mb-2 block">
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="text-xs font-medium text-muted-foreground block">Billing Address</label>
            </div>
            <textarea
              {...register("billingAddress")}
              placeholder="e.g. 12 MG Road, Kochi"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="text-xs font-medium text-muted-foreground mb-2 block">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground block">Site Address</label>
            </div>
            {siteAddressOptions.length > 0 ? (
              <>
                <select
                  value={siteAddressOptions.findIndex(o => o.address === (watch?.("siteAddress") || ""))}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    if (idx === -1) {
                      // Custom — clear field for manual entry
                      setValue("siteAddress", "");
                    } else {
                      const opt = siteAddressOptions[idx];
                      setValue("siteAddress", opt.address);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={-1}>select site address</option>
                  {siteAddressOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
                {/* Show manual input when custom is selected */}
                {siteAddressOptions.findIndex(o => o.address === (watch?.("siteAddress") || "")) === -1 && (
                  <textarea
                    {...register("siteAddress")}
                    placeholder="e.g. 12 MG Road, Kochi"
                    rows={2}
                    className="w-full mt-2 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                )}
              </>
            ) : (
              <textarea
                {...register("siteAddress")}
                placeholder="e.g. 12 MG Road, Kochi"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            )}
            {extraSiteAddresses.map((addr, idx) => (
              <div key={idx} className="relative mt-2">
                <textarea
                  value={addr}
                  onChange={(e) => setExtraSiteAddresses(prev => prev.map((a, i) => i === idx ? e.target.value : a))}
                  placeholder={`e.g. Site Address ${idx + 2}`}
                  rows={2}
                  className="w-full px-3 py-2.5 pr-9 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  type="button"
                  onClick={() => setExtraSiteAddresses(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-2.5 right-2.5 p-0.5 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Location URL</label>
            <input type="text" placeholder="e.g. Google Maps link or coordinates" {...register("liveLocation")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Subject *</label>
            <input type="text" placeholder="Work order subject" {...register("subject")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
          </div>

          <div className={isCustomFrequency ? "md:col-span-2" : ""}>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
            <div className={isCustomFrequency ? "flex gap-2" : ""}>
              <select
                value={isCustomFrequency ? "custom" : (watch("frequency") || "")}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomFrequency(true);
                    setValue("frequency", "");
                  } else {
                    setIsCustomFrequency(false);
                    setValue("frequency", e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
              >
                <option value="">Select frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-yearly">Half-yearly</option>
                <option value="Yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
              {isCustomFrequency && (
                <input
                  type="text"
                  {...register("frequency")}
                  placeholder="Enter custom frequency"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date *</label>
            <input type="date" {...register("start")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.start && <p className="text-xs text-red-500 mt-1">{errors.start.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date</label>
            <input type="date" {...register("end")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
            <select {...register("status")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
              <option value="Authorization Pending">Authorization Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Overdue">Overdue</option>
              <option value="Missed">Missed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          <div className="text-xs font-medium text-muted-foreground mb-2 block">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Assign Sales Executives</label>
            <select
              onChange={(e) => { if (e.target.value) { toggleEmployee(e.target.value); e.target.value = ""; } }}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground mb-2"
              defaultValue=""
            >
              <option value="" disabled>
                {salesExecutives.length === 0 ? "No Sales Executives available" : "Select sales executives..."}
              </option>
              {salesExecutives.map((emp) => (
                <option key={emp.id} value={emp.name} disabled={selectedEmployees.includes(emp.name)}>
                  {emp.name} — {emp.role}{selectedEmployees.includes(emp.name) ? " ✓" : ""}
                </option>
              ))}
            </select>
            
            {/* Display selected employees */}
            {selectedEmployees.length > 0 && (
              <div className="space-y-2 mt-3">
                {selectedEmployees.map((empName) => {
                  const emp = employees.find(e => e.name === empName);
                  const cashNotNeeded = cashCollectionMap[empName] ?? true;
                  return (
                    <div key={empName} className="flex items-center justify-between gap-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary">{empName}</p>
                          {emp && <p className="text-[10px] text-primary/70">{emp.role}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                          <input
                            type="checkbox"
                            checked={cashNotNeeded}
                            onChange={() => toggleCashCollection(empName)}
                            className="w-4 h-4 rounded border-2 border-primary accent-primary cursor-pointer"
                            title="Check if cash collection is not needed for this employee"
                          />
                          <span className="text-xs font-medium text-primary whitespace-nowrap">Cash Not Needed</span>
                        </label>
                        <button 
                          type="button" 
                          onClick={() => toggleEmployee(empName)} 
                          className="text-primary hover:text-primary/70 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>  
            )}
            
            {/* Hidden input for form compatibility */}
            <input type="hidden" {...register("assignedTech")} value={selectedEmployees.join(", ")} />
          </div>

          <div className="text-xs font-medium text-muted-foreground mb-2 block">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
            <textarea placeholder="Additional notes..." rows={3} {...register("notes")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none" />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Type</label>
            <select
              onChange={(e) => { 
                if (e.target.value) { 
                  toggleService(e.target.value); 
                } 
                e.target.value = ""; 
              }}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground mb-2"
              value=""
            >
              <option value="" disabled>Select service type (can add multiple times)...</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((s, index) => (
                  <div key={`${s}-${index}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="text-xs font-medium text-primary">{s}</span>
                    {selectedServices.filter(service => service === s).length > 1 && (
                      <span className="text-xs text-primary/70">#{selectedServices.slice(0, index + 1).filter(service => service === s).length}</span>
                    )}
                    <button type="button" onClick={() => removeService(index)} className="text-primary hover:text-primary/70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* hidden input to satisfy react-hook-form */}
            <input type="hidden" {...register("serviceType")} />
          </div>

          <div className="pt-4 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              />
              <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                Cash Collection Not Needed Employee
              </span>
            </label>
          </div>
        </div>

        {/* Services Section */}
        {tasks.length > 0 && (() => {
          const subtotal = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
          const totalGst = tasks.reduce((sum, t) => {
            const rate = parseFloat(t.gst || "0") / 100;
            return sum + (t.amount || 0) * rate;
          }, 0);
          const totalCgst = tasks.reduce((sum, t) => {
            const rate = parseFloat(t.cgst || "0") / 100;
            return sum + (t.amount || 0) * rate;
          }, 0);
          const totalIgst = tasks.reduce((sum, t) => {
            const rate = parseFloat(t.igst || "0") / 100;
            return sum + (t.amount || 0) * rate;
          }, 0);
          const totalTax = totalGst + totalCgst + totalIgst;
          const grandTotal = subtotal + totalTax;
          const hasTax = tasks.some(t => t.gst || t.cgst || t.igst);

          return (
            <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold text-card-foreground">Services</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Services added</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                      {hasTax && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GST</th>}
                      {hasTax && tasks.some(t => t.cgst) && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CGST</th>}
                      {hasTax && tasks.some(t => t.igst) && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">IGST</th>}
                      {hasTax && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>}
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => {
                      const gstAmt = (task.amount || 0) * (parseFloat(task.gst || "0") / 100);
                      const cgstAmt = (task.amount || 0) * (parseFloat(task.cgst || "0") / 100);
                      const igstAmt = (task.amount || 0) * (parseFloat(task.igst || "0") / 100);
                      const rowTotal = (task.amount || 0) + gstAmt + cgstAmt + igstAmt;
                      return (
                        <tr key={task.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3 font-medium text-card-foreground text-xs">{task.title}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{task.description || "—"}</td>
                          <td className="px-4 py-3 text-right text-card-foreground text-xs font-semibold">₹ {task.unitPrice?.toLocaleString() || 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const newQuantity = Math.max(1, task.quantity - 1);
                                  const newAmount = task.unitPrice * newQuantity;
                                  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, quantity: newQuantity, amount: newAmount } : t));
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                              >
                                <span className="text-xs">−</span>
                              </button>
                              <span className="text-xs font-semibold text-card-foreground min-w-[2rem] text-center">{task.quantity || 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newQuantity = task.quantity + 1;
                                  const newAmount = task.unitPrice * newQuantity;
                                  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, quantity: newQuantity, amount: newAmount } : t));
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                              >
                                <span className="text-xs">+</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-card-foreground text-xs font-semibold">₹ {(task.amount || 0).toLocaleString()}</td>
                          {hasTax && <td className="px-4 py-3 text-right text-muted-foreground text-xs">{task.gst ? `${task.gst}%` : "—"}</td>}
                          {hasTax && tasks.some(t => t.cgst) && <td className="px-4 py-3 text-right text-muted-foreground text-xs">{task.cgst ? `${task.cgst}%` : "—"}</td>}
                          {hasTax && tasks.some(t => t.igst) && <td className="px-4 py-3 text-right text-muted-foreground text-xs">{task.igst ? `${task.igst}%` : "—"}</td>}
                          {hasTax && <td className="px-4 py-3 text-right text-card-foreground text-xs font-semibold">₹ {rowTotal.toLocaleString()}</td>}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setEditingTask(task)}
                              className="text-primary hover:text-primary/70 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-secondary/20 border-t border-border">
                <div className="flex items-center justify-end gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <p className="text-sm font-bold text-card-foreground">₹ {subtotal.toLocaleString()}</p>
                  </div>
                  {totalGst > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">GST</p>
                      <p className="text-sm font-bold text-card-foreground">₹ {totalGst.toLocaleString()}</p>
                    </div>
                  )}
                  {totalCgst > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">CGST</p>
                      <p className="text-sm font-bold text-card-foreground">₹ {totalCgst.toLocaleString()}</p>
                    </div>
                  )}
                  {totalIgst > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">IGST</p>
                      <p className="text-sm font-bold text-card-foreground">₹ {totalIgst.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="border-l border-border pl-8">
                    <p className="text-xs text-muted-foreground">Grand Total</p>
                    <p className="text-lg font-bold text-primary">₹ {grandTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Submit Button */}
        <div className="flex gap-3 justify-end pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium text-card-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium text-white"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditWorkOrderPage;
