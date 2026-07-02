import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ForgotPassword = ({ setCurrentPage, standalone = false }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const goToLogin = () => {
        if (setCurrentPage) {
            setCurrentPage("login");
            return;
        }
        navigate("/login");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, {
                email: email.toLowerCase().trim(),
            });

            setSuccess(
                response.data?.message ||
                    "If this email is registered, we have sent a password reset link."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to send reset link right now. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <>
            <h3 className="text-xl sm:text-2xl font-semibold text-black mb-2">Forgot Password</h3>
            <p className="text-sm sm:text-base text-slate-700 mb-6">
                Enter your registered email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    value={email}
                    onChange={({ target }) => setEmail(target.value)}
                    label="Email Address"
                    placeholder="xxx@gmail.com"
                    type="email"
                    disabled={loading || Boolean(success)}
                    required
                />

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-green-700 text-sm">{success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || Boolean(success)}
                    className={`w-full text-white font-semibold py-3 rounded-md text-sm sm:text-base transition min-h-[44px] ${
                        loading || success
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Sending..." : "Send reset link"}
                </button>
            </form>

            <p className="text-sm text-slate-600 mt-6 text-center">
                Remember your password?{" "}
                <span
                    onClick={() => !loading && goToLogin()}
                    className={`font-medium cursor-pointer hover:underline ${
                        loading ? "text-gray-400" : "text-blue-600"
                    }`}
                >
                    Back to Log In
                </span>
            </p>
        </>
    );

    if (standalone) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[400px] px-4 py-6 sm:p-7 flex flex-col mx-auto">
            {content}
        </div>
    );
};

export default ForgotPassword;
