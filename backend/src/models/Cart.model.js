import mongoose from 'mongoose';


const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
            },
            quantity: {
                type: Number,
                default: 1,
            }
            , amount: {
                type: Number,
                required: true,
            },
            currency: {
                type: String,
                enum: ["USD", "EUR", "GBP", "JPY", "INR"],
                default: "INR"
            }
        }

    ],

}, { timestamps: true });

const Cartmodel = mongoose.model('Cart', CartSchema);
export default Cartmodel;
