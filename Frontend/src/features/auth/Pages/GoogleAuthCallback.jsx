import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setuser } from "../state/auth.slice";
import { getme } from "../services/auth.sevice";

const GoogleAuthCallback = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const token = params.get("token");
                const redirectTo = params.get("redirectTo");

                // If token is in URL, the backend has already set it in cookies
                // Now fetch user data to populate Redux state
                if (token || user) {
                    try {
                        const userData = await getme();
                        dispatch(setuser(userData?.user || userData?.data?.user || userData));

                        // Redirect based on user role or redirectTo param
                        setTimeout(() => {
                            if (userData?.user?.role === "seller" || userData?.data?.user?.role === "seller") {
                                navigate("/seller", { replace: true });
                            } else if (redirectTo) {
                                navigate(redirectTo, { replace: true });
                            } else {
                                navigate("/", { replace: true });
                            }
                        }, 100);
                    } catch (error) {
                        console.error("Failed to fetch user:", error);
                        navigate("/login", { replace: true });
                    }
                } else {
                    navigate("/login", { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };

        handleCallback();
    }, [navigate, dispatch, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Completing login...</p>
            </div>
        );
    }

    return null;
};

export default GoogleAuthCallback;
