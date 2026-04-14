import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useProjectsStore } from "@/store/projectsStore";
import { useTasksStore } from "@/store/tasksStore";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

const WorkOrderSignaturePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkOrder, updateWorkOrder } = useProjectsStore();
  const { getTasksByWorkOrder } = useTasksStore();
  const workOrder = getWorkOrder(id || "");
  const tasks = id ? getTasksByWorkOrder(id) : [];
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (workOrder?.customerSignature) {
      setIsSigned(true);
    }
  }, [workOrder]);

  if (!workOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Work Order Not Found</h1>
          <p className="text-gray-600">The work order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = () => {
    if (signatureRef.current?.isEmpty()) {
      toast.error("Please provide a signature");
      return;
    }

    const signatureData = signatureRef.current?.toDataURL();
    updateWorkOrder(workOrder.id, {
      customerSignature: signatureData,
      status: "Open"
    });
    setIsSigned(true);
    toast.success("Signature submitted successfully! Status changed to Open.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Work Order Authorization</h1>
          <p className="text-sm text-gray-600">Please review the work order details and provide your signature to authorize.</p>
        </div>

        {/* Work Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Work Order Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Work Order ID</p>
              <p className="text-sm font-semibold text-gray-900">{workOrder.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Customer Name</p>
              <p className="text-sm font-semibold text-gray-900">{workOrder.customer}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
              <p className="text-sm text-gray-900">{workOrder.phone}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-900">{workOrder.email || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
              <p className="text-sm text-gray-900">{workOrder.address}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
              <p className="text-sm text-gray-900">{workOrder.subject}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Service Type</p>
              <p className="text-sm text-gray-900">{workOrder.serviceType}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Frequency</p>
              <p className="text-sm text-gray-900">{workOrder.frequency}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Start Date</p>
              <p className="text-sm text-gray-900">{workOrder.start}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">End Date</p>
              <p className="text-sm text-gray-900">{workOrder.end}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Value</p>
              <p className="text-sm font-semibold text-gray-900">{workOrder.totalValue}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Paid Amount</p>
              <p className="text-sm font-semibold text-gray-900">{workOrder.paidAmount}</p>
            </div>
          </div>

          {workOrder.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-900">{workOrder.notes}</p>
            </div>
          )}
        </div>

        {/* Services Section */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Services Included</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-200 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
                      <td className="px-4 py-3 text-gray-600">{task.startDate || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{task.endDate || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{task.assignedTo || "Unassigned"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                          task.status === "Completed" 
                            ? "bg-green-100 text-green-800 border border-green-200" 
                            : task.status === "In Progress"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signature Section */}
        {!isSigned ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Signature</h2>
            <p className="text-sm text-gray-600 mb-4">Please sign below to authorize this work order:</p>
            
            <div className="border-2 border-gray-300 rounded-lg mb-4 bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: "w-full h-48 rounded-lg",
                }}
                backgroundColor="white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors rounded-lg"
              >
                Clear
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                Submit Signature
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Signature Submitted Successfully!</h2>
              <p className="text-sm text-gray-600 mb-6">Thank you for authorizing this work order. The status has been changed to "Open".</p>
              
              {workOrder.customerSignature && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 mb-2">Your Signature:</p>
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 inline-block">
                    <img src={workOrder.customerSignature} alt="Customer Signature" className="max-w-md h-32" />
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/work-order/${workOrder.id}`)}
                className="px-6 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
              >
                Back to Work Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderSignaturePage;
