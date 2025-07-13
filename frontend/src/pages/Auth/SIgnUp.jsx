import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import ProfilePhotoSelector from '../../components/ProfilePhotoSelector';
import { validateEmail, validatePassword } from '../../utils/helper';

const SignUp = ({ setCurrentPage }) => {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    let profileImageUrl = "";
    if(!fullName) {
      setError("Please enter full name!");
      return;
    }

    if(!validateEmail(email)) {
          setError("Please enter a valid email address!");
          return;
    }
    
    if (!validatePassword(password)) {
          setError("Password must be at least 8 characters long.");
          return;
    }

    setError("");

    // SignUp API call
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
      <h3 className='text-xl sm:text-2xl font-semibold text-black mb-1'>Create Account</h3>
      <p className='text-sm sm:text-base text-slate-700 mb-2 sm:mb-6'>Join us today</p>

      <form onSubmit={handleSignUp} className='flex flex-col gap-2'>

        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

        <Input
          value={fullName}
          onChange={({ target }) => setFullName(target.value)}
          label="Full Name"
          placeholder="Your name"
          type="text"
        />

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
          type='submit'
          className='w-full bg-black hover:bg-gray-600 text-white font-semibold py-3 rounded-md text-sm sm:text-base transition min-h-[44px] mt-2'
        >
          Sign Up
        </button>
      </form>

      <p className='text-sm text-slate-600 mt-6 text-center'>
        Already have an account?{" "}
        <span
          onClick={() => setCurrentPage("login")}
          className='text-orange-500 font-medium cursor-pointer hover:underline'
        >
          Log In
        </span>
      </p>
    </div>
  );
};

export default SignUp;
