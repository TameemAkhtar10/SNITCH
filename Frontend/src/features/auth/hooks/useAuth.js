import { seterror, setloading, setuser, logout } from "../state/auth.slice";
import { register, getme } from "../services/auth.sevice";
import { useDispatch } from 'react-redux'
import { login } from "../services/auth.sevice";

export const useAuth = () => {
    const dispatch = useDispatch()

    const handlerregister = async ({ email, password, contact, fullname, isSeller }) => {
        try {
            dispatch(setloading(true));
            const response = await register({ email, password, contact, fullname, isSeller });
            // Token is set by backend in httpOnly cookies, no need to set here
            dispatch(setuser(response));
            dispatch(setloading(false));
            return response;
        } catch (error) {
            dispatch(seterror(error?.response?.data?.message));
            dispatch(setloading(false));
            throw error;
        }
    }

    const handlerlogin = async ({ email, password }) => {
        try {
            dispatch(setloading(true));
            const response = await login({ email, password });
            // Token is set by backend in httpOnly cookies, no need to set here
            dispatch(setuser(response));
            dispatch(setloading(false));
            return response;
        } catch (error) {
            dispatch(seterror(error?.response?.data?.message));
            dispatch(setloading(false));
            throw error;
        }
    }

    const handlerLogout = async () => {
        try {
            dispatch(setloading(true));
            // Call backend logout if needed
            dispatch(logout());
            dispatch(setloading(false));
        } catch (error) {
            dispatch(seterror(error?.response?.data?.message));
            dispatch(setloading(false));
            throw error;
        }
    }

    const handlerGetMe = async () => {
        try {
            dispatch(setloading(true));
            const response = await getme();
            dispatch(setuser(response));
            dispatch(setloading(false));
            return response;
        } catch (error) {
            dispatch(seterror(error?.response?.data?.message));
            dispatch(setloading(false));
            throw error;
        }
    }

    return { handlerregister, handlerlogin, handlerLogout, handlerGetMe }
}