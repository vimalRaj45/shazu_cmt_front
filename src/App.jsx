import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OrcidCallback from './pages/auth/OrcidCallback';

// Main Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ConferenceListPage from './pages/conferences/ConferenceListPage';
import ConferenceDetailPage from './pages/conferences/ConferenceDetailPage';

// Author Pages
import AuthorSubmissionsPage from './pages/submissions/AuthorSubmissionsPage';
import CreateSubmissionPage from './pages/submissions/CreateSubmissionPage';
import SubmissionDetailPage from './pages/submissions/SubmissionDetailPage';

// Reviewer Pages
import ReviewerWorkspacePage from './pages/reviewer/ReviewerWorkspacePage';

// Chair Pages
import ChairSubmissionsPage from './pages/chair/ChairSubmissionsPage';
import ReviewerAssignmentPage from './pages/chair/ReviewerAssignmentPage';
import DecisionsPage from './pages/chair/DecisionsPage';
import CameraReadyPage from './pages/chair/CameraReadyPage';
import EmailBroadcastPage from './pages/emails/EmailBroadcastPage';
import ReportsPage from './pages/reports/ReportsPage';

// Common Pages
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import GuidePage from './pages/guide/GuidePage';
import ProfilePage from './pages/profile/ProfilePage';

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/orcid/callback" element={<OrcidCallback />} />

        {/* Protected Dashboard & App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/conferences" element={<ConferenceListPage />} />
          <Route path="/conference/details" element={<ConferenceDetailPage />} />

          {/* Author */}
          <Route path="/my-submissions" element={<AuthorSubmissionsPage />} />
          <Route path="/submit-paper" element={<CreateSubmissionPage />} />
          <Route path="/submission/:id" element={<SubmissionDetailPage />} />

          {/* Reviewer */}
          <Route path="/reviewer/workspace" element={<ReviewerWorkspacePage />} />

          {/* Admin & Publication Management */}
          <Route path="/chair/submissions" element={<ChairSubmissionsPage />} />
          <Route path="/chair/reviewers" element={<ReviewerAssignmentPage />} />
          <Route path="/chair/decisions" element={<DecisionsPage />} />
          <Route path="/chair/camera-ready" element={<CameraReadyPage />} />
          <Route path="/chair/emails" element={<EmailBroadcastPage />} />
          <Route path="/chair/reports" element={<ReportsPage />} />

          {/* Announcements & User Guide & Profile */}
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
