import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, CheckCircle, Clock, AlertCircle, MapPin, Phone, Mail, DollarSign, Calendar, Edit2, Trash2, Download, User } from "lucide-react";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useProjectsStore } from "@/store/projectsStore";
import { useTasksStore } from "@/store/tasksStore";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkOrderEditModal } from "@/components/WorkOrderEditModal";
import { TaskEditModal } from "@/components/TaskEditModal";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureCanvas from "react-signature-canvas";

export const WorkOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWorkOrder, updateWorkOrder } = useProjectsStore();
  const { getTasksByWorkOrder, deleteTask } = useTasksStore();
  const [isEditingWorkOrder, setIsEditingWorkOrder] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const execSignatureRef = useRef<SignatureCanvas>(null);

  const workOrder = id ? getWorkOrder(id) : null;
  const tasks = id ? getTasksByWorkOrder(id) : [];

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !workOrder) return;

    try {
      toast.info("Generating PDF...");

      // Create a clone of the content to modify for PDF
      const element = contentRef.current;
      
      // Temporarily hide buttons and interactive elements
      const buttons = element.querySelectorAll('button');
      const originalDisplay: string[] = [];
      buttons.forEach((btn, index) => {
        originalDisplay[index] = btn.style.display;
        btn.style.display = 'none';
      });

      // Capture the content as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Restore buttons
      buttons.forEach((btn, index) => {
        btn.style.display = originalDisplay[index];
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm
      
      // Add new pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Generate filename
      const filename = `WorkOrder_${workOrder.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download PDF
      pdf.save(filename);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteTask(taskId);
      toast.success("Service deleted successfully!");
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSaveExecSignature = () => {
    if (execSignatureRef.current?.isEmpty()) {
      toast.error("Please provide a signature before saving");
      return;
    }
    const signatureData = execSignatureRef.current?.toDataURL();
    updateWorkOrder(workOrder!.id, {
      executiveSignature: {
        name: workOrder!.salesExecutive || workOrder!.assignedTech || "Sales Executive",
        signedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      },
      executiveSignatureImage: signatureData,
    });
    setShowSignatureModal(false);
    setRefreshKey(prev => prev + 1);
    toast.success("Sales Executive signature saved!");
  };

  if (!workOrder) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Work Order</h2>
            <p className="text-sm text-muted-foreground">Work order not found</p>
          </div>
        </div>
        <div className="bg-card rounded-xl card-shadow p-6">
          <p className="text-sm text-muted-foreground">This work order may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">{workOrder.id}</h2>
            <p className="text-sm text-muted-foreground">{workOrder.customer}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {workOrder.status === "Authorization Pending" && (
            <button
              onClick={() => navigate(`/work-order-signature/${workOrder.id}`)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
              style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
            >
              <Edit2 className="w-4 h-4" />
              Get Authorization
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={() => navigate(`/edit-work-order/${id}`)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Work Order Details Card */}
      <div ref={contentRef} className="bg-card rounded-xl p-8 card-shadow border border-border">
        {/* Header Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">{workOrder.subject}</h1>
              <p className="text-lg text-muted-foreground mt-2">{workOrder.serviceType}</p>
            </div>
            <StatusBadge 
              label={workOrder.status} 
              variant={
                workOrder.status === "Completed" ? "neutral" : 
                workOrder.status === "Ongoing" ? "success" : 
                workOrder.status === "Upcoming" ? "info" :
                workOrder.status === "Missed" ? "destructive" :
                workOrder.status === "Cancelled" ? "neutral" :
                workOrder.status === "Converted" ? "info" :
                "warning"
              } 
            />
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Customer Info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
            <p className="text-lg font-bold text-card-foreground">{workOrder.customer}</p>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference</p>
            <p className="text-lg font-bold text-card-foreground">{workOrder.reference || workOrder.id}</p>
          </div>

          {/* Frequency */}
          {workOrder.frequency && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</p>
              <p className="text-lg font-bold text-card-foreground">{workOrder.frequency}</p>
            </div>
          )}

          {/* Work Order Incharge */}
          {workOrder.workOrderIncharge && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Order Incharge</p>
              <p className="text-lg font-bold text-primary">{workOrder.workOrderIncharge}</p>
            </div>
          )}

          {/* Assigned Tech / Sales Executives */}
          {workOrder.assignedTech && workOrder.assignedTech !== "Unassigned" && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Sales Executives</p>
              <p className="text-lg font-bold text-primary">{workOrder.assignedTech}</p>
            </div>
          )}
        </div>

        {/* Contact & Location Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Contact & Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.email || "—"}</p>
              </div>
            </div>

            {workOrder.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium text-card-foreground">{workOrder.location}</p>
                </div>
              </div>
            )}

            {workOrder.liveLocation && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Location</p>
                  <p className="text-sm font-medium text-card-foreground break-all">{workOrder.liveLocation}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Address</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.siteAddress || workOrder.address}</p>
              </div>
            </div>

            {workOrder.billingAddress && (
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing Address</p>
                  <p className="text-sm font-medium text-card-foreground">{workOrder.billingAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Information */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-success flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Value</p>
                <p className="text-lg font-bold text-success">{workOrder.totalValue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid Amount</p>
                <p className="text-lg font-bold text-warning">{workOrder.paidAmount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-lg font-bold text-card-foreground">
                  ₹ {Math.max(0, parseInt(workOrder.totalValue.replace(/[₹,]/g, "")) - parseInt(workOrder.paidAmount.replace(/[₹,]/g, ""))).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.start}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.end}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Service</p>
                <p className="text-sm font-medium text-card-foreground">{workOrder.nextService}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {workOrder.notes && (
          <div className="mb-8 pb-8 border-b border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-3">Notes</h3>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-card-foreground">{workOrder.notes}</p>
            </div>
          </div>
        )}

        {/* Customer Signature */}
        {workOrder.customerSignature && (
          <div className="mb-8 pb-8 border-b border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-3">Customer Signature</h3>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border inline-block">
              <img src={workOrder.customerSignature} alt="Customer Signature" className="max-w-md h-32" />
            </div>
          </div>
        )}

        {/* Sales Executive Signature */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              Sales Executive Signature
            </h3>
            {!workOrder.executiveSignature && (
              <button
                onClick={() => setShowSignatureModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                <Edit2 className="w-4 h-4" />
                Add Signature
              </button>
            )}
            {workOrder.executiveSignature && (
              <button
                onClick={() => setShowSignatureModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-card-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Re-sign
              </button>
            )}
          </div>

          {workOrder.executiveSignature ? (
            <div className="bg-secondary/30 rounded-lg p-5 border border-border">
              <div className="flex items-start gap-4">
                {workOrder.executiveSignatureImage && (
                  <div className="bg-white rounded-lg border border-border p-3 flex-shrink-0">
                    <img
                      src={workOrder.executiveSignatureImage}
                      alt="Executive Signature"
                      className="h-20 max-w-[200px] object-contain"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-card-foreground">{workOrder.executiveSignature.name}</p>
                  <p className="text-xs text-muted-foreground">Signed at: {workOrder.executiveSignature.signedAt}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                    <CheckCircle className="w-3 h-3" />
                    Signed
                  </span>
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

        {/* Period Information */}
        {workOrder.period && (
          <div>
            <h3 className="text-lg font-bold text-card-foreground mb-3">Period</h3>
            <p className="text-sm text-card-foreground">{workOrder.period}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        {workOrder.termsAndConditions && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-3">Terms & Conditions</h3>
            <div className="space-y-2">
              {workOrder.termsAndConditions.split("\n").filter(Boolean).map((term, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-sm font-medium text-muted-foreground flex-shrink-0">{idx + 1}.</span>
                  <p className="text-sm text-muted-foreground">{term}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              Services ({tasks.length})
            </h2>
          </div>

          {/* Service Progress */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold text-card-foreground">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-success h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-muted-foreground">Completed: <span className="font-semibold text-card-foreground">{completedTasks}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-muted-foreground">In Progress: <span className="font-semibold text-card-foreground">{inProgressTasks}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pending: <span className="font-semibold text-card-foreground">{pendingTasks}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Pricing Table */}
        {tasks.length > 0 && tasks.some(t => t.unitPrice !== undefined) && (
          <div className="mb-8 pb-8 border-b border-border overflow-x-auto">
            <h3 className="text-lg font-bold text-card-foreground mb-4">Service Pricing Details</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  {tasks.some(t => t.gst) && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GST</th>}
                  {tasks.some(t => t.cgst) && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CGST</th>}
                  {tasks.some(t => t.igst) && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">IGST</th>}
                  {tasks.some(t => t.gst || t.cgst || t.igst) && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>}
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
                      <td className="px-4 py-3 text-right text-card-foreground text-xs font-semibold">₹ {(task.unitPrice || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-card-foreground text-xs font-semibold">{task.quantity || 1}</td>
                      <td className="px-4 py-3 text-right text-card-foreground text-xs font-bold">₹ {(task.amount || 0).toLocaleString()}</td>
                      {tasks.some(t => t.gst) && <td className="px-4 py-3 text-right text-xs text-muted-foreground">{task.gst ? `${task.gst}% (₹ ${Math.round(gstAmt).toLocaleString()})` : "—"}</td>}
                      {tasks.some(t => t.cgst) && <td className="px-4 py-3 text-right text-xs text-muted-foreground">{task.cgst ? `${task.cgst}% (₹ ${Math.round(cgstAmt).toLocaleString()})` : "—"}</td>}
                      {tasks.some(t => t.igst) && <td className="px-4 py-3 text-right text-xs text-muted-foreground">{task.igst ? `${task.igst}% (₹ ${Math.round(igstAmt).toLocaleString()})` : "—"}</td>}
                      {tasks.some(t => t.gst || t.cgst || t.igst) && <td className="px-4 py-3 text-right text-xs font-bold text-primary">₹ {Math.round(rowTotal).toLocaleString()}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div className="border-t border-border bg-secondary/10 px-6 py-4 mt-4">
              <div className="ml-auto w-full max-w-xs space-y-2">
                {(() => {
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

                  return (
                    <>
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
                      <div className="pt-2 border-t border-border flex justify-between items-center">
                        <span className="text-sm font-bold text-card-foreground">Total Amount</span>
                        <span className="text-lg font-bold text-primary">₹ {Math.round(grandTotal).toLocaleString()}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Services Grid */}
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-secondary/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate(`/service/${task.id}?from=workorder`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-card-foreground">{task.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{task.description || "No description"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTaskId(task.id);
                      }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                      title="Edit service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-border">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</p>
                    {task.assignedEmployees && task.assignedEmployees.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.assignedEmployees.map((employee, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded border border-primary/20"
                          >
                            {employee}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-card-foreground mt-1">{task.assignedTo}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                    <div className="mt-1">
                      <StatusBadge
                        label={task.status}
                        variant={
                          task.status === "Completed"
                            ? "success"
                            : task.status === "In Progress"
                            ? "warning"
                            : "info"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start</p>
                      <p className="text-xs font-semibold text-card-foreground">{task.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">End</p>
                      <p className="text-xs font-semibold text-card-foreground">{task.endDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks added for this work order yet</p>
          </div>
        )}
      </div>

      {/* Edit Modals */}
      <WorkOrderEditModal
        workOrder={workOrder}
        isOpen={isEditingWorkOrder}
        onClose={() => setIsEditingWorkOrder(false)}
        onSave={() => setRefreshKey(prev => prev + 1)}
      />

      {editingTaskId && (
        <TaskEditModal
          task={tasks.find(t => t.id === editingTaskId)!}
          isOpen={!!editingTaskId}
          onClose={() => setEditingTaskId(null)}
          onSave={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {/* Sales Executive Signature Modal */}
      {showSignatureModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75">
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Sales Executive Signature</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Signing as: <span className="font-semibold text-primary">{workOrder.salesExecutive || workOrder.assignedTech || "Sales Executive"}</span>
                </p>
              </div>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-[135deg]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Please sign below to confirm your authorization of this work order.
              </p>

              {/* Signature Canvas */}
              <div className="border-2 border-border rounded-lg bg-white overflow-hidden">
                <SignatureCanvas
                  ref={execSignatureRef}
                  canvasProps={{ className: "w-full h-44" }}
                  backgroundColor="white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => execSignatureRef.current?.clear()}
                  className="flex-1 h-10 border border-border text-card-foreground text-sm font-medium hover:bg-secondary transition-colors rounded-lg"
                >
                  Clear
                </button>
                <button
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
    </div>
  );
};

export default WorkOrderDetailsPage;
