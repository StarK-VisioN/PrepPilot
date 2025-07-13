import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import { validateEmail, validatePassword } from '../../utils/helper';

const Login = ({ setCurrentPage }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)) {
      setError("Please enter a valid email address!");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long.");
      return;
    }


    setError("");

    // Login API call
    try {

    } catch(error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Plz try again!");
      }
    }
  };

  return (
    <div className='w-full max-w-[400px] px-4 py-6 sm:p-7 flex flex-col mx-auto'>
      <h3 className='text-xl sm:text-2xl font-semibold text-black mb-2'>Welcome back</h3>
      <p className='text-sm sm:text-base text-slate-700 mb-6 sm:mb-8'>Please enter your details to log in</p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="xxx@gmail.com"
          type="text"
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
        />

        {error && <p className='text-red-500 text-sm pb-2.5'>{error}</p>}

        <button
          type="submit"
          className='w-full bg-black hover:bg-gray-600 text-white font-semibold py-3 rounded-md text-sm sm:text-base transition min-h-[44px] mt-2'
        >
          Log In
        </button>
      </form>

      <p className='text-sm text-slate-600 mt-6 text-center'>
        Don't have an account?{" "}
        <span
          onClick={() => setCurrentPage("signup")}
          className='text-orange-500 font-medium cursor-pointer hover:underline'
        >
          Sign Up
        </span>
      </p>
    </div>
  );
};

export default Login;