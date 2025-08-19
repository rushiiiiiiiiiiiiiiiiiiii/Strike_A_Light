import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import IndividualDashboard from "./pages/IndividualDashboard";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import StudentDetails from "./pages/StudentDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Individual Dashboard */}
            <Route 
              path="/dashboard/individual" 
              element={
                <ProtectedRoute allowedRoles={['individual']}>
                  <IndividualDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Institution Dashboard */}
            <Route 
              path="/dashboard/institution" 
              element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Student Details page (for institution users) */}
            <Route 
              path="/students/:id" 
              element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <StudentDetails />
                </ProtectedRoute>
              } 
            />

            {/* Super Admin Dashboard */}
            <Route 
              path="/dashboard/super-admin" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
