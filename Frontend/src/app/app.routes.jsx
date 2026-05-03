import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/auth/Pages/Login.jsx";
import Register from "../features/auth/Pages/Register.jsx";
import ProtectedRoute from "../features/auth/Pages/ProtectedRoute.jsx";
import BuyProtectedRoute from "../features/auth/Pages/BuyProtectedRoute.jsx";
import SellerRoute from "../features/auth/Pages/SellerRoute.jsx";
import CreateProduct from "../features/Products/Pages/CreateProduct.jsx";
import Dashboard from "../features/Products/Pages/Dashboard.jsx";
import GoogleAuthCallback from "../features/auth/Pages/GoogleAuthCallback.jsx";
import Home from "../features/Products/Pages/Home.jsx";
import ProductDetails from "../features/Products/Pages/ProductDetails.jsx";
import SellerProductDetail from "../features/Products/Pages/SellerProductDetail.jsx";
import Cart from "../features/Cart/Pages/Cart.jsx";
import Wishlist from "../features/Wishlist/Pages/Wishlist.jsx";
export const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/auth/google/success", element: <GoogleAuthCallback /> },
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/product/:productId",
        element: <ProductDetails />
    },
    {
        path: "/cart",
        element: <BuyProtectedRoute><Cart /></BuyProtectedRoute>
    },
    {
        path: "/wishlist",
        element: <BuyProtectedRoute><Wishlist /></BuyProtectedRoute>
    },
    {
        path: "/seller",
        element: <SellerRoute><Dashboard /></SellerRoute>
    },
    {
        path: "/seller/create-product",
        element: <SellerRoute><CreateProduct /></SellerRoute>
    },
    {
        path: "/seller/edit-product/:productId",
        element: <SellerRoute><SellerProductDetail /></SellerRoute>
    },


    {
        path: '/seller-product/:productId',
        element: <SellerRoute><SellerProductDetail /></SellerRoute>
    },
    { path: "*", element: <Navigate to="/" replace /> }
]);