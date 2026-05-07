import mongoose from 'mongoose';
import OrderModel from '../models/order.model.js';

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const normalizeItem = (item) => ({
    productId: item?.productId,
    variantId: item?.variantId || null,
    title: item?.title,
    image: item?.image || '',
    quantity: toNumber(item?.quantity),
    amount: toNumber(item?.amount),
    currency: item?.currency || 'INR',
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const statusOrder = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

const canTransitionForward = (currentStatus, nextStatus) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = statusOrder.indexOf(nextStatus);

    if (currentIndex === -1 || nextIndex === -1) {
        return false;
    }

    return nextIndex > currentIndex;
};

function buildBillFromOrder(order, customerName) {
    const subtotal = order.items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    const shipping = subtotal > 999 ? 0 : 79;
    const total = subtotal + shipping;

    return {
        billNumber: `SN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        billDate: new Date().toISOString(),
        customerName: customerName || 'Guest',
        items: order.items.map(i => ({ title: i.title, quantity: i.quantity, amount: i.amount, currency: i.currency })),
        subtotal,
        shipping,
        total,
        paymentId: order.paymentId,
        status: order.status,
        orderId: order._id,
    };
}

export const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, currency, paymentId, razorpayOrderId } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order items are required', data: {} });
        }

        const parsedTotalAmount = toNumber(totalAmount);
        if (!Number.isFinite(parsedTotalAmount) || parsedTotalAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid totalAmount is required', data: {} });
        }

        const normalizedItems = items.map(normalizeItem);

        const hasInvalidItem = normalizedItems.some((item) => {
            return (
                !item.productId ||
                !isValidObjectId(item.productId) ||
                (item.variantId && !isValidObjectId(item.variantId)) ||
                !item.title ||
                !Number.isFinite(item.quantity) ||
                item.quantity <= 0 ||
                !Number.isFinite(item.amount) ||
                item.amount < 0
            );
        });

        if (hasInvalidItem) {
            return res.status(400).json({ success: false, message: 'Invalid order item payload', data: {} });
        }

        const order = await OrderModel.create({
            userId: req.user._id,
            items: normalizedItems,
            totalAmount: parsedTotalAmount,
            currency: currency || 'INR',
            paymentId: paymentId || null,
            razorpayOrderId: razorpayOrderId || null,
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order,
            data: { order },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({ userId: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            orders,
            data: { orders },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'fullname email contact')
            .populate('items.productId', 'seller title images price');

        const sellerOrders = orders.filter((order) => (
            Array.isArray(order?.items) && order.items.some((item) => {
                const sellerId = item?.productId?.seller;
                return sellerId && String(sellerId) === String(req.user._id);
            })
        ));

        return res.status(200).json({
            success: true,
            message: 'Seller orders fetched successfully',
            orders: sellerOrders,
            data: { orders: sellerOrders },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!isValidObjectId(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order id', data: {} });
        }

        const order = await OrderModel.findOne({ _id: orderId, userId: req.user._id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found', data: {} });
        }

        return res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            order,
            data: { order },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!isValidObjectId(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order id', data: {} });
        }

        const order = await OrderModel.findOne({ _id: orderId, userId: req.user._id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found', data: {} });
        }

        if (order.status !== 'placed') {
            return res.status(400).json({ success: false, message: 'Only placed orders can be cancelled', data: {} });
        }

        order.status = 'cancelled';
        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order,
            data: { order },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!isValidObjectId(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order id', data: {} });
        }

        if (!statusOrder.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status transition', data: {} });
        }

        const order = await OrderModel.findById(orderId).populate('items.productId', 'seller');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found', data: {} });
        }

        const isSellerOfOrder = Array.isArray(order.items) && order.items.some((item) => {
            const productSellerId = item?.productId?.seller;
            return productSellerId && String(productSellerId) === String(req.user._id);
        });

        if (!isSellerOfOrder) {
            return res.status(403).json({ success: false, message: 'Unauthorized', data: {} });
        }

        if (!canTransitionForward(order.status, status)) {
            return res.status(400).json({ success: false, message: 'Invalid status transition', data: {} });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: { order },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const generateBill = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!isValidObjectId(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order id', data: {} });
        }

        const order = await OrderModel.findOne({ _id: orderId, userId: req.user._id }).populate('userId', 'fullname email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found', data: {} });
        }

        const billData = buildBillFromOrder(order, order?.userId?.fullname || order?.userId?.email);

        return res.status(200).json({
            success: true,
            bill: billData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};
