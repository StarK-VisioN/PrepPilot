import React, { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL, API_PATHS } from "../utils/apiPaths";

const AppConfigContext = createContext({
    googleClientId: null,
    loading: true,
});

export const useAppConfig = () => useContext(AppConfigContext);

const AppConfigProvider = ({ children }) => {
    const [googleClientId, setGoogleClientId] = useState(
        import.meta.env.VITE_GOOGLE_CLIENT_ID || null
    );
    const [loading, setLoading] = useState(!import.meta.env.VITE_GOOGLE_CLIENT_ID);

    useEffect(() => {
        const builtInClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (builtInClientId) {
            setGoogleClientId(builtInClientId);
            setLoading(false);
            return;
        }

        const fetchPublicConfig = async () => {
            try {
                const response = await fetch(API_PATHS.CONFIG.PUBLIC);
                if (!response.ok) {
                    throw new Error("Failed to load public config");
                }
                const json = await response.json();
                setGoogleClientId(json?.data?.googleClientId || null);
            } catch (error) {
                console.warn("Could not load Google client ID from backend:", error);
                setGoogleClientId(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicConfig();
    }, []);

    return (
        <AppConfigContext.Provider value={{ googleClientId, loading }}>
            {children}
        </AppConfigContext.Provider>
    );
};

export default AppConfigProvider;
