import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const BuyProtectedRoute = ({ children }) => {
    const token = getToken();
    const user = useSelector((state) => state.auth.user);
    const initializing = useSelector((state) => state.auth.initializing);
    const location = useLocation();

    // Wait for initialization to complete
    if (initializing) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>Loading...</div>;
    }

    // Check if user has token
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Check if user is not a seller (buyers can access)
    // Sellers need to use seller dashboard
    if (user && user.role === "seller") {
        return <Navigate to="/seller" replace />;
    }

    return children;
};

export default BuyProtectedRoute;
