import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const getToken = () => {
    // Only check cookies - backend manages token expiration
    // Don't use localStorage as it persists after cookies are cleared
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const ProtectedRoute = ({ children }) => {
    const token = getToken();
    const initializing = useSelector((state) => state.auth.initializing);
    const location = useLocation();

    // Wait for initialization to complete
    if (initializing) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>Loading...</div>;
    }

    if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
};

export default ProtectedRoute;