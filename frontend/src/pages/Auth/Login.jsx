import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import { validateEmail, validatePassword } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';

const Login = ({ setCurrentPage, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address!");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting login for:", email);
      
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: email.toLowerCase().trim(),
        password,
      });

      console.log("✅ Login response received:", response.data);

      // Handle response structure
      if (response.data.data) {
        updateUser(response.data);
        console.log("👤 User context updated");
        
        // Close modal and navigate
        if (onSuccess) onSuccess();
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (!error.response) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
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
          type="email"
          disabled={loading}
          required
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
          disabled={loading}
          required
        />

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-md p-3'>
            <p className='text-red-600 text-sm'>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-semibold py-3 rounded-md text-sm sm:text-base transition min-h-[44px] mt-2 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Logging in...
            </div>
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <p className='text-sm text-slate-600 mt-6 text-center'>
        Don't have an account?{" "}
        <span
          onClick={() => !loading && setCurrentPage("signup")}
          className={`font-medium cursor-pointer hover:underline ${
            loading ? 'text-gray-400' : 'text-orange-500'
          }`}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
};

export default Login;