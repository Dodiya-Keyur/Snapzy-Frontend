import AppLoader from "../components/AppLoader";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <AppLoader fullScreen />;
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Outlet />;
}

export default PublicRoute;
