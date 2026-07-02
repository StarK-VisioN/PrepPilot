import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../components/Input";
import { validatePassword } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!validatePassword(password)) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post(
                API_PATHS.AUTH.RESET_PASSWORD(token),
                { password, confirmPassword }
            );

            toast.success(
                response.data?.message || "Password reset successfully. Please log in again."
            );
            navigate("/login", { replace: true });
        } catch (err) {
            const message =
                err.response?.data?.message || "This reset link is invalid or expired.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        label="New Password"
                        placeholder="Min 8 characters"
                        type="password"
                        disabled={loading}
                        required
                    />

                    <Input
                        value={confirmPassword}
                        onChange={({ target }) => setConfirmPassword(target.value)}
                        label="Confirm Password"
                        placeholder="Re-enter password"
                        type="password"
                        disabled={loading}
                        required
                    />

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white font-semibold py-3 rounded-md text-sm sm:text-base transition min-h-[44px] ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-black hover:bg-gray-800"
                        }`}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
