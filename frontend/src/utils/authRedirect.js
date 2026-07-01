export const handlePostAuthRedirect = (navigate, onSuccess) => {
    if (onSuccess) {
        onSuccess();
        return;
    }

    if (sessionStorage.getItem("codingIntent")) {
        sessionStorage.removeItem("codingIntent");
        navigate("/coding", { replace: true });
        return;
    }

    if (sessionStorage.getItem("behavioralIntent")) {
        sessionStorage.removeItem("behavioralIntent");
        navigate("/behavioral", { replace: true });
        return;
    }

    if (sessionStorage.getItem("mockInterviewIntent")) {
        sessionStorage.removeItem("mockInterviewIntent");
        navigate("/mock-interview", { replace: true });
        return;
    }

    if (sessionStorage.getItem("analyticsIntent")) {
        sessionStorage.removeItem("analyticsIntent");
        navigate("/analytics", { replace: true });
        return;
    }

    if (sessionStorage.getItem("createSessionIntent")) {
        navigate("/dashboard", { replace: true });
        return;
    }

    navigate("/", { replace: true });
};
