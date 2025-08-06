import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Home/Dashboard";
import InterviewPrep from "./pages/interviewPrep/InterviewPrep";
import { ToastContainer } from 'react-toastify';
import UserProvider from "./context/userContext";
import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";


function App() {
  return (
    <UserProvider>
      <ToastContainer />

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview-prep/:sessionId" element={<InterviewPrep />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
