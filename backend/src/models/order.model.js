import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true,
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
        size: {
            type: String,
            default: '',
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
            default: 'INR',
        },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: 'Order must contain at least one item',
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
            default: 'placed',
        },
        paymentId: {
            type: String,
            default: null,
        },
        razorpayOrderId: {
            type: String,
            default: null,
        },
        deliveryAddress: {
            name: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: String
        },
        refundStatus: {
            type: String,
            enum: ['none', 'initiated', 'completed', 'failed'],
            default: 'none'
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

const OrderModel = mongoose.model('Order', OrderSchema);

export default OrderModel;
