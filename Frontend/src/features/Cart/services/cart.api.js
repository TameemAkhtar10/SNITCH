import axios from "axios";
const api = axios.create({
    baseURL: 'http://localhost:3000/api/cart',
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

export const getCart = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
}
