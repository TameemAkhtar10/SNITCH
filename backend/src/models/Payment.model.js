import mongoose from 'mongoose'


let PaySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    price: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            enum: ["USD", "EUR", "GBP", "JPY", "INR"],
            required: true,
            default: "INR"
        }
    },
    razorpay: {
        orderId: String,
        paymentId: String,
        signature: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItem:[ {
        title: String,
        description: String,
        productId: mongoose.Schema.Types.ObjectId,
        variantId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        price: {
            amount: {
                type: Number,
                required: true
            },
            currency: {
                type: String,
                enum: ["USD", "EUR", "GBP", "JPY", "INR"],
                required: true,
                default: "INR"
            }
        },
           images: [{url: String}]
    }]
}, { timestamps: true })

const Payment = mongoose.model('Payment', PaySchema)

export default Payment
