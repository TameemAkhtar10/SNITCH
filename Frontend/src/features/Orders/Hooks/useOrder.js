import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { cancelOrderApi, createOrderApi, getOrderByIdApi, getSellerOrdersApi, getUserOrdersApi, updateOrderStatusApi } from '../services/order.api.js';
import { cancelOrderInState, setCurrentOrder, setOrderError, setOrderLoading, setOrders, updateOrderInState } from '../State/order.slice.js';

export const useOrder = () => {
    const dispatch = useDispatch();

    const createOrderHandler = useCallback(async (data) => {
        try {
            dispatch(setOrderLoading(true));
            const response = await createOrderApi(data);
            const order = response?.order || response?.data?.order || response?.data || null;
            if (order) {
                dispatch(setCurrentOrder(order));
            }
            dispatch(setOrderError(null));
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to create order';
            dispatch(setOrderError(errorMsg));
            throw error;
        } finally {
            dispatch(setOrderLoading(false));
        }
    }, [dispatch]);

    const fetchUserOrders = useCallback(async () => {
        try {
            dispatch(setOrderLoading(true));
            const response = await getUserOrdersApi();
            const orders = response?.orders || response?.data?.orders || [];
            dispatch(setOrders(orders));
            dispatch(setOrderError(null));
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to fetch orders';
            dispatch(setOrderError(errorMsg));
            throw error;
        } finally {
            dispatch(setOrderLoading(false));
        }
    }, [dispatch]);

    const fetchSellerOrders = useCallback(async () => {
        try {
            dispatch(setOrderLoading(true));
            const response = await getSellerOrdersApi();
            const orders = response?.orders || response?.data?.orders || [];
            dispatch(setOrders(orders));
            dispatch(setOrderError(null));
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to fetch seller orders';
            dispatch(setOrderError(errorMsg));
            throw error;
        } finally {
            dispatch(setOrderLoading(false));
        }
    }, [dispatch]);

    const fetchOrderById = useCallback(async (orderId) => {
        try {
            dispatch(setOrderLoading(true));
            const response = await getOrderByIdApi(orderId);
            const order = response?.order || response?.data?.order || null;
            dispatch(setCurrentOrder(order));
            dispatch(setOrderError(null));
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to fetch order';
            dispatch(setOrderError(errorMsg));
            throw error;
        } finally {
            dispatch(setOrderLoading(false));
        }
    }, [dispatch]);

    const cancelOrderHandler = useCallback(async (orderId) => {
        try {
            dispatch(setOrderLoading(true));
            const response = await cancelOrderApi(orderId);
            dispatch(cancelOrderInState(orderId));
            dispatch(setOrderError(null));
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to cancel order';
            dispatch(setOrderError(errorMsg));
            throw error;
        } finally {
            dispatch(setOrderLoading(false));
        }
    }, [dispatch]);

    const updateOrderStatusHandler = useCallback(async (orderId, status) => {
        try {
            dispatch(setOrderLoading(true));
            const response = await updateOrderStatusApi(orderId, status);
            const updatedOrder = response?.order || response?.data?.order || null;
            if (updatedOrder) {
                dispatch(updateOrderInState(updatedOrder));
                dispatch(setCurrentOrder(updatedOrder));
            }
            dispatch(setOrderError(null));
            return response;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to update order status';
            dispatch(setOrderError(errorMsg));
            throw error;
        } finally {
            dispatch(setOrderLoading(false));
        }
    }, [dispatch]);

    return {
        createOrderHandler,
        fetchUserOrders,
        fetchSellerOrders,
        fetchOrderById,
        cancelOrderHandler,
        updateOrderStatusHandler,
    };
};
