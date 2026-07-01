import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';
import { UserContext } from '../context/userContext';

const PageBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-[#0b0f17]" />
    <div className="absolute inset-0 bg-gradient-to-br from-[#141c2e] via-[#0b0f17] to-[#1a1428]" />
    <div className="absolute -top-32 left-[10%] w-[520px] h-[520px] bg-orange-500/[0.12] rounded-full blur-[100px]" />
    <div className="absolute top-[20%] -right-20 w-[480px] h-[480px] bg-violet-600/[0.14] rounded-full blur-[90px]" />
    <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-indigo-500/[0.10] rounded-full blur-[80px]" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
  </div>
);

const PublicLayout = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <PageBackground />
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/10 border-t-orange-500" />
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
    <div className="min-h-screen text-slate-100 relative">
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
