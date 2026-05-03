import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/state/auth.slice.js'
import productReducer from '../features/Products/State/product.slice.js'
import cartReducer from '../features/Cart/State/cart.slice.js'
import wishlistReducer from '../features/Wishlist/State/wishlist.slice.js'
import reviewReducer from '../features/Reviews/State/review.slice.js'


export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        review: reviewReducer,
    }
}) 