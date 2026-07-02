import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Login from "./Auth/Login";
import ForgotPassword from "./Auth/ForgotPassword";
import Modal from "../components/Modal";
import SignUp from "./Auth/SIgnUp";
import ProfileInfoCard from "../components/ProfileInfoCard";
import BrandLogo from "../components/BrandLogo";
import { UserContext } from "../context/userContext";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  return (
    <>
      <div className="relative z-20">
        <div className="container mx-auto px-4 pt-8 pb-6 relative">
          <header className="flex justify-between items-center gap-4">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 shrink-0"
            >
              <BrandLogo size="lg" className="group-hover:scale-105 transition-transform" />
              <span className="text-xl sm:text-2xl font-bold text-black">
                Interview Prep{" "}
                <span className="text-blue-600">AI</span>
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
                  className="hidden sm:inline-flex text-sm font-semibold text-black px-4 py-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("signup");
                    setOpenAuthModel(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white px-5 py-2.5 rounded-full shadow-md transition-all"
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
        {currentPage === "forgot" && (
          <ForgotPassword setCurrentPage={setCurrentPage} />
        )}
      </Modal>
    </>
  );
};

export default Navbar;
