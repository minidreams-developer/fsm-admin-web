import { useNavigate, useParams } from "react-router-dom";
import { X, Edit2, Plus, User, Check } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { TimeInput12Hour } from "@/components/TimeInput12Hour";

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

type ServiceSchedule = {
  id: string;
  service: string;
  scheduleDate: string;
  fromTime: string;
  toTime: string;
  requiredEmployees: number;
};

const EditWorkOrderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { workOrders, updateWorkOrder } = useProjectsStore();
  const { getTasksByWorkOrder, updateTask } = useTasksStore();
  const { products } = useProductsStore();
  const { employees } = useEmployeesStore();
  const { customers } = useCustomersStore();
  const { appointments } = useServicesStore();
  
  const workOrder = workOrders.find(wo => wo.id === id);
  
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
  const [executiveSignatureImage, setExecutiveSignatureImage] = useState<string | null>(
    workOrder?.executiveSignatureImage || null
  );
  const execSignatureRef = useRef<SignatureCanvas>(null);
  const [showCustomerSignatureModal, setShowCustomerSignatureModal] = useState(false);
  const [customerSignatureImage, setCustomerSignatureImage] = useState<string | null>(
    workOrder?.customerSignature || null
  );
  const customerSignatureRef = useRef<SignatureCanvas>(null);
  const [cashCollectionMap, setCashCollectionMap] = useState<Record<string, boolean>>(
    workOrder?.cashCollection || {}
  );
  
  // Address options for site address selection
  type AddressOption = {
    label: string;
    address: string;
  };
  const [siteAddressOptions, setSiteAddressOptions] = useState<AddressOption[]>([]);
  
  // Service Appointments Schedule state
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>([]);
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [termsList, setTermsList] = useState(() => {
    if (workOrder?.termsAndConditions) {
      return workOrder.termsAndConditions.split("\n").filter(Boolean);
    }
    return [
      "Services will be performed as per the scheduled appointments",
      "Customer must provide access to all areas requiring treatment",
      "Payment is due within 30 days of invoice date",
      "24-hour advance notice required for rescheduling",
      "Service warranty valid for 30 days after each treatment",
    ];
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Get services from both Products and Service Appointments - memoized to prevent recalculation
  const uniqueServices = useMemo(() => {
    const productServices = products.filter((p) => p.category === "Services" && p.status === "Active");
    const appointmentServices = appointments
      .filter((a) => a.subject)
      .map((a) => {
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
    
    const allServices = [
      ...productServices.map(p => ({ name: p.name, description: p.description, unitPrice: p.unitPrice })),
      ...appointmentServices
    ];
    
    return Array.from(
      new Map(allServices.map(s => [s.name, s])).values()
    );
  }, [products, appointments]);

  const serviceOptions = useMemo(() => uniqueServices.map(s => s.name), [uniqueServices]);

  // Filter employees to show only Sales Executives - memoized
  const salesExecutives = useMemo(() => 
    employees.filter((emp) => emp.role === "Sales Executive"),
    [employees]
  );

  // Prepare customer options for React Select
  const customerOptions = useMemo(() => 
    customers.map((customer) => ({
      value: customer.id,
      label: `${customer.firstName} ${customer.lastName} — ${customer.mobile || customer.landline}`,
      customer: customer,
    })),
    [customers]
  );

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

  // Initialize form first
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: workOrder ? {
      customer: workOrder.customer,
      phone: workOrder.phone,
      address: workOrder.address,
      email: workOrder.email,
      location: workOrder.location || "",
      liveLocation: workOrder.liveLocation || "",
      subject: workOrder.subject,
      serviceType: workOrder.serviceType,
      frequency: workOrder.frequency,
      totalValue: workOrder.totalValue.replace(/[₹,\s]/g, ""),
      paidAmount: workOrder.paidAmount.replace(/[₹,\s]/g, ""),
      start: workOrder.start,
      end: workOrder.end,
      status: workOrder.status,
      assignedTech: workOrder.assignedTech,
      workOrderIncharge: workOrder.workOrderIncharge || "",
      notes: workOrder.notes,
      siteAddress: workOrder.siteAddress || "",
      billingAddress: workOrder.billingAddress || "",
    } : undefined,
  });

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

  // Initialize tasks and selected services when workOrder is available - only once
  useEffect(() => {
    if (workOrder && !isInitialized) {
      const existingTasks = getTasksByWorkOrder(workOrder.id);
      const serviceTypes = workOrder.serviceTypes ?? (workOrder.serviceType ? [workOrder.serviceType] : []);
      setSelectedServices(serviceTypes);
      
      // Initialize selected employees from assignedTech
      if (workOrder.assignedTech && workOrder.assignedTech !== "Unassigned") {
        setSelectedEmployees(workOrder.assignedTech.split(", ").filter(Boolean));
      }

      // Find and set customer ID
      const customer = customers.find(c => 
        `${c.firstName} ${c.lastName}`.trim() === workOrder.customer.trim()
      );
      if (customer) {
        setSelectedCustomerId(customer.id);
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
      }

      // Parse multiple site addresses
      if (workOrder.siteAddress && workOrder.siteAddress.includes(" | ")) {
        const addresses = workOrder.siteAddress.split(" | ").filter(Boolean);
        if (addresses.length > 1) {
          setValue("siteAddress", addresses[0]);
          setExtraSiteAddresses(addresses.slice(1));
        }
      }

      // Reconstruct tasks with service pricing data
      const reconstructedTasks = serviceTypes.map((serviceName, index) => {
        const existingTask = existingTasks.find(t => t.title === serviceName);
        const service = uniqueServices.find(s => s.name === serviceName);
        
        return {
          id: existingTask?.id || `TASK-${Date.now()}-${index}`,
          title: serviceName,
          description: service?.description || existingTask?.description || "",
          unitPrice: service?.unitPrice || 0,
          quantity: 1,
          amount: service?.unitPrice || 0,
          startDate: existingTask?.startDate || "",
          endDate: existingTask?.endDate || "",
          fromTime: "",
          toTime: "",
          assignedTo: existingTask?.assignedTo || "",
          assignedEmployees: existingTask?.assignedEmployees || [],
          status: (existingTask?.status as TaskStatus) || "Pending",
        };
      });
      
      setTasks(reconstructedTasks);
      setIsInitialized(true);
    }
  }, [workOrder, getTasksByWorkOrder, uniqueServices, customers, isInitialized, setValue]);
  
  useEffect(() => {
    if (!workOrder) {
      toast.error("Work order not found");
      navigate("/projects");
    }
  }, [workOrder, navigate]);

  if (!workOrder) return null;

  const toggleService = useCallback((value: string) => {
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
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, // Unique ID for each task
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
  }, [setValue, uniqueServices]);

  const toggleEmployee = useCallback((employeeName: string) => {
    setSelectedEmployees((prev) => 
      prev.includes(employeeName) 
        ? prev.filter((e) => e !== employeeName) 
        : [...prev, employeeName]
    );
  }, []);

  const toggleCashCollection = useCallback((employeeName: string) => {
    setCashCollectionMap((prev) => ({
      ...prev,
      [employeeName]: !(prev[employeeName] ?? true),
    }));
  }, []);

  const removeService = useCallback((index: number) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateTaskData = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
    toast.success("Service updated");
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  const onSubmit = useCallback(async (data: WorkOrderFormData) => {
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

      updateWorkOrder(workOrder.id, {
        customer: data.customer,
        phone: data.phone,
        address: data.address,
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
      
      // Update tasks
      tasks.forEach((t) => {
        updateTask(t.id, {
          title: t.title,
          description: t.description,
          startDate: t.startDate,
          endDate: t.endDate,
          assignedTo: t.assignedEmployees.length > 0 ? t.assignedEmployees.join(", ") : t.assignedTo,
          assignedEmployees: t.assignedEmployees,
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
  }, [workOrder.id, selectedServices, selectedEmployees, extraSiteAddresses, tasks, termsList, executiveSignatureImage, customerSignatureImage, updateWorkOrder, updateTask, navigate]);

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
          <p className="text-sm text-muted-foreground mt-2">Update work order details - {workOrder.id}</p>
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

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Address *</label>
            <input type="text" placeholder=" address" {...register("address")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
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
              {/* <button
                type="button"
                onClick={() => setExtraSiteAddresses(prev => [...prev, ""])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button> */}
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

          <div className={isCustomFrequency ? "md:col-span-2" : ""}>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
            <div className={isCustomFrequency ? "flex gap-2" : ""}>
              <select
                value={isCustomFrequency ? "custom" : (watch?.("frequency") || "")}
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
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Paid Amount (₹)</label>
            <input type="number" placeholder="0" {...register("paidAmount")} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" />
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
                  const willCollectCash = cashCollectionMap[empName] ?? true;
                  return (
                    <div key={empName} className="flex items-center justify-between gap-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary">{empName}</p>
                          {emp && <p className="text-[10px] text-primary/70">{emp.role}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleCashCollection(empName)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                            willCollectCash
                              ? 'bg-success/10 text-success border border-success/20'
                              : 'bg-warning/10 text-warning border border-warning/20'
                          }`}
                          title={willCollectCash ? "Click to disable cash collection" : "Click to enable cash collection"}
                        >
                          <Check className="w-3 h-3" />
                          {willCollectCash ? 'Collect Cash' : 'No Cash'}
                        </button>
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
                                const currentScheduleCount = serviceSchedules.filter(s => s.service === task.title).length;
                                if (currentScheduleCount > newQuantity) {
                                  setServiceSchedules(prev => {
                                    const schedules = prev.filter(s => s.service === task.title);
                                    const toRemove = schedules.slice(newQuantity);
                                    return prev.filter(s => !toRemove.includes(s));
                                  });
                                }
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
                                const currentScheduleCount = serviceSchedules.filter(s => s.service === task.title).length;
                                if (currentScheduleCount < newQuantity) {
                                  const newScheduleId = `${task.id}-${currentScheduleCount + 1}`;
                                  setServiceSchedules(prev => [...prev, {
                                    id: newScheduleId,
                                    service: task.title,
                                    scheduleDate: "",
                                    fromTime: "",
                                    toTime: "",
                                    requiredEmployees: 1
                                  }]);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                            >
                              <span className="text-xs">+</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-card-foreground text-xs font-bold">₹ {task.amount?.toLocaleString() || 0}</td>
                        {hasTax && <td className="px-4 py-3 text-right text-xs text-muted-foreground">{task.gst ? `${task.gst}% (₹ ${Math.round(gstAmt).toLocaleString()})` : "—"}</td>}
                        {hasTax && tasks.some(t => t.cgst) && <td className="px-4 py-3 text-right text-xs text-muted-foreground">{task.cgst ? `${task.cgst}% (₹ ${Math.round(cgstAmt).toLocaleString()})` : "—"}</td>}
                        {hasTax && tasks.some(t => t.igst) && <td className="px-4 py-3 text-right text-xs text-muted-foreground">{task.igst ? `${task.igst}% (₹ ${Math.round(igstAmt).toLocaleString()})` : "—"}</td>}
                        {hasTax && <td className="px-4 py-3 text-right text-xs font-bold text-primary">₹ {Math.round(rowTotal).toLocaleString()}</td>}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingTask({ ...task })}
                              className="p-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
                              title="Edit service"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTask(task.id)}
                              className="p-1.5 rounded-md border border-border hover:bg-destructive/10 transition-colors"
                              title="Remove service"
                            >
                              <X className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Summary */}
            <div className="border-t border-border bg-secondary/10 px-6 py-4">
              <div className="ml-auto w-full max-w-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-semibold text-card-foreground">₹ {Math.round(subtotal).toLocaleString()}</span>
                </div>
                {totalGst > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">GST</span>
                    <span className="text-sm font-semibold text-card-foreground">₹ {Math.round(totalGst).toLocaleString()}</span>
                  </div>
                )}
                {totalCgst > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">CGST</span>
                    <span className="text-sm font-semibold text-card-foreground">₹ {Math.round(totalCgst).toLocaleString()}</span>
                  </div>
                )}
                {totalIgst > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">IGST</span>
                    <span className="text-sm font-semibold text-card-foreground">₹ {Math.round(totalIgst).toLocaleString()}</span>
                  </div>
                )}
                {!hasTax && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Tax</span>
                    <span className="text-xs text-muted-foreground italic">Edit a service to set tax</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-sm font-bold text-card-foreground">Total Amount</span>
                  <span className="text-lg font-bold text-primary">₹ {Math.round(grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Service Appointments Schedule */}
        {tasks.length > 0 && (
          <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-card-foreground">Service Appointments Schedule</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Schedule service visits for this work order</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schedule Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Time</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Time</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.flatMap((task, taskIndex) => {
                    const appointments = Array.from({ length: task.quantity || 1 }, (_, appointmentIndex) => {
                      const scheduleId = `${task.id}-${appointmentIndex + 1}`;
                      const schedule = serviceSchedules.find(s => s.id === scheduleId) || {
                        id: scheduleId,
                        service: task.title,
                        scheduleDate: "",
                        fromTime: "",
                        toTime: "",
                        requiredEmployees: 1
                      };
                      return { schedule, taskIndex, appointmentIndex };
                    });

                    return appointments.map(({ schedule, taskIndex, appointmentIndex }) => (
                      <tr key={schedule.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{taskIndex + 1}.{appointmentIndex + 1}</td>
                        <td className="px-4 py-3 font-medium text-card-foreground text-sm">
                          {task.title}
                          {task.quantity > 1 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Appointment {appointmentIndex + 1} of {task.quantity})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={schedule.scheduleDate}
                            onChange={(e) => {
                              setServiceSchedules(prev => {
                                const existing = prev.find(s => s.id === schedule.id);
                                if (existing) {
                                  return prev.map(s => s.id === schedule.id ? { ...s, scheduleDate: e.target.value } : s);
                                }
                                return [...prev, { ...schedule, scheduleDate: e.target.value }];
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <TimeInput12Hour
                            value={schedule.fromTime}
                            onChange={(val) => {
                              setServiceSchedules(prev => {
                                const existing = prev.find(s => s.id === schedule.id);
                                if (existing) {
                                  return prev.map(s => s.id === schedule.id ? { ...s, fromTime: val } : s);
                                }
                                return [...prev, { ...schedule, fromTime: val }];
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <TimeInput12Hour
                            value={schedule.toTime}
                            onChange={(val) => {
                              setServiceSchedules(prev => {
                                const existing = prev.find(s => s.id === schedule.id);
                                if (existing) {
                                  return prev.map(s => s.id === schedule.id ? { ...s, toTime: val } : s);
                                }
                                return [...prev, { ...schedule, toTime: val }];
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setServiceSchedules(prev => {
                                  const existing = prev.find(s => s.id === schedule.id);
                                  const newQty = Math.max(0, (existing?.requiredEmployees || 1) - 1);
                                  if (existing) {
                                    return prev.map(s => s.id === schedule.id ? { ...s, requiredEmployees: newQty } : s);
                                  }
                                  return [...prev, { ...schedule, requiredEmployees: newQty }];
                                });
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                            >
                              <span className="text-sm">−</span>
                            </button>
                            <span className="text-sm font-semibold text-card-foreground min-w-[2.5rem] text-center">
                              {schedule.requiredEmployees}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setServiceSchedules(prev => {
                                  const existing = prev.find(s => s.id === schedule.id);
                                  const newQty = (existing?.requiredEmployees || 1) + 1;
                                  if (existing) {
                                    return prev.map(s => s.id === schedule.id ? { ...s, requiredEmployees: newQty } : s);
                                  }
                                  return [...prev, { ...schedule, requiredEmployees: newQty }];
                                });
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                            >
                              <span className="text-sm">+</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sales Executive Signature */}
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-bold text-card-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              Sales Executive Signature
            </h2>
            {!executiveSignatureImage ? (
              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                <Edit2 className="w-4 h-4" />
                Add Signature
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-card-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Re-sign
              </button>
            )}
          </div>
          <div className="px-6 py-5">
            {executiveSignatureImage ? (
              <div className="bg-secondary/30 rounded-lg p-5 border border-border">
                <div className="flex items-start gap-4">
                  <div className="bg-white rounded-lg border border-border p-3 flex-shrink-0">
                    <img src={executiveSignatureImage} alt="Executive Signature" className="h-20 max-w-[200px] object-contain" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-card-foreground">
                      {selectedEmployees.length > 0 ? selectedEmployees[0] : "Sales Executive"}
                    </p>
                    <p className="text-xs text-muted-foreground">Signed at: {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">✓ Signed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/30 rounded-lg border-2 border-dashed border-border p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Edit2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No signature yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Signature" to sign this work order</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Signature */}
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-bold text-card-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Signature
            </h2>
            {!customerSignatureImage ? (
              <button
                type="button"
                onClick={() => setShowCustomerSignatureModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                <Edit2 className="w-4 h-4" />
                Add Signature
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomerSignatureModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-card-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Re-sign
              </button>
            )}
          </div>
          <div className="px-6 py-5">
            {customerSignatureImage ? (
              <div className="bg-secondary/30 rounded-lg p-5 border border-border">
                <div className="flex items-start gap-4">
                  <div className="bg-white rounded-lg border border-border p-3 flex-shrink-0">
                    <img src={customerSignatureImage} alt="Customer Signature" className="h-20 max-w-[200px] object-contain" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-card-foreground">{watch("customer") || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">Signed at: {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">✓ Signed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/30 rounded-lg border-2 border-dashed border-border p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Edit2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No signature yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Signature" to capture customer signature</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-bold text-card-foreground">Terms & Conditions</h2>
            <button
              type="button"
              onClick={() => setIsEditingTerms(e => !e)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-xs font-semibold text-card-foreground"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditingTerms ? "Done" : "Edit"}
            </button>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="space-y-2.5">
              {termsList.map((term, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-sm font-medium text-muted-foreground flex-shrink-0 mt-0.5">{idx + 1}.</span>
                  {isEditingTerms ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        value={term}
                        onChange={(e) => setTermsList(prev => prev.map((t, i) => i === idx ? e.target.value : t))}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setTermsList(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{term}</p>
                  )}
                </div>
              ))}
              {isEditingTerms && (
                <button
                  type="button"
                  onClick={() => setTermsList(prev => [...prev, ""])}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Term
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button type="button" onClick={() => navigate("/projects")} className="px-6 py-2.5 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
            {isSubmitting ? "Updating..." : "Update Work Order"}
          </button>
        </div>
      </form>

      {/* Edit Service Modal */}
      {editingTask && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold text-card-foreground">Edit Service</h2>
              <button onClick={() => setEditingTask(null)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Service</label>
                <input value={editingTask.title} readOnly className="w-full px-3 py-2 rounded-lg bg-secondary/50 text-sm border border-border text-card-foreground" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
                <textarea 
                  value={editingTask.description} 
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} 
                  placeholder="Service description..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground resize-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Unit Price (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingTask.unitPrice} 
                  onChange={(e) => {
                    const unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                    const amount = unitPrice * editingTask.quantity;
                    setEditingTask({ ...editingTask, unitPrice, amount });
                  }} 
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={editingTask.quantity} 
                  onChange={(e) => {
                    const quantity = Math.max(1, parseInt(e.target.value) || 1);
                    const amount = editingTask.unitPrice * quantity;
                    setEditingTask({ ...editingTask, quantity, amount });
                  }} 
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Amount (₹)</label>
                <input 
                  type="text" 
                  value={`₹ ${editingTask.amount?.toLocaleString() || 0}`}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 text-sm border border-border text-card-foreground font-bold" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">From Time</label>
                  <TimeInput12Hour 
                    value={editingTask.fromTime || ""} 
                    onChange={(e) => setEditingTask({ ...editingTask, fromTime: e })} 
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">To Time</label>
                  <TimeInput12Hour 
                    value={editingTask.toTime || ""} 
                    onChange={(e) => setEditingTask({ ...editingTask, toTime: e })} 
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground" 
                  />
                </div>
              </div>
              {customerState ? (
                <div className="rounded-lg bg-secondary/40 border border-border px-4 py-3 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax — {customerState}</p>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">GST (%)</label>
                    <input
                      type="number"
                      min="0"
                      value={editingTask.gst || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, gst: e.target.value })}
                      placeholder="e.g. 18"
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                    />
                  </div>
                  {customerState === "Tamil Nadu" ? (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">CGST (%)</label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.cgst || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, cgst: e.target.value })}
                        placeholder="e.g. 9"
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">IGST (%)</label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.igst || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, igst: e.target.value })}
                        placeholder="e.g. 18"
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-secondary/40 border border-dashed border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Select a customer to auto-detect state and show applicable tax fields.</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
                <select value={editingTask.status} onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-card-foreground">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button onClick={() => setEditingTask(null)} className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:text-primary transition-colors rounded-lg">Cancel</button>
                <button onClick={() => updateTaskData(editingTask)} className="flex-1 h-10 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>Update Service</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sales Executive Signature Modal */}
      {showSignatureModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Sales Executive Signature</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Signing as: <span className="font-semibold text-primary">{selectedEmployees.length > 0 ? selectedEmployees[0] : "Sales Executive"}</span>
                </p>
              </div>
              <button onClick={() => setShowSignatureModal(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Please sign below to confirm your authorization of this work order.</p>
              <div className="border-2 border-border rounded-lg bg-white overflow-hidden">
                <SignatureCanvas
                  ref={execSignatureRef}
                  canvasProps={{ className: "w-full h-44" }}
                  backgroundColor="white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => execSignatureRef.current?.clear()}
                  className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:bg-secondary transition-colors rounded-lg"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSaveExecSignature}
                  className="flex-1 h-10 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Customer Signature Modal */}
      {showCustomerSignatureModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Customer Signature</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Signing as: <span className="font-semibold text-primary">{watch("customer") || "Customer"}</span>
                </p>
              </div>
              <button onClick={() => setShowCustomerSignatureModal(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Customer signature to confirm agreement to this work order.</p>
              <div className="border-2 border-border rounded-lg bg-white overflow-hidden">
                <SignatureCanvas
                  ref={customerSignatureRef}
                  canvasProps={{ className: "w-full h-44" }}
                  backgroundColor="white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => customerSignatureRef.current?.clear()}
                  className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:bg-secondary transition-colors rounded-lg"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomerSignature}
                  className="flex-1 h-10 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EditWorkOrderPage;
