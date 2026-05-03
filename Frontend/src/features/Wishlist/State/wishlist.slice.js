import { createSlice } from '@reduxjs/toolkit'

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],
        loading: false,
        error: null
    },
    reducers: {
        setWishlist: (state, action) => {
            state.items = action.payload || []
            state.error = null
        },
        toggleWishlistItem: (state, action) => {
            const productId = String(action.payload)
            const exists = state.items.some((item) => String(item?._id || item) === productId)
            if (exists) {
                state.items = state.items.filter((item) => String(item?._id || item) !== productId)
            } else {
                state.items.unshift(action.payload)
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearWishlist: (state) => {
            state.items = []
            state.error = null
        }
    }
})

export const { setWishlist, toggleWishlistItem, setLoading, setError, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
