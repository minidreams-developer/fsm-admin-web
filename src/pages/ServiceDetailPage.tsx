import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, CheckCircle, Clock, AlertCircle, FileText, Edit2, Gauge, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { useTasksStore } from "@/store/tasksStore";
import { StatusBadge } from "@/components/StatusBadge";
import { TaskEditModal } from "@/components/TaskEditModal";

// Dummy odometer data with images
const dummyOdometerReadings = [
  { 
    id: 1, 
    date: "2026-02-01", 
    fromKm: 12450, 
    toKm: 12485, 
    distance: 35, 
    vehicle: "Van-01",
    fromImage: "/placeholder.svg",
    toImage: "/placeholder.svg"
  },
];

// Dummy workplace images
const workplaceImages = {
  before: "/placeholder.svg",
  after: "/placeholder.svg"
};

export const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask } = useTasksStore();
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const service = id ? getTask(id) : null;

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
      case "In Progress":
        return <Clock className="w-6 h-6 text-warning" />;
      default:
        return <AlertCircle className="w-6 h-6 text-muted-foreground" />;
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
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Main Service Details Card */}
      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        {/* Header Section */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-card-foreground mb-2">{service.title}</h1>
              {service.description && (
                <p className="text-lg text-muted-foreground">{service.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <StatusBadge
                label={service.status}
                variant={
                  service.status === "Completed"
                    ? "success"
                    : service.status === "In Progress"
                    ? "warning"
                    : "info"
                }
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
        </div>

        {/* Assignment Information */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Assignment Information</h3>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned To</p>
              {service.assignedEmployees && service.assignedEmployees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {service.assignedEmployees.map((employee, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg border border-primary/20"
                    >
                      {employee}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-lg font-bold text-primary">{service.assignedTo}</p>
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</p>
                <p className="text-lg font-medium text-card-foreground">{service.startDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</p>
                <p className="text-lg font-medium text-card-foreground">{service.endDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {service.description && (
          <div className="mb-8 pb-8 border-b border-border">
            <h3 className="text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Description
            </h3>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-card-foreground leading-relaxed">{service.description}</p>
            </div>
          </div>
        )}

        {/* Odometer Readings Section */}
        <div>
          <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Odometer Readings
          </h3>
          <div className="space-y-4">
            {dummyOdometerReadings.map((reading) => (
              <div 
                key={reading.id} 
                className="bg-secondary/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-all"
              >
                {/* Header Info */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
                      <p className="text-sm font-bold text-card-foreground mt-1">{reading.date}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle</p>
                      <p className="text-sm font-bold text-primary mt-1">{reading.vehicle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</p>
                      <p className="text-sm font-bold text-card-foreground mt-1">{reading.fromKm.toLocaleString()} km</p>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</p>
                      <p className="text-sm font-bold text-card-foreground mt-1">{reading.toKm.toLocaleString()} km</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg px-3 py-2 border border-primary/20">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Distance</p>
                      <p className="text-sm font-bold text-primary mt-1">{reading.distance} km</p>
                    </div>
                  </div>
                </div>

                {/* Odometer Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Image */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Odometer</p>
                    </div>
                    <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden border border-border group">
                      <img 
                        src={reading.fromImage} 
                        alt={`From odometer - ${reading.fromKm} km`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-semibold">{reading.fromKm.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>

                  {/* To Image */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Odometer</p>
                    </div>
                    <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden border border-border group">
                      <img 
                        src={reading.toImage} 
                        alt={`To odometer - ${reading.toKm} km`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-semibold">{reading.toKm.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Before & After Working Place Images Section */}
        <div>
          <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Before & After Working Place
          </h3>
          <div className="bg-secondary/30 rounded-lg p-4 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Image */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Before Work</p>
                </div>
                <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden border border-border group">
                  <img 
                    src={workplaceImages.before} 
                    alt="Before work"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-semibold">Before Work</p>
                  </div>
                </div>
              </div>

              {/* After Image */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">After Work</p>
                </div>
                <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden border border-border group">
                  <img 
                    src={workplaceImages.after} 
                    alt="After work"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-semibold">After Work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskEditModal
        task={service}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
};

export default ServiceDetailPage;
