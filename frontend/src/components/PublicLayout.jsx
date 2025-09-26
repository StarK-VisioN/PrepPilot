import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';
import { UserContext } from '../context/userContext';

const PublicLayout = () => {
  const { user, loading } = useContext(UserContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#d8c2ec]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is on login page and authenticated, redirect to dashboard
  // But allow landing page to be visible even if authenticated
  const isLoginPage = window.location.pathname === '/login';
  if (isLoginPage && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show public layout (landing page should be visible to all)
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[8vw] bg-[#d8c2ec] min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default PublicLayout;