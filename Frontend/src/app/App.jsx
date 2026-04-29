import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { router } from "./app.routes.jsx";
import { setuser, setInitializing } from "../features/auth/state/auth.slice";
import { getme } from "../features/auth/services/auth.sevice";

const App = () => {
    const dispatch = useDispatch();
    const initializing = useSelector((state) => state.auth.initializing);

    useEffect(() => {
        // On app load, restore user data from backend if token exists
        const restoreUserSession = async () => {
            try {
                const userData = await getme();
                if (userData) {
                    dispatch(setuser(userData.user));
                    console.log(userData);
                    
                }
            } catch (error) {
                console.log("No active session or session expired");
            } finally {
               
                dispatch(setInitializing(false));
            }
        };

        restoreUserSession();
    }, [dispatch]);

    // Don't render router until session is restored
    if (initializing) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>Loading...</div>;
    }

    return <RouterProvider router={router} />;
};

export default App;