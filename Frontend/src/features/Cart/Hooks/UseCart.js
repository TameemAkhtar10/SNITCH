import { addItem, removeItem, getCart } from '../services/cart.api.js'
import { useDispatch } from 'react-redux'
import { addItem as addItemToCart, setcart, removeItem as removeItemAction, setLoading, setError, clearCart } from '../State/cart.slice.js'

export const useCart = () => {
    const dispatch = useDispatch()

    const addToCarthandler = async (productId, variantId, cartItemData) => {
        try {
            dispatch(setLoading(true))
            const response = await addItem(productId, variantId, cartItemData);
            if (response?.item) {
                dispatch(addItemToCart(response.item))
            }
            dispatch(setError(null))
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || 'Failed to add item'
            dispatch(setError(errorMsg))
            console.error('Error adding item to cart:', error);
            throw error;
        } finally {
            dispatch(setLoading(false))
        }
    }

    const removeFromCartHandler = async (cartItemId) => {
        try {
            dispatch(setLoading(true))
            const response = await removeItem(cartItemId);
            dispatch(removeItemAction(cartItemId))
            dispatch(setError(null))
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to remove item'
            dispatch(setError(errorMsg))
            console.error('Error removing item from cart:', error);
            throw error;
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchCart = async () => {
        try {
            dispatch(setLoading(true))
            const response = await getCart();
            if (response?.items) {
                dispatch(setcart(response.items))
            }
            dispatch(setError(null))
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to fetch cart'
            dispatch(setError(errorMsg))
            console.error('Error fetching cart:', error);
            throw error;
        } finally {
            dispatch(setLoading(false))
        }
    }

    const clearCartHandler = () => {
        dispatch(clearCart())
    }

    return {
        addToCarthandler,
        removeFromCartHandler,
        fetchCart,
        clearCartHandler,
    }
}
