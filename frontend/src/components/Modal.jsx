import React from 'react';
import { RxCross2 } from "react-icons/rx";

const SIZE_CLASSES = {
  sm: 'max-w-[400px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[560px]',
  xl: 'max-w-[640px]',
};

const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  hideHeader,
  size = 'sm',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-end sm:items-center w-full h-full bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative flex flex-col bg-white text-gray-900 shadow-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden w-full ${SIZE_CLASSES[size] || SIZE_CLASSES.sm} max-h-[92vh] sm:max-h-[88vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-8">{title}</h3>
          </div>
        )}

        <button
          type="button"
          className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg w-9 h-9 flex justify-center items-center absolute top-3 right-3 cursor-pointer z-10 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <RxCross2 size={18} />
        </button>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
