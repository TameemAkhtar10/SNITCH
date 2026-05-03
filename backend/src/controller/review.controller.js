import mongoose from 'mongoose';
import ReviewModel from '../models/Review.model.js';
import productModel from '../models/product.model.js';

async function updateProductReviewStats(productId) {
    const stats = await ReviewModel.aggregate([
        {
            $match: { product: new mongoose.Types.ObjectId(productId) }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    const averageRating = stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0;
    const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

    await productModel.findByIdAndUpdate(productId, {
        averageRating,
        totalReviews
    });

    return { averageRating, totalReviews };
}

export const addOrUpdateReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment = '' } = req.body;
        const parsedRating = Number(rating);

        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5', data: {} });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found', data: {} });
        }

        const existingReview = await ReviewModel.findOne({ product: productId, user: req.user._id });
        if (existingReview) {
            return res.status(409).json({ success: false, message: 'You have already reviewed this product', data: {} });
        }

        let review = await ReviewModel.create({
            product: productId,
            user: req.user._id,
            rating: parsedRating,
            comment
        });

        const reviewStats = await updateProductReviewStats(productId);
        review = await review.populate('user', 'fullname email role');

        return res.status(200).json({
            success: true,
            message: 'Review added successfully',
            review,
            data: { review, ...reviewStats }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const getReviewsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found', data: {} });
        }

        const reviews = await ReviewModel.find({ product: productId })
            .populate('user', 'fullname email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Reviews fetched successfully',
            reviews,
            averageRating: product.averageRating || 0,
            totalReviews: product.totalReviews || 0,
            data: { reviews, averageRating: product.averageRating || 0, totalReviews: product.totalReviews || 0 }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found', data: {} });
        }

        if (String(review.user) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this review', data: {} });
        }

        const productId = review.product;
        await review.deleteOne();

        const reviewStats = await updateProductReviewStats(productId);

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
            data: { ...reviewStats }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};