import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { useProjectsStore, type WorkOrder } from "@/store/projectsStore";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkOrderDetailsModal } from "@/components/WorkOrderDetailsModal";
import { PaymentUpdateModal } from "@/components/PaymentUpdateModal";

const statusMap = { "Open": "warning", "Scheduled": "info", "Completed": "success" } as const;

const PaymentsPage = () => {
  const { workOrders } = useProjectsStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Scheduled" | "Completed">("All");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | undefined>(
    workOrders.length > 0 ? workOrders[0] : undefined
  );

  const filtered = workOrders.filter((wo) => {
    const matchStatus = statusFilter === "All" || wo.status === statusFilter;
    const matchSearch = 
      wo.subject?.toLowerCase().includes(search.toLowerCase()) ||
      wo.customer?.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    totalRevenue: workOrders.reduce((sum, w) => sum + (parseFloat(w.totalValue?.replace(/[₹,]/g, '') || '0')), 0),
    pendingPayment: workOrders.filter(w => w.status !== "Completed").length,
    toCollect: workOrders.filter(w => w.status === "Open").length,
  };

  const getBalancePayment = (workOrder: WorkOrder) => {
    const total = parseFloat(workOrder.totalValue?.replace(/[₹,]/g, '') || '0');
    const paid = parseFloat(workOrder.paidAmount?.replace(/[₹,]/g, '') || '0');
    return Math.max(0, total - paid);
  };

  const handleViewDetails = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
  };

  const getPaymentHistory = (workOrder: WorkOrder) => {
    const paidAmount = parseFloat(workOrder.paidAmount?.replace(/[₹,]/g, '') || '0');
    if (paidAmount === 0) return [];
    
    // Generate sample payment history based on paid amount
    const payments = [];
    const halfAmount = Math.round(paidAmount / 2);
    
    if (halfAmount > 0) {
      payments.push({
        method: "Cash",
        paymentId: `manual_${workOrder.id}_001`,
        amount: halfAmount,
        date: "10-02-2026",
        paidBy: "Arun-Itboomi"
      });
    }
    
    if (paidAmount - halfAmount > 0) {
      payments.push({
        method: "UPI",
        paymentId: `payment_${workOrder.id}_002`,
        amount: paidAmount - halfAmount,
        date: "10-02-2026",
        paidBy: "-/-"
      });
    }
    
    return payments;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Payments</h2>
          <p className="text-sm text-muted-foreground">Manage payment details and work orders</p>
        </div>
      </div>

      {/* Overview Section */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">₹</span>
              </div>
              <p className="text-xs font-medium text-blue-700">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">₹{stats.totalRevenue.toLocaleString()}.00</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">⏳</span>
              </div>
              <p className="text-xs font-medium text-blue-700">Total Pending Payment</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">₹{(stats.pendingPayment * 50000).toLocaleString()}.00</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">📊</span>
              </div>
              <p className="text-xs font-medium text-blue-700">To Be Collect From</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.toCollect}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Work Orders List */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl card-shadow overflow-hidden border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-card-foreground">Projects</h3>
                <button className="p-1 hover:bg-secondary rounded transition-colors">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search Projects" 
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
            </div>
            <div className="space-y-2 p-3 max-h-[600px] overflow-y-auto">
              {filtered.map((wo) => (
                <button
                  key={wo.id}
                  onClick={() => handleViewDetails(wo)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedWorkOrder?.id === wo.id
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-secondary/50 hover:bg-secondary border border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm text-card-foreground">{wo.subject}</p>
                    <StatusBadge label={wo.status} variant={statusMap[wo.status as keyof typeof statusMap] || "neutral"} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{wo.id}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-primary">{wo.totalValue}</p>
                    <p className="text-xs text-muted-foreground">{wo.end}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Payment Details */}
        <div className="lg:col-span-2">
          {selectedWorkOrder ? (
            <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
              <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-card-foreground">Payment Details</h3>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
                    style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
                  >
                    Update Payments
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Project</p>
                    <p className="font-semibold text-card-foreground">{selectedWorkOrder.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Customer Name / Mobile No.</p>
                    <p className="font-semibold text-card-foreground">{selectedWorkOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Project Value</p>
                    <p className="font-semibold text-primary">{selectedWorkOrder.totalValue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Balance Payment</p>
                    <p className="font-semibold text-primary">₹{getBalancePayment(selectedWorkOrder).toLocaleString()}.00</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Project ID</p>
                    <p className="font-semibold text-card-foreground">{selectedWorkOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                    <p className="font-semibold text-card-foreground">{selectedWorkOrder.end}</p>
                  </div>
                </div>
              </div>

              {/* Payment History Table */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-card-foreground mb-4">Payment History</h4>
                {getPaymentHistory(selectedWorkOrder).length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Payment Method</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Payment ID</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Total Amount (₹)</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Date</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Payment By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaymentHistory(selectedWorkOrder).map((payment, idx) => (
                          <tr key={idx} className="border-b border-border hover:bg-secondary/30">
                            <td className="px-3 py-2 text-card-foreground">{payment.method}</td>
                            <td className="px-3 py-2 text-muted-foreground text-xs truncate">{payment.paymentId}</td>
                            <td className="px-3 py-2 text-primary font-semibold">{payment.amount.toLocaleString()}.00</td>
                            <td className="px-3 py-2 text-muted-foreground">{payment.date}</td>
                            <td className="px-3 py-2 text-muted-foreground">{payment.paidBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No payments recorded yet</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl card-shadow border border-border p-12 flex items-center justify-center min-h-[400px]">
              <p className="text-muted-foreground">Select a project to view payment details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <WorkOrderDetailsModal 
        open={showDetailsModal}
        workOrder={selectedWorkOrder}
        onClose={() => setShowDetailsModal(false)}
      />
      <PaymentUpdateModal 
        open={showPaymentModal}
        workOrder={selectedWorkOrder}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default PaymentsPage;
