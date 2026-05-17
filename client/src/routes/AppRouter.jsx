import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const StudentsPage = lazy(() => import('../pages/student/StudentsPage'));
const FacultyPage = lazy(() => import('../pages/faculty/FacultyPage'));
const AttendancePage = lazy(() => import('../pages/admin/AttendancePage'));
const SubjectsPage = lazy(() => import('../pages/admin/SubjectsPage'));
const TimetablePage = lazy(() => import('../pages/admin/TimetablePage'));
const ResultsPage = lazy(() => import('../pages/admin/ResultsPage'));
const AssignmentsPage = lazy(() => import('../pages/admin/AssignmentsPage'));
const FeesPage = lazy(() => import('../pages/admin/FeesPage'));
const NotificationsPage = lazy(() => import('../pages/admin/NotificationsPage'));
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="fees" element={<FeesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
