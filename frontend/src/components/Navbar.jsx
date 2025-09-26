import React from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-md">
      <div className="sm:px-4 md:px-6 lg:px-10 h-16 flex items-center justify-between">
        
        {/* Logo / Title */}
        <Link to="/dashboard" className="text-xl font-bold text-gray-800">
          Interview Prep AI
        </Link>

        {/* Profile Card */}
        <ProfileInfoCard />
      </div>
    </header>
  );
};

export default Navbar;