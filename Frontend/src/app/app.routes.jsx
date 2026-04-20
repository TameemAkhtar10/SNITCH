import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/auth/Pages/Login.jsx";
import Register from "../features/auth/Pages/Register.jsx";
import ProtectedRoute from "../features/auth/Pages/ProtectedRoute.jsx";
import SellerRoute from "../features/auth/Pages/SellerRoute.jsx";
import CreateProduct from "../features/Products/Pages/CreateProduct.jsx";
import Dashboard from "../features/Products/Pages/Dashboard.jsx";
import GoogleAuthCallback from "../features/auth/Pages/GoogleAuthCallback.jsx";

export const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/home" replace /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/auth/google/success", element: <GoogleAuthCallback /> },
    {
        path: "/home",
        element: <ProtectedRoute><div>Home Page</div></ProtectedRoute>
    },
    {
        path: "/seller",
        element: <SellerRoute><Dashboard /></SellerRoute>
    },
    {
        path: "/seller/create-product",
        element: <SellerRoute><CreateProduct /></SellerRoute>
    },
    { path: "*", element: <Navigate to="/login" replace /> },
]);