import React, { useContext, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { handlePostAuthRedirect } from "../../utils/authRedirect";

const GoogleSignInButton = ({
    onSuccess,
    disabled = false,
    linkAccount = false,
    onLinkSuccess,
    className = "",
}) => {
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleGoogleSuccess = async (credentialResponse) => {
        const credential = credentialResponse?.credential;

        if (!credential) {
            setError("Google did not return a valid credential");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const endpoint = linkAccount ? API_PATHS.AUTH.LINK_GOOGLE : API_PATHS.AUTH.GOOGLE;
            const response = await axiosInstance.post(endpoint, { credential });

            if (!response.data?.success) {
                throw new Error(response.data?.message || "Google sign-in failed");
            }

            if (linkAccount) {
                onLinkSuccess?.(response.data.data);
            } else {
                updateUser(response.data);
                handlePostAuthRedirect(navigate, onSuccess);
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Google sign-in failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!googleClientId) {
        return null;
    }

    return (
        <div className={`w-full ${className}`}>
            <div
                className={`flex justify-center ${disabled || loading ? "pointer-events-none opacity-60" : ""}`}
            >
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-in was cancelled or failed")}
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="100%"
                />
            </div>

            {loading && (
                <p className="text-center text-sm text-gray-500 mt-2">Signing you in...</p>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default GoogleSignInButton;
