import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import GoogleCallback from "./pages/Auth/GoogleCallback";
import Dashboard from "./pages/Home/Dashboard";
import InterviewPrep from "./pages/interviewPrep/InterviewPrep";
import CodingList from "./pages/coding/CodingList";
import CodingChallengePage from "./pages/coding/CodingChallengePage";
import CodingRoutesLayout from "./components/CodingRoutesLayout";
import BehavioralDashboard from "./pages/behavioral/BehavioralDashboard";
import BehavioralPracticePage from "./pages/behavioral/BehavioralPracticePage";
import BehavioralHistoryPage from "./pages/behavioral/BehavioralHistoryPage";
import MockInterviewDashboard from "./pages/mockInterview/MockInterviewDashboard";
import MockInterviewSessionPage from "./pages/mockInterview/MockInterviewSessionPage";
import MockInterviewReportPage from "./pages/mockInterview/MockInterviewReportPage";
import MockInterviewHistoryPage from "./pages/mockInterview/MockInterviewHistoryPage";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import ProfileSettings from "./pages/settings/ProfileSettings";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProvider from "./context/userContext";
import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const appContent = (
    <>
      <ToastContainer
        position="top-right"
        style={{ top: '4.5rem', zIndex: 9999 }}
      />

      <Routes>
        {/* Public Routes - Landing Page accessible to all */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route element={<CodingRoutesLayout />}>
            <Route path="/coding" element={<CodingList />} />
            <Route path="/coding/:slug" element={<CodingChallengePage />} />
          </Route>
          <Route path="/behavioral" element={<BehavioralDashboard />} />
          <Route path="/behavioral/history" element={<BehavioralHistoryPage />} />
          <Route path="/behavioral/:questionId" element={<BehavioralPracticePage />} />
          <Route path="/mock-interview" element={<MockInterviewDashboard />} />
          <Route path="/mock-interview/history" element={<MockInterviewHistoryPage />} />
          <Route path="/mock-interview/report/:sessionId" element={<MockInterviewReportPage />} />
          <Route path="/mock-interview/session/:sessionId" element={<MockInterviewSessionPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/interview-prep/:sessionId" element={<InterviewPrep />} />
        </Route>

        {/* Redirect any unknown routes to HOME PAGE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );

  return (
    <UserProvider>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          {appContent}
        </GoogleOAuthProvider>
      ) : (
        appContent
      )}
    </UserProvider>
  );
}

export default App;