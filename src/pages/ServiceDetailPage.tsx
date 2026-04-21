import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, CheckCircle, Clock, AlertCircle, FileText, Edit2, Download } from "lucide-react";
import { useState, useRef } from "react";
import { useServicesStore } from "@/store/servicesStore";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceFormModal } from "@/components/ServiceFormModal";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";

export const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments } = useServicesStore();
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const service = appointments.find(apt => apt.id === id);

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !service) return;

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
      const filename = `Service_${service.refNo || service.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download PDF
      pdf.save(filename);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF");
    }
  };

  if (!service) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Service Details</h2>
            <p className="text-sm text-muted-foreground">Service not found</p>
          </div>
        </div>
        <div className="bg-card rounded-xl card-shadow p-6">
          <p className="text-sm text-muted-foreground">This service may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (service.status) {
      case "Completed":
        return <CheckCircle className="w-6 h-6 text-success" />;
      case "Scheduled":
        return <Clock className="w-6 h-6 text-warning" />;
      default:
        return <AlertCircle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusVariant = () => {
    switch (service.status) {
      case "Completed":
        return "success";
      case "Scheduled":
        return "info";
      case "Cancelled":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Service Details</h2>
            <p className="text-sm text-muted-foreground">{service.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Main Service Details Card */}
      <div ref={contentRef} className="bg-card rounded-xl p-8 card-shadow border border-border">
        {/* Header Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-card-foreground mb-2">{service.subject || "Service Appointment"}</h1>
              {service.serviceDescription && (
                <p className="text-lg text-muted-foreground">{service.serviceDescription}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <StatusBadge
                label={service.status}
                variant={getStatusVariant()}
              />
            </div>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Service ID */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service ID</p>
            <p className="text-lg font-bold text-card-foreground">{service.id}</p>
          </div>

          {/* Reference No */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference No</p>
            <p className="text-lg font-bold text-primary">{service.refNo || "—"}</p>
          </div>

          {/* Work Order */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Order</p>
            <p className="text-lg font-bold text-primary">{service.workOrderId}</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Status</p>
            <p className="text-lg font-bold text-card-foreground">{service.status}</p>
          </div>

          {/* Warranty Period */}
          {service.warrantyPeriod && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warranty Period</p>
              <p className="text-lg font-bold text-card-foreground">{service.warrantyPeriod}</p>
            </div>
          )}

          {/* Sales Executive */}
          {service.salesExecutive && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sales Executive</p>
              <p className="text-lg font-bold text-card-foreground">{service.salesExecutive}</p>
            </div>
          )}
        </div>

        {/* Assignment Information */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Assignment Information</h3>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned To</p>
              {service.technicians && service.technicians.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {service.technicians.map((technician, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg border border-primary/20"
                    >
                      {technician}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-lg font-bold text-primary">{service.employeeName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
                <p className="text-lg font-medium text-card-foreground">{service.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</p>
                <p className="text-lg font-medium text-card-foreground">{service.time}</p>
              </div>
            </div>

            {service.inTime && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Time</p>
                  <p className="text-lg font-medium text-card-foreground">{service.inTime}</p>
                </div>
              </div>
            )}

            {service.outTime && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Out Time</p>
                  <p className="text-lg font-medium text-card-foreground">{service.outTime}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        {service.serviceDescription && (
          <div className="mb-8 pb-8 border-b border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Service Description
            </h3>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">{service.serviceDescription}</p>
            </div>
          </div>
        )}

        {/* Instructions Section */}
        {service.instructions && (
          <div>
            <h3 className="text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Instructions
            </h3>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">{service.instructions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ServiceFormModal
        open={isEditing}
        mode="edit"
        appointment={service}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
};

export default ServiceDetailPage;
