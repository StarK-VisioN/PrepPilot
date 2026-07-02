import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';
import PageBackground from './PageBackground';
import { UserContext } from '../context/userContext';
import { SPINNER } from '../utils/theme';

const PublicLayout = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <PageBackground />
        <div className={`h-12 w-12 ${SPINNER}`} />
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
