import { seterror, setloading, setuser, logout } from "../state/auth.slice";
import { register, getme, login, logout as logoutRequest } from "../services/auth.sevice";
import { useDispatch } from 'react-redux'
import { clearCart } from '../../Cart/State/cart.slice';
import { clearWishlist } from '../../Wishlist/State/wishlist.slice';

export const useAuth = () => {
    const dispatch = useDispatch()

    const handlerregister = async ({ email, password, contact, fullname, isSeller }) => {
        try {
            dispatch(setloading(true));
            const response = await register({ email, password, contact, fullname, isSeller });
            dispatch(setuser(response?.user || response?.data?.user || response));
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
            dispatch(setuser(response?.user || response?.data?.user || response));
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
            await logoutRequest();
            dispatch(logout());
            dispatch(clearCart());
            dispatch(clearWishlist());
            dispatch(setloading(false));
            return true;
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
            dispatch(setuser(response?.user || response?.data?.user || response));
            dispatch(setloading(false));
            return response;
        } catch (error) {
            dispatch(logout());
            dispatch(setloading(false));
            throw error;
        }
    }

    return { handlerregister, handlerlogin, handlerLogout, handlerGetMe }
}