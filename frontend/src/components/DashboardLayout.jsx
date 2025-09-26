import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import { UserContext } from "../context/userContext";

const DashboardLayout = () => {
  const { user, loading } = useContext(UserContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-100 to-teal-100 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-30 blur-lg"></div>
      </div>

      <Navbar />
      <div className=" p-13 pt-0 relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;