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
            state.loading = false
            state.error = null
            state.items = action.payload
            state.totalPrice = action.payload?.reduce((sum, item) => sum + (item.price?.amount || 0) * (item.quantity || 1), 0) || 0
        },
        addItem: (state, action) => {
            state.items.push(action.payload)
            state.totalPrice += (action.payload.price?.amount || 0) * (action.payload.quantity || 1)
        },
        removeItem: (state, action) => {
            const item = state.items.find(i => i._id === action.payload)
            if (item) {
                state.totalPrice -= (item.price?.amount || 0) * (item.quantity || 1)
            }
            state.items = state.items.filter(i => i._id !== action.payload)
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
        }
    }
})

export const { setcart, addItem, removeItem, setLoading, setError, clearCart } = cartSlice.actions
export default cartSlice.reducer

