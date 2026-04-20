import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GoogleAuthCallback = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        // Extract token from URL query parameter
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            // Token already set by backend in cookies during OAuth callback
            // Check user role and redirect accordingly
            if (user?.role === "seller") {
                navigate("/seller", { replace: true });
            } else {
                navigate("/home", { replace: true });
            }
        } else {
            navigate("/login", { replace: true });
        }
    }, [navigate, user?.role]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Completing login...</p>
        </div>
    );
};

export default GoogleAuthCallback;
