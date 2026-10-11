
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
} from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication using the cookie
    const checkAuth = useCallback(async () => {
        setLoading(true);

        try {
            const response = await getCurrentUser();

            // Adjust according to your backend response
            const currentUser =
                response.user ?? response.data?.user ?? response.data;

            if (!currentUser) {
                setUser(null);
                return null;
            }

            setUser(currentUser);
            return currentUser;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Check login status when the app starts
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login
    const login = async (credentials) => {
        await loginUser(credentials);

        // The backend sets the authentication cookie.
        // Fetch the logged-in user's information.
        const currentUser = await checkAuth();

        if (!currentUser) {
            throw new Error(
                "Login succeeded, but the user session could not be verified."
            );
        }

        return currentUser;
    };

    // Register
    const register = async (userData) => {
        return await registerUser(userData);
    };

    // Logout
    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            // Clear local authentication state.
            // The backend must clear/invalidate the cookie.
            setUser(null);
        }
    };

    const isAuthenticated = Boolean(user);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                register,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
