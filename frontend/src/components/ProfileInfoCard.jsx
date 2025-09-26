import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    toast.success('Successfully logged out!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    // Redirect to HOME PAGE (/)
    navigate('/', { replace: true });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {user?.profileImageUrl ? (
          <img 
            src={user.profileImageUrl} 
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <span className="text-gray-700 hidden md:inline">{user?.name}</span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileInfoCard;