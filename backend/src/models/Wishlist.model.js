import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }]
}, { timestamps: true });

const WishlistModel = mongoose.model('Wishlist', wishlistSchema);

export default WishlistModel;