import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        currentProduct: null,
        loading: false,
        error: null
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload
        },
        setProducts: (state, action) => {
            state.products = action.payload
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null
            state.error = null
        }
    }
})


export const {
    setSellerProducts,
    setProducts,
    setCurrentProduct,
    setLoading,
    setError,
    clearCurrentProduct
} = productSlice.actions
export default productSlice.reducer