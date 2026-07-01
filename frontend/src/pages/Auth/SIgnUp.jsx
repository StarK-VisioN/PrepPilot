import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import { validateEmail, validatePassword } from '../../utils/helper';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const SignUp = ({ setCurrentPage, onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!fullName.trim()) {
      setError("Please enter full name!");
      setLoading(false);
      return;
    }

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
      console.log("📝 Attempting registration for:", email);

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
        profileImageUrl: "",
      });

      console.log("✅ Registration response:", response.data);

      // Handle both response structures
      if (response.data.success && response.data.data) {
        updateUser(response.data);
        console.log("👤 User context updated");
        
        if (onSuccess) {
          onSuccess();
        } else if (sessionStorage.getItem("codingIntent")) {
          sessionStorage.removeItem("codingIntent");
          navigate("/coding", { replace: true });
        } else if (sessionStorage.getItem("behavioralIntent")) {
          sessionStorage.removeItem("behavioralIntent");
          navigate("/behavioral", { replace: true });
        } else if (sessionStorage.getItem("mockInterviewIntent")) {
          sessionStorage.removeItem("mockInterviewIntent");
          navigate("/mock-interview", { replace: true });
        } else if (sessionStorage.getItem("analyticsIntent")) {
          sessionStorage.removeItem("analyticsIntent");
          navigate("/analytics", { replace: true });
        } else if (sessionStorage.getItem("createSessionIntent")) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else if (response.data.token) {
        updateUser(response.data);
        console.log("👤 User context updated");
        
        if (onSuccess) {
          onSuccess();
        } else if (sessionStorage.getItem("codingIntent")) {
          sessionStorage.removeItem("codingIntent");
          navigate("/coding", { replace: true });
        } else if (sessionStorage.getItem("behavioralIntent")) {
          sessionStorage.removeItem("behavioralIntent");
          navigate("/behavioral", { replace: true });
        } else if (sessionStorage.getItem("mockInterviewIntent")) {
          sessionStorage.removeItem("mockInterviewIntent");
          navigate("/mock-interview", { replace: true });
        } else if (sessionStorage.getItem("analyticsIntent")) {
          sessionStorage.removeItem("analyticsIntent");
          navigate("/analytics", { replace: true });
        } else if (sessionStorage.getItem("createSessionIntent")) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      console.error("❌ Error response:", error.response?.data);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-[400px] px-4 py-6 sm:p-7 flex flex-col mx-auto'>
      <h3 className='text-xl sm:text-2xl font-semibold text-black mb-1'>Create Account</h3>
      <p className='text-sm sm:text-base text-slate-700 mb-2 sm:mb-6'>Join us today</p>

      <form onSubmit={handleSignUp} className='flex flex-col gap-2'>
        <Input
          value={fullName}
          onChange={({ target }) => setFullName(target.value)}
          label="Full Name"
          placeholder="Your name"
          type="text"
          disabled={loading}
        />

        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="xxx@gmail.com"
          type="text"
          disabled={loading}
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
          disabled={loading}
        />

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-md p-3 mt-2'>
            <p className='text-red-600 text-sm'>{error}</p>
          </div>
        )}

        <button
          type='submit'
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
              Signing up...
            </div>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <p className='text-sm text-slate-600 mt-6 text-center'>
        Already have an account?{" "}
        <span
          onClick={() => !loading && setCurrentPage("login")}
          className={`font-medium cursor-pointer hover:underline ${
            loading ? 'text-gray-400' : 'text-orange-500'
          }`}
        >
          Log In
        </span>
      </p>
    </div>
  );
};

export default SignUp;