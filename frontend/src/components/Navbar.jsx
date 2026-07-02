import React from 'react';
import { Link } from 'react-router-dom';
import { LuSparkles } from 'react-icons/lu';
import ProfileInfoCard from './ProfileInfoCard';

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="sm:px-4 md:px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform">
            <LuSparkles size={16} />
          </span>
          <span className="text-lg font-bold text-black group-hover:text-gray-700 transition-colors">
            Interview Prep{' '}
            <span className="text-blue-600">AI</span>
          </span>
        </Link>

        <ProfileInfoCard />
      </div>
    </header>
  );
};

export default Navbar;
