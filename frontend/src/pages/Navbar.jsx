import React from 'react'

import { useNavigate } from "react-router-dom";
import { useState } from "react";
const Navbar = () => {

      const navigate = useNavigate();

  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleC = () => {};


  return (
    <div className="w-80% min-h-full ">
          <div className="w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0"></div>
          
          <div className="container mx-auto px-4 pt-10 pb-[40px] relative z-10">
          {/* Header */}
            <header className="flex justify-between items-cnter mb-16">
              <div className="text-xl text-black font-bold">Interview Prep AI</div>
              <button onClick={() => setOpenAuthModel(true)}
                    className="bg-orange-500 text-sm font-semibold text-white px-7 py-2 rounded-full hover:bg-black hover:text-white border border-white transition-color cursor-pointer"
                >Login / SignUp</button>
            </header>
    
            
          </div>
        </div>
  )
}

export default Navbar