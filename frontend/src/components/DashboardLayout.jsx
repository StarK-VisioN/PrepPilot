import React, { useContext, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import PageBackground from "./PageBackground";
import { UserContext } from "../context/userContext";
import { SPINNER } from "../utils/theme";

const DashboardLayout = () => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <PageBackground />
        <div className="flex flex-col items-center">
          <div className={`h-12 w-12 ${SPINNER} mb-4`} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen text-gray-900 relative">
      <PageBackground />
      <Navbar />
      <main className="pt-16 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
