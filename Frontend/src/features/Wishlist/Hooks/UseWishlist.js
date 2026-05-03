import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, getWishlist, removeFromWishlist } from '../services/wishlist.service.js'
import { setWishlist, setLoading, setError } from '../State/wishlist.slice.js'

const UseWishlist = () => {
    const dispatch = useDispatch()
    const wishlistItems = useSelector((state) => state.wishlist?.items || [])

    const fetchWishlist = useCallback(async () => {
        try {
            dispatch(setLoading(true))
            const response = await getWishlist()
            const items = response?.wishlist?.products || []
            dispatch(setWishlist(items))
            dispatch(setError(null))
            return items
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || 'Failed to fetch wishlist'))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const addToWishlistHandler = useCallback(async (productId) => {
        try {
            dispatch(setLoading(true))
            const response = await addToWishlist(productId)
            const items = response?.wishlist?.products || []
            dispatch(setWishlist(items))
            dispatch(setError(null))
            return response
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || 'Failed to add to wishlist'))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const removeFromWishlistHandler = useCallback(async (productId) => {
        try {
            dispatch(setLoading(true))
            const response = await removeFromWishlist(productId)
            const items = response?.wishlist?.products || []
            dispatch(setWishlist(items))
            dispatch(setError(null))
            return response
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || 'Failed to remove from wishlist'))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const isWishlisted = useCallback((productId) => {
        return wishlistItems.some((item) => String(item?._id || item) === String(productId))
    }, [wishlistItems])

    return {
        wishlistItems,
        fetchWishlist,
        addToWishlistHandler,
        removeFromWishlistHandler,
        isWishlisted
    }
}

export default UseWishlist
