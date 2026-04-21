import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/LeadsPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceManagementPage from "./pages/ServiceManagementPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import InventoryPage from "./pages/InventoryPage";
import StockAllocationPage from "./pages/StockAllocationPage";
import EmployeesPage from "./pages/EmployeesPage";
import { EmployeeDetailPage } from "./pages/EmployeeDetailPage";
import EmployeeReassignPage from "./pages/EmployeeReassignPage";
import CustomersPage, { CustomerDetailPage } from "./pages/CustomersPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import ProjectsPage from "./pages/ProjectsPage";
import CreateWorkOrderPage from "./pages/CreateWorkOrderPage";
import EditWorkOrderPage from "./pages/EditWorkOrderPage";
import CreateLeadPage from "./pages/CreateLeadPage";
import { LeadDetailPage } from "./pages/LeadDetailPage";
import { WorkOrderDetailsPage } from "./pages/WorkOrderDetailsPage";
import { ServiceDetailPage } from "./pages/ServiceDetailPage";
import BranchesPage from "./pages/BranchesPage";
import ProductsPage from "./pages/ProductsPage";
import RolesPage from "./pages/RolesPage";
import QuantCalendarPage from "./pages/QuantCalendarPage";
import TaskManagementPage from "./pages/TaskManagementPage";
import WorkOrderSignaturePage from "./pages/WorkOrderSignaturePage";
import BulkAssignPage from "./pages/BulkAssignPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/work-order-signature/:id" element={<WorkOrderSignaturePage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/new" element={<CreateLeadPage />} />
              <Route path="/leads/:id" element={<LeadDetailPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/bulk-assign" element={<BulkAssignPage />} />
              <Route path="/create-work-order" element={<CreateWorkOrderPage />} />
              <Route path="/edit-work-order/:id" element={<EditWorkOrderPage />} />
              <Route path="/work-order/:id" element={<WorkOrderDetailsPage />} />
              <Route path="/service/:id" element={<ServiceDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/service-management" element={<ServiceManagementPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/allocate" element={<StockAllocationPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailPage />} />
              <Route path="/employees/:id/reassign" element={<EmployeeReassignPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/quant-calendar" element={<QuantCalendarPage />} />
              <Route path="/task-management" element={<TaskManagementPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
