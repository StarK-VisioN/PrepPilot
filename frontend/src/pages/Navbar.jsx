import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Login from "./Auth/Login";
import Model from "../components/Modal";
import SignUp from "./Auth/SIgnUp";
import ProfileInfoCard from "../components/ProfileInfoCard";
import { UserContext } from "../context/userContext";

const Navbar = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleC = () => {
    if(!user) {
      setOpenAuthModel(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className="w-80% min-h-full ">
        <div className="w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0"></div>

        <div className="container mx-auto px-4 pt-10 pb-[40px] relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-10">
            <div className="text-3xl font-bold text-gray-900 font-sans border-b-4 border-orange-500 pb-1">
  Interview Prep AI
</div>
            {user ? 
            (<ProfileInfoCard />) : 
                ( <button onClick={() => setOpenAuthModel(true)}
                    className="bg-orange-500 text-sm font-semibold text-white px-7 py-2 rounded-full hover:bg-black border border-yellow-500 hover:border-yellow-300 transition-color cursor-pointer"
                  >
                  Login / SignUp
                </button>
              )}
          </header>
        </div>
      </div>

      <Model
        isOpen={openAuthModel}
        onClose={() => {
          setOpenAuthModel(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div>
          {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
          {currentPage === "signup" && (<SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Model>
    </>
  );
};

export default Navbar;