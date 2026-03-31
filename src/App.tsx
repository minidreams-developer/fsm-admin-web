import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isAuthenticated } from "@/lib/auth";
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/LeadsPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceManagementPage from "./pages/ServiceManagementPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import InventoryPage from "./pages/InventoryPage";
import EmployeesPage from "./pages/EmployeesPage";
import { EmployeeDetailPage } from "./pages/EmployeeDetailPage";
import CustomersPage, { CustomerDetailPage } from "./pages/CustomersPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import ProjectsPage from "./pages/ProjectsPage";
import CreateWorkOrderPage from "./pages/CreateWorkOrderPage";
import CreateLeadPage from "./pages/CreateLeadPage";
import { LeadDetailPage } from "./pages/LeadDetailPage";
import { WorkOrderDetailsPage } from "./pages/WorkOrderDetailsPage";
import BranchesPage from "./pages/BranchesPage";
import ProductsPage from "./pages/ProductsPage";
import RolesPage from "./pages/RolesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/new" element={<CreateLeadPage />} />
              <Route path="/leads/:id" element={<LeadDetailPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/create-work-order" element={<CreateWorkOrderPage />} />
              <Route path="/work-order/:id" element={<WorkOrderDetailsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/service-management" element={<ServiceManagementPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/roles" element={<RolesPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
