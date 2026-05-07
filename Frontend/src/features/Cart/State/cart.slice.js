import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        loading: false,
        error: null,
        totalPrice: 0,
        subtotal: 0,
        totalItems: 0,
        itemCount: 0
    },
    reducers: {
        setcart: (state, action) => {
            state.items = action.payload
            state.error = null
        },
        setCartTotals: (state, action) => {
            state.subtotal = action.payload.subtotal || 0
            state.totalItems = action.payload.totalItems || 0
            state.itemCount = action.payload.itemCount || 0
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
            state.subtotal = 0
            state.totalItems = 0
            state.itemCount = 0
            state.error = null
        }
    }
})

export const { setcart, setCartTotals, addItem, removeItem, updateItemQuantity, setLoading, setError, clearCart } = cartSlice.actions
export default cartSlice.reducer

