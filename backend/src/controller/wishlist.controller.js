import WishlistModel from '../models/Wishlist.model.js';
import productModel from '../models/product.model.js';

async function getWishlistDoc(userId) {
    let wishlist = await WishlistModel.findOne({ user: userId }).populate('products');

    if (!wishlist) {
        wishlist = await WishlistModel.create({ user: userId, products: [] });
        wishlist = await wishlist.populate('products');
    }

    return wishlist;
}

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required', data: {} });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found', data: {} });
        }

        let wishlist = await WishlistModel.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await WishlistModel.create({ user: req.user._id, products: [productId] });
        } else if (wishlist.products.some((item) => String(item) === String(productId))) {
            return res.status(409).json({ success: false, message: 'Product already in wishlist', data: {} });
        } else {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        wishlist = await WishlistModel.findOne({ user: req.user._id }).populate('products');

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist successfully',
            wishlist
            , data: { wishlist }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await WishlistModel.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found', data: {} });
        }

        wishlist.products = wishlist.products.filter((item) => String(item) !== String(productId));
        await wishlist.save();

        const populatedWishlist = await WishlistModel.findOne({ user: req.user._id }).populate('products');

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist successfully',
            wishlist: populatedWishlist,
            data: { wishlist: populatedWishlist }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const wishlist = await getWishlistDoc(req.user._id);

        return res.status(200).json({
            success: true,
            message: 'Wishlist fetched successfully',
            wishlist,
            data: { wishlist }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};