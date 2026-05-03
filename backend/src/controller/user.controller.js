import usermodel from '../models/user.model.js';
import productModel from '../models/product.model.js';

export const addRecentlyViewed = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required', data: {} });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found', data: {} });
        }

        const user = await usermodel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', data: {} });
        }

        const existingItems = Array.isArray(user.recentlyViewed) ? user.recentlyViewed : [];
        user.recentlyViewed = [
            product._id,
            ...existingItems.filter((item) => String(item) !== String(product._id))
        ].slice(0, 10);

        await user.save();

        const populatedUser = await usermodel.findById(req.user._id).populate('recentlyViewed');

        return res.status(200).json({
            success: true,
            message: 'Recently viewed updated successfully',
            recentlyViewed: populatedUser.recentlyViewed,
            data: { recentlyViewed: populatedUser.recentlyViewed }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const getRecentlyViewed = async (req, res) => {
    try {
        const user = await usermodel.findById(req.user._id).populate('recentlyViewed');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', data: {} });
        }

        return res.status(200).json({
            success: true,
            message: 'Recently viewed fetched successfully',
            recentlyViewed: user.recentlyViewed || [],
            data: { recentlyViewed: user.recentlyViewed || [] }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};