import React from "react"
import { Route, Router, Routes } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Auth/Login"
import Dashboard from "./pages/Home/Dashboard"
import InterviewPrep from "./pages/interviewPrep/InterviewPrep"
import { ToastContainer, toast } from 'react-toastify';
import Footer from "./pages/Footer"
import Navbar from "./pages/Navbar"


function App() {

  return (
    <>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[8vw] bg-[#d8c2ec]">
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          {/* <Route path="/login" element={<Login/>} /> */}
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/interview-prep/:sessionId" element={<InterviewPrep/>} />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
