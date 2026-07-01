import React, { useContext, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { UserContext } from "../context/userContext";

const DashboardLayout = () => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to HOME PAGE (/) if not authenticated - NOT /login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Show dashboard layout if authenticated
  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Navbar />
      <main className="pt-16 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;