import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const SellerRoute = ({ children }) => {
    const token = getToken();
    const user = useSelector((state) => state.auth.user);

    // Check if user has token
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has seller role
    if (!user || user.role !== "seller") {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default SellerRoute;
