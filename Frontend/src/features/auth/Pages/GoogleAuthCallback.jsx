import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GoogleAuthCallback = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirectTo");

        if (user) {
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else if (user?.role === "seller") {
                navigate("/seller", { replace: true });
            } else {
                navigate("/home", { replace: true });
            }
        } else {
            navigate("/login", { replace: true });
        }
    }, [navigate, user]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Completing login...</p>
        </div>
    );
};

export default GoogleAuthCallback;
