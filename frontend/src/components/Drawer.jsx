import React from "react";
import { LuX, LuSparkles } from "react-icons/lu";

const Drawer = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/20 md:bg-transparent md:pointer-events-none top-16"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-16 right-0 z-50 h-[calc(100dvh-4rem)] w-full sm:w-[min(480px,92vw)] md:w-[42vw] lg:w-[38vw] bg-white border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-labelledby="drawer-label"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0 bg-gradient-to-r from-cyan-50/50 to-white gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <LuSparkles size={16} className="text-cyan-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h5 id="drawer-label" className="text-sm font-bold text-gray-900">
                {title || "Deep Dive"}
              </h5>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
            aria-label="Close panel"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm">{children}</div>
      </aside>
    </>
  );
};

export default Drawer;
