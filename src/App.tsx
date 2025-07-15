import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClassesProvider } from './contexts/ClassesContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthPage } from './pages/auth/AuthPage';
import Index from './pages/Index';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentsPage } from './pages/teacher/StudentsPage';
import { ClassesPage } from './pages/teacher/ClassesPage';
import { ProfilePage } from './pages/teacher/ProfilePage';
import { SettingsPage } from './pages/teacher/SettingsPage';
import { BillingPage } from './pages/teacher/BillingPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentHomeworkPage } from './pages/student/StudentHomeworkPage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle role-based redirection
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Navigate to={user.role === 'teacher' ? '/classes' : '/student'} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ClassesProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              
              {/* Landing Page */}
              <Route path="/" element={<Index />} />
              
              {/* Teacher Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <TeacherDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/students" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <StudentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <StudentProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/classes" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <ClassesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/billing" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <BillingPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/transcripts" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Transcripciones</h2>
                      <p className="text-gray-600">Esta página se implementará próximamente</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/student/homework" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <StudentHomeworkPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/student/progress" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Progreso</h2>
                      <p className="text-gray-600">Esta página se implementará próximamente</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/student/materials" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis Materiales</h2>
                      <p className="text-gray-600">Esta página se implementará próximamente</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClassesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
