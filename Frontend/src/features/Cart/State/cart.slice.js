import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        loading: false,
        error: null,
        totalPrice: 0
    },
    reducers: {
        setcart: (state, action) => {
            state.items = action.payload
            state.error = null
        },
        addItem: (state, action) => {
            state.items.push(action.payload)
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload)
        },
        updateItemQuantity: (state, action) => {
            const { itemId, quantity } = action.payload
            const item = state.items.find(item => item._id === itemId)
            if (item) {
                item.quantity = quantity
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearCart: (state) => {
            state.items = []
            state.totalPrice = 0
            state.error = null
        }
    }
})

export const { setcart, addItem, removeItem, updateItemQuantity, setLoading, setError, clearCart } = cartSlice.actions
export default cartSlice.reducer

