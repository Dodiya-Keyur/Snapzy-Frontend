import SkeletonLoader from "../components/SkeletonLoader";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <SkeletonLoader />;
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
