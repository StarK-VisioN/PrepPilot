import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuChevronDown,
  LuLogOut,
  LuLayoutDashboard,
  LuUser,
  LuSparkles,
  LuCode,
  LuMessageSquare,
  LuMic,
  LuChartBar,
} from 'react-icons/lu';

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    clearUser();
    toast.success('Successfully logged out!');
    navigate('/', { replace: true });
  };

  const goToDashboard = () => {
    setOpen(false);
    navigate('/dashboard');
  };

  if (!user) return null;

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-200 ${
          open
            ? 'bg-white border-orange-200 shadow-md ring-2 ring-orange-100'
            : 'bg-white/80 border-gray-200/80 hover:border-orange-200 hover:shadow-sm backdrop-blur-sm'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white">
            {initials}
          </div>
        )}

        <div className="hidden sm:block text-left min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate max-w-[120px]">
            {firstName}
          </p>
          <p className="text-[10px] text-gray-500 leading-tight flex items-center gap-0.5">
            <LuSparkles size={9} className="text-orange-500" />
            Prep member
          </p>
        </div>

        <LuChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-orange-500' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 overflow-hidden">
            {/* User info header */}
            <div className="px-4 py-4 bg-gradient-to-br from-orange-50 via-white to-purple-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow ring-2 ring-white">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <button
                type="button"
                onClick={goToDashboard}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors">
                  <LuLayoutDashboard size={16} />
                </span>
                My Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/coding');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors">
                  <LuCode size={16} />
                </span>
                Coding Round
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/behavioral');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-indigo-100 transition-colors">
                  <LuMessageSquare size={16} />
                </span>
                STAR Behavioral
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/mock-interview');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-violet-100 transition-colors">
                  <LuMic size={16} />
                </span>
                Mock Interview
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/analytics');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-cyan-100 transition-colors">
                  <LuChartBar size={16} />
                </span>
                Analytics
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/dashboard', {
                    state: { openCreate: true, generationMode: 'manual', company: 'generic' },
                  });
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <LuUser size={16} />
                </span>
                New Prep Session
              </button>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                  <LuLogOut size={16} />
                </span>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoCard;
