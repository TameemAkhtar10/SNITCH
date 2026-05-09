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
                const fallbackPath = redirectTo || "/home";

                if (!token && !user) {
                    navigate("/login", { replace: true });
                    return;
                }

                let nextUser = user;

                try {
                    const userData = await getme();
                    nextUser = userData?.user || userData?.data?.user || userData;
                    dispatch(setuser(nextUser));
                } catch (error) {
                    console.error("Failed to fetch user after Google login:", error);
                }

                if (nextUser?.role === "seller") {
                    navigate("/seller", { replace: true });
                    return;
                }

                navigate(fallbackPath, { replace: true });
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
