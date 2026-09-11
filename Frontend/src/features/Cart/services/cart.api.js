import axios from "axios";
import { API_URL } from "../../../config/api.js";
const api = axios.create({
    baseURL: `${API_URL}/api/cart`,
    withCredentials: true,
})

export const addItem = async (productId, variantId, cartItemData) => {
    try {
        const response = await api.post(`/add/${productId}/${variantId}`, {
            quantity: cartItemData?.quantity || 1,
            amount: cartItemData?.amount,
            currency: cartItemData?.currency
        });
        return response.data;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
}

export const removeItem = async (cartItemId) => {
    try {
        const response = await api.delete(`/remove/${cartItemId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        throw error;
    }
}

export const clearCartApi = async () => {
    try {
        const response = await api.delete('/clear');
        return response.data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
}

export const updateItem = async (cartItemId, quantity) => {
    try {
        const response = await api.put(`/update/${cartItemId}`, {
            quantity,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating item in cart:', error);
        throw error;
    }
}

export const getCart = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
}

export const createorder = async (amount, currency) => {
    try {
        const response = await api.post('/payment/create-order', {
            amount,
            currency: currency || "INR"
        });
        return response.data;

    } catch (error) {

        console.error('Error creating order:', error);
        throw error;
    }
}
export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    try {
        const response = await api.post('/payment/verify', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });
        return response.data;
    }
    catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
}