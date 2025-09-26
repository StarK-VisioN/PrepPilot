import React, {createContext, useState, useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem("token");
        
        if(!accessToken) {
            setLoading(false);
            return;
        }

        const fetchUser = async() => {
            try {
                console.log("🔄 Fetching user profile...");
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                console.log("✅ User profile fetched:", response.data);
                
                if (response.data && response.data.data) {
                    setUser(response.data.data);
                } else {
                    throw new Error("Invalid user data received");
                }
            } catch (error) {
                console.error("❌ User not authenticated", error);
                clearUser();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const updateUser = (userData) => {
        console.log("🔄 Updating user context:", userData);
        
        if (userData.data) {
            setUser(userData.data);
            if (userData.data.token) {
                localStorage.setItem("token", userData.data.token);
            }
        } else if (userData.token) {
            setUser(userData);
            localStorage.setItem("token", userData.token);
        } else {
            console.error("❌ Invalid user data structure:", userData);
        }
        setLoading(false);
    };

    const clearUser = () => {
        console.log("🧹 Clearing user data");
        setUser(null);
        localStorage.removeItem("token");
    };

    const value = {
        user, 
        loading, 
        updateUser, 
        clearUser,
        isAuthenticated: !!user && !!localStorage.getItem("token")
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;