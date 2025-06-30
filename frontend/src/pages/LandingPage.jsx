import { useState } from "react";
import hero_img from "../assets/hero-img.png";
import { APP_FEATURES } from "../utils/data.js";
import { LuSparkles } from "react-icons/lu";


const LandingPage = () => {
  const [currentPage, setCurrentPage] = useState("login");

  const handleC = () => {};
  return (
    <>
    {/* Hero Content */}
            <div className="flex flex-col md:flex-row items-center mb-30">
              <div className="w-full md:w-1/2 pr-4 mb-8 md:mb-0">
                <div className="flex items-center justify-left mb-2">
                  <div className="flex items-center gap-2 text-[13px] text-amber-500 font-semibold bg-amber-100 px-3 py-1 mb-5 rounded-full border border-amber-300"><LuSparkles />AI Powered</div>
                </div>
                <h1 className="text-5xl text-black font-medium mb-3 leading-tight">
                  Ace Interviews with <br /> <span className="text-transparent bg-clip-text bg-gray-500">AI-Powered</span>{" "}
                  Learning
                </h1>
              </div>
    
              <div className="w-full md:w-1/2 ">
                <p className="text-[17px] text-gray-700 font-semibold mr-0 md:mr-20 mt-20 mb-6">
                  Get role-specified questions, expand answers when you need them,
                  dive deeper into concepts, and organise everything your way.
                </p>
                <button className="bg-orange-500 text-white rounded-full font-semibold px-7 py-2.5 hover:bg-black  border border-yellow-500 hover:border-yellow-300 transition-colors cursor-pointer" onClick={handleC}>
                  Get Started
                </button>
              </div>
            </div>

{/* Hero Img */}
    <div className="w-full min-h-full relative z-10">
      <div>
        <section className="flex items-center justify-center ">
          <img src={hero_img} className="w-[80vh] rounded-lg" alt="" />
        </section>
      </div>
    
    {/* cards */}
      <div className="w-full min-h-full mt-15">
        <div className="container mx-auto px-4 pt-10 pb-3">
          <section className="mt-5">
            <h2 className="text-2xl font-medium text-center mb-12">Features That Make You Shine</h2>
            <div className="flex flex-col items-center gap-8">
              {/* 1st 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">{APP_FEATURES.slice(0,3).map((feature) => (
                <div key={feature.id} className="bg-[#fffef8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100">
                  <h3 className="text-base font-bold mb-3 text-gray-700">{feature.title}</h3>
                  <p className="text-gray-600 font-semibold">{feature.description}</p>
                </div>
               ))}
              </div>

               {/* Remaining 2 cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{APP_FEATURES.slice(3).map((feature) => (
                <div key={feature.id} className="bg-[#fffef8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100">
                  <h3 className="text-base font-bold mb-3 text-gray-700">{feature.title}</h3>
                  <p className="text-gray-600 font-semibold">{feature.description}</p>
                </div>
               ))}
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
    </>
  );
};

export default LandingPage;
