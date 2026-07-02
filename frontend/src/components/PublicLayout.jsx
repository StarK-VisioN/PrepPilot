import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';
import { UserContext } from '../context/userContext';

const PageBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-[#f2f2f0]" />
    <div className="absolute -top-32 left-[10%] w-[520px] h-[520px] bg-orange-300/30 rounded-full blur-[100px]" />
    <div className="absolute top-[20%] -right-20 w-[480px] h-[480px] bg-violet-300/25 rounded-full blur-[90px]" />
    <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-[80px]" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
  </div>
);

const PublicLayout = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <PageBackground />
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  const isLoginPage = window.location.pathname === '/login';
  if (isLoginPage && user) {
    if (sessionStorage.getItem("codingIntent")) {
      sessionStorage.removeItem("codingIntent");
      return <Navigate to="/coding" replace />;
    }
    if (sessionStorage.getItem("behavioralIntent")) {
      sessionStorage.removeItem("behavioralIntent");
      return <Navigate to="/behavioral" replace />;
    }
    if (sessionStorage.getItem("mockInterviewIntent")) {
      sessionStorage.removeItem("mockInterviewIntent");
      return <Navigate to="/mock-interview" replace />;
    }
    if (sessionStorage.getItem("analyticsIntent")) {
      sessionStorage.removeItem("analyticsIntent");
      return <Navigate to="/analytics" replace />;
    }
    const pendingIntent = sessionStorage.getItem("createSessionIntent");
    return <Navigate to={pendingIntent ? "/dashboard" : "/"} replace />;
  }

  return (
    <div className="min-h-screen text-gray-900 relative">
      <PageBackground />
      <div className="relative z-10 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[8vw]">
        <Navbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default PublicLayout;
