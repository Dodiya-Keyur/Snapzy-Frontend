
import SkeletonLoader from "../components/SkeletonLoader";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <SkeletonLoader />
    }

    console.log(isAuthenticated)

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;
