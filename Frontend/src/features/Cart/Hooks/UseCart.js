import { addItem, removeItem, getCart, updateItem } from '../services/cart.api.js'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { addItem as addItemToCart, setcart, removeItem as removeItemAction, setLoading, setError, clearCart } from '../State/cart.slice.js'

export const useCart = () => {
    const dispatch = useDispatch()

    const addToCarthandler = useCallback(async (productId, variantId, cartItemData) => {
        try {
            dispatch(setLoading(true))
            const response = await addItem(productId, variantId, cartItemData)
            if (response?.cart?.items) {
                dispatch(setcart(response.cart.items))
            } else if (response?.items) {
                dispatch(setcart(response.items))
            }
            dispatch(setError(null))
            return response
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || 'Failed to add item'
            dispatch(setError(errorMsg))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const removeFromCartHandler = useCallback(async (cartItemId) => {
        try {
            dispatch(setLoading(true))
            const response = await removeItem(cartItemId)
            dispatch(removeItemAction(cartItemId))
            dispatch(setError(null))
            return response
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to remove item'
            dispatch(setError(errorMsg))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const updateCartItemHandler = useCallback(async (cartItemId, quantity) => {
        try {
            const response = await updateItem(cartItemId, quantity)
            if (response?.cart?.items) {
                dispatch(setcart(response.cart.items))
            } else if (response?.items) {
                dispatch(setcart(response.items))
            }
            dispatch(setError(null))
            return response
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to update item'
            dispatch(setError(errorMsg))
            throw error
        }
    }, [dispatch])

    const fetchCart = useCallback(async () => {
        try {
            dispatch(setLoading(true))
            const response = await getCart()
            if (response?.cart?.items) {
                dispatch(setcart(response.cart.items))
            }
            dispatch(setError(null))
            return response
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to fetch cart'
            dispatch(setError(errorMsg))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const clearCartHandler = useCallback(() => {
        dispatch(clearCart())
    }, [dispatch])

    return { addToCarthandler, removeFromCartHandler, updateCartItemHandler, fetchCart, clearCartHandler }
}