import { Navigate } from "react-router-dom";

const getToken = () => {
    // Only check cookies - backend manages token expiration
    // Don't use localStorage as it persists after cookies are cleared
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const ProtectedRoute = ({ children }) => {
    const token = getToken();
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;