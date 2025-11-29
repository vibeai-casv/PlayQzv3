import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageSkeleton } from './components/ui/PageSkeleton';

// Lazy Load Pages
// Auth
const Login = lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/auth/Signup').then(module => ({ default: module.Signup })));

// User
const Dashboard = lazy(() => import('./pages/user/Dashboard').then(module => ({ default: module.Dashboard })));
const QuizConfig = lazy(() => import('./pages/user/QuizConfig').then(module => ({ default: module.QuizConfig })));
const TakeQuiz = lazy(() => import('./pages/user/TakeQuiz').then(module => ({ default: module.TakeQuiz })));
const History = lazy(() => import('./pages/user/History').then(module => ({ default: module.History })));
const Profile = lazy(() => import('./pages/user/Profile').then(module => ({ default: module.Profile })));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(module => ({ default: module.AdminDashboard })));
const Users = lazy(() => import('./pages/admin/Users').then(module => ({ default: module.Users })));
const Questions = lazy(() => import('./pages/admin/Questions').then(module => ({ default: module.Questions })));
const Media = lazy(() => import('./pages/admin/Media').then(module => ({ default: module.Media })));
const ActivityLogs = lazy(() => import('./pages/admin/ActivityLogs').then(module => ({ default: module.ActivityLogs })));
const SystemTools = lazy(() => import('./pages/admin/SystemTools').then(module => ({ default: module.SystemTools })));

function App() {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-config"
                element={
                  <ProtectedRoute>
                    <QuizConfig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/take-quiz"
                element={
                  <ProtectedRoute>
                    <TakeQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/questions"
                element={
                  <ProtectedRoute requireAdmin>
                    <Questions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/media"
                element={
                  <ProtectedRoute requireAdmin>
                    <Media />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/activity"
                element={
                  <ProtectedRoute requireAdmin>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/system"
                element={
                  <ProtectedRoute requireAdmin>
                    <SystemTools />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
