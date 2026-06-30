import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LuSparkles } from "react-icons/lu";
import Login from "./Auth/Login";
import Modal from "../components/Modal";
import SignUp from "./Auth/SIgnUp";
import ProfileInfoCard from "../components/ProfileInfoCard";
import { UserContext } from "../context/userContext";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  return (
    <>
      <div className="relative z-20">
        <div className="w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0 pointer-events-none" />

        <div className="container mx-auto px-4 pt-8 pb-6 relative">
          <header className="flex justify-between items-center gap-4">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 shrink-0"
            >
              <span className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md group-hover:scale-105 transition-transform">
                <LuSparkles size={20} />
              </span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                Interview Prep{" "}
                <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </Link>

            {user ? (
              <ProfileInfoCard />
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("login");
                    setOpenAuthModel(true);
                  }}
                  className="hidden sm:inline-flex text-sm font-semibold text-gray-700 px-4 py-2 rounded-full hover:bg-white/60 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("signup");
                    setOpenAuthModel(true);
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-sm font-semibold text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </header>
        </div>
      </div>

      <Modal
        isOpen={openAuthModel}
        onClose={() => {
          setOpenAuthModel(false);
          setCurrentPage("login");
        }}
        hideHeader
        size="md"
      >
        {currentPage === "login" && (
          <Login
            setCurrentPage={setCurrentPage}
            onSuccess={() => setOpenAuthModel(false)}
          />
        )}
        {currentPage === "signup" && (
          <SignUp
            setCurrentPage={setCurrentPage}
            onSuccess={() => setOpenAuthModel(false)}
          />
        )}
      </Modal>
    </>
  );
};

export default Navbar;
