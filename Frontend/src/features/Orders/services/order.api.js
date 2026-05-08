import axios from 'axios';

const api = axios.create({
    baseURL: 'https://snitch-aukv.onrender.com/api/orders',
    withCredentials: true,
});

export const createOrderApi = async (data) => {
    const response = await api.post('/', data);
    return response.data;
};

export const getUserOrdersApi = async () => {
    const response = await api.get('/');
    return response.data;
};

export const getSellerOrdersApi = async () => {
    const response = await api.get('/seller');
    return response.data;
};

export const getOrderByIdApi = async (orderId) => {
    const response = await api.get(`/${orderId}`);
    return response.data;
};

export const cancelOrderApi = async (orderId) => {
    const response = await api.patch(`/${orderId}/cancel`);
    return response.data;
};

export const updateOrderStatusApi = async (orderId, status) => {
    const response = await api.patch(`/${orderId}/status`, { status });
    return response.data;
};
