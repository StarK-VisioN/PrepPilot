import React from "react";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return (
    <div className="relative h-[200px] overflow-hidden">
      {/* Blob background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-200 h-60 bg-lime-200 opacity-60 rounded-full blur-[100px] top-0 left-0 animate-blob1" />
        <div className="absolute w-200 h-60 bg-teal-400 opacity-60 rounded-full blur-[100px] top-10 right-0 animate-blob2" />
        <div className="absolute w-200 h-60 bg-cyan-500 opacity-50 rounded-full blur-[90px] bottom-0 left-20 animate-blob3" />
        <div className="absolute w-200 h-60 bg-fuchsia-300 opacity-50 rounded-full blur-[90px] bottom-0 right-10 animate-blob4" />
      </div>

      {/* Left and Right Blur Edge */}
      <div className="absolute top-0 left-0 h-full w-6 z-20 bg-gradient-to-r from-white via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-20 z-20 bg-gradient-to-l from-white via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-10 ml-3 md:px-0 h-full flex flex-col justify-center">
        <div className="flex items-start">
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-medium text-black">{role}</h2>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {topicsToFocus}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
            Experience: {experience} {experience === 1 ? "Year" : "Years"}
          </div>

          <div className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
            {questions} Q&A
          </div>

          <div className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleInfoHeader;
