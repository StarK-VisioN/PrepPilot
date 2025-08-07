import React from 'react'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid grid-cols-[2fr_1fr] gap-14 my-10 mt-40 text-sm'>
            <div>
                <p className='w-full sm:w-2/3 text-gray-600 ml-15 mt-4'>
                   Interview Prep is your go-to platform for mastering interviews, building confidence, and achieving your career goals. From curated questions to expert tips and personalized guidance, we help you prepare smarter and succeed faster.</p>
            </div>

        

            <div className=' ml-35  mt-4'>
                <p className='text-xl font-medium mb-2'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>+91-22385784893</li>
                    <li>interviewPrep@gmail.com</li>
                </ul>
            </div>
        </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2025 Interview Prep.com - All Rights Reserved</p>
        </div>
    </div>
  )
}

export default Footer