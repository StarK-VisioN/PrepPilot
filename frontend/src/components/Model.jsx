import React from 'react';
import { RxCross2 } from "react-icons/rx";

const Model = ({ children, isOpen, onClose, title, hideHeader}) => {
    if(!isOpen) return null;
    
  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/40'>
      {/* Modal Content */}
      <div className='relative flex flex-col bg-white shadow-lg rounded-xl overflow-hidden w-full max-w-[400px] min-h-[350px] max-h-[90vh] sm:max-h-[80vh]'>
        
        {/* Modal Header */}
        {!hideHeader && (
          <div className='flex items-center justify-between p-4 pb-3 border-b border-gray-200'>
            <h3 className='text-base sm:text-lg font-medium text-gray-900 pr-8'>{title}</h3>
          </div>
        )}

        {/* Close Button */}
        <button
          type='button'
          className='text-gray-400 bg-transparent hover:bg-orange-100 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center absolute top-3 right-3 cursor-pointer z-10'
          onClick={onClose}
        >
          <RxCross2 size={18} />
        </button>

        {/* Modal Body */}
        <div className='flex-1 overflow-y-auto custom-scrollbar'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Model;