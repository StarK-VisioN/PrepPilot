import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Input = ({ value, onChange, label, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='mb-3 w-full'>
      <label className='block text-sm font-medium text-slate-800 mb-1'>{label}</label>
      <div className='relative'>
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className='w-full border border-gray-300 rounded-md px-2 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 min-h-[44px]'
          value={value}
          onChange={(e) => onChange(e)}
        />
        {type === "password" && (
          <div className='absolute inset-y-0 right-3 flex items-center cursor-pointer'>
            {showPassword ? (
              <FaRegEye size={20} className='text-gray-600' onClick={togglePassword} />
            ) : (
              <FaRegEyeSlash size={20} className='text-gray-600' onClick={togglePassword} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;