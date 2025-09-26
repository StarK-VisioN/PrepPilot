import { useContext, useState } from "react";
import hero_img from "../assets/hero-img.png";
import { APP_FEATURES } from "../utils/data.js";
import { LuArrowRight, LuSparkles } from "react-icons/lu";
import { UserContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleC = () => {
    if (!user) {
      toast.error("Please log in or sign up to continue.");
      setOpenAuthModel(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-amber-400/10 to-orange-600/10 rounded-full blur-3xl animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-20 min-h-[80vh]">
          <div className="w-full lg:w-1/2 pr-0 lg:pr-8 mb-12 lg:mb-0 space-y-8">
            {/* AI Powered Badge */}
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                <LuSparkles className="text-lg" />
                AI Powered
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-center lg:text-left">
              <span className="text-gray-900 block mb-2">Crack Every</span>
              <span className="text-gray-900 block mb-2">Interview with</span>
              <span className="block">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent animate-gradient bg-300% bg-pos-0 hover:bg-pos-100 transition-all duration-1000">
                  AI-Powered
                </span>
              </span>
              <span className="text-gray-900 block mt-2">Preparation</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl text-center lg:text-left font-medium">
              Get tailored interview questions based on your desired role, explore
              in-depth answer explanations, master key concepts with contextual
              insights, and seamlessly organize your preparation materials — all
              in one intelligent platform.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start">
              <button
                className="bg-orange-500 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
                onClick={handleC}
              >
                Get Started
                <LuArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative group">
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl opacity-20 group-hover:rotate-12 transition-transform duration-500"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-600 rounded-full opacity-20 group-hover:-rotate-12 transition-transform duration-500"></div>
              
              {/* Main Image Container */}
              <div className="relative bg-white/30 backdrop-blur-sm p-4 rounded-3xl border border-white/40 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <img
                  src={hero_img}
                  alt="Hero"
                  className="w-full rounded-2xl object-cover border border-purple-200/50 group-hover:scale-[1.02] transition-transform duration-500"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Features That Make You{" "}
                Shine
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-12">
            {/* First Row - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {APP_FEATURES.slice(0, 3).map((feature, index) => (
                <div
                  key={feature.id}
                  className={`group relative bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 hover:border-purple-200/50 ${
                    index === 1 ? 'md:scale-105' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-orange-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Icon Placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <LuSparkles className="text-white text-2xl" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium group-hover:text-gray-700">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Second Row - 2 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {APP_FEATURES.slice(3).map((feature, index) => (
                <div
                  key={feature.id}
                  className="group relative bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 hover:border-purple-200/50"
                  style={{
                    animationDelay: `${(index + 3) * 150}ms`
                  }}
                >
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-pink-50/30 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Icon Placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <LuSparkles className="text-white text-2xl" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium group-hover:text-gray-700">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        
        .bg-300% {
          background-size: 300% 300%;
        }
        
        .bg-pos-0 {
          background-position: 0% 50%;
        }
        
        .bg-pos-100 {
          background-position: 100% 50%;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;