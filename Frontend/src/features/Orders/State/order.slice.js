import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
    },
    reducers: {
        setOrders: (state, action) => {
            state.orders = Array.isArray(action.payload) ? action.payload : [];
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload || null;
        },
        setOrderLoading: (state, action) => {
            state.loading = Boolean(action.payload);
        },
        setOrderError: (state, action) => {
            state.error = action.payload || null;
        },
        cancelOrderInState: (state, action) => {
            const orderId = action.payload;
            state.orders = state.orders.map((order) => (
                String(order?._id) === String(orderId)
                    ? { ...order, status: 'cancelled' }
                    : order
            ));
            if (state.currentOrder && String(state.currentOrder._id) === String(orderId)) {
                state.currentOrder = { ...state.currentOrder, status: 'cancelled' };
            }
        },
        updateOrderInState: (state, action) => {
            const updatedOrder = action.payload;
            const orderId = updatedOrder?._id;

            if (!orderId) {
                return;
            }

            state.orders = state.orders.map((order) => (
                String(order?._id) === String(orderId)
                    ? { ...order, ...updatedOrder }
                    : order
            ));

            if (state.currentOrder && String(state.currentOrder._id) === String(orderId)) {
                state.currentOrder = { ...state.currentOrder, ...updatedOrder };
            }
        },
    },
});

export const { setOrders, setCurrentOrder, setOrderLoading, setOrderError, cancelOrderInState, updateOrderInState } = orderSlice.actions;
export default orderSlice.reducer;
