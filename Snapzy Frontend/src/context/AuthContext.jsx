import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get("/users/me");

            const currentUser =
                response.data.User ??
                response.data.user ??
                null;

            setUser(currentUser);
            return currentUser;
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error(
                    "Failed to fetch user:",
                    error.response?.data || error.message
                );
            }

            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const isAuthenticated = Boolean(user);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                isAuthenticated,
                fetchUser,
                checkAuth: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
