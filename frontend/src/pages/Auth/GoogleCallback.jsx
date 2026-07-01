import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { handlePostAuthRedirect } from "../../utils/authRedirect";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = React.useContext(UserContext);

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
            navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
            return;
        }

        if (!token) {
            navigate("/login?error=missing_token", { replace: true });
            return;
        }

        const completeAuth = async () => {
            try {
                localStorage.setItem("token", token);
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_ME);
                if (response.data?.data) {
                    updateUser({ data: { ...response.data.data, token } });
                    handlePostAuthRedirect(navigate);
                } else {
                    throw new Error("Failed to load user profile");
                }
            } catch {
                localStorage.removeItem("token");
                navigate("/login?error=google_auth_failed", { replace: true });
            }
        };

        completeAuth();
    }, [navigate, searchParams, updateUser]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Completing Google sign-in...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;
