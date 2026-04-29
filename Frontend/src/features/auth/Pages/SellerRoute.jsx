import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const SellerRoute = ({ children }) => {
    const token = getToken();
    const user = useSelector((state) => state.auth.user);
    const initializing = useSelector((state) => state.auth.initializing);

    // If still initializing, show loading - don't redirect yet
    if (initializing) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>Loading...</div>;
    }

    // Check if user has token
    if (!token) {
        return <Navigate to="/login" replace />;
    }


    if (!user || user.role !== "seller") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default SellerRoute;
