import mongoose from "mongoose";
import Razorpay from "razorpay";
import config from "../config/config.js";
import userModel from "../models/user.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getWalletBalance = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId || !isValidObjectId(userId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user ID", data: {} });
        }

        const user = await userModel.findById(userId).select("walletBalance");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found", data: {} });
        }

        return res.status(200).json({
            success: true,
            message: "Wallet balance retrieved",
            data: { balance: user.walletBalance || 0 },
        });
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wallet balance",
            data: {},
        });
    }
};

/**
 * GET /api/wallet/transactions
 * Return all wallet transactions for the user, sorted by latest
 */
export const getWalletTransactions = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId || !isValidObjectId(userId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user ID", data: {} });
        }

        const transactions = await WalletTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Wallet transactions retrieved",
            data: { transactions },
        });
    } catch (error) {
        console.error("Error fetching wallet transactions:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wallet transactions",
            data: {},
        });
    }
};

/**
 * POST /api/wallet/add
 * Create a Razorpay order for adding money to wallet
 */
export const addMoneyToWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!userId || !isValidObjectId(userId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user ID", data: {} });
        }

        if (!amount || Number(amount) <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Valid amount is required", data: {} });
        }

        const amountInPaisa = Math.round(Number(amount) * 100);

        // Verify Razorpay keys are configured
        if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys are not configured in environment')
            return res.status(500).json({ success: false, message: 'Razorpay not configured', data: {} })
        }

        // Create Razorpay order
        let razorpayOrder
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: amountInPaisa,
                currency: "INR",
                receipt: `wl_${Date.now()}`
            });
        } catch (rpError) {
            console.error('Razorpay order creation failed:', rpError?.message || rpError)
            return res.status(502).json({ success: false, message: 'Failed to create wallet topup order', data: { error: rpError?.message || String(rpError) } })
        }

        return res.status(200).json({
            success: true,
            message: "Razorpay order created for wallet topup",
            data: {
                order: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                },
                keyId: config.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error("Error creating wallet topup order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create wallet topup order",
            data: { error: error?.message || String(error) },
        });
    }
};

/**
 * POST /api/wallet/verify
 * Verify Razorpay payment and add amount to wallet
 */
export const verifyWalletTopup = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            amount,
        } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!userId || !isValidObjectId(userId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user ID", data: {} });
        }

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required",
                data: {},
            });
        }

        if (!amount || Number(amount) <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Valid amount is required", data: {} });
        }

        // Verify Razorpay signature
        const crypto = await import("crypto");
        const generatedSignature = crypto
            .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
                data: {},
            });
        }

        // Update user wallet balance
        const user = await userModel.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found", data: {} });
        }

        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        await user.save();

        // Create credit transaction
        await WalletTransaction.create({
            userId,
            amount: Number(amount),
            type: "credit",
            description: "Money added to wallet",
            razorpayPaymentId: razorpay_payment_id,
        });

        return res.status(200).json({
            success: true,
            message: "Wallet topup verified and amount credited",
            data: { balance: user.walletBalance },
        });
    } catch (error) {
        console.error("Error verifying wallet topup:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify wallet topup",
            data: {},
        });
    }
};

/**
 * POST /api/wallet/pay
 * Deduct amount from wallet for payment, create debit transaction
 */
export const payWithWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!userId || !isValidObjectId(userId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user ID", data: {} });
        }

        if (!amount || Number(amount) <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Valid amount is required", data: {} });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found", data: {} });
        }

        const walletBalance = user.walletBalance || 0;
        if (walletBalance < Number(amount)) {
            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance",
                data: { balance: walletBalance, required: Number(amount) },
            });
        }

        // Deduct amount from wallet
        user.walletBalance = walletBalance - Number(amount);
        await user.save();

        // Create debit transaction
        await WalletTransaction.create({
            userId,
            amount: Number(amount),
            type: "debit",
            description: "Payment from wallet",
        });

        return res.status(200).json({
            success: true,
            message: "Payment processed from wallet",
            data: { balance: user.walletBalance },
        });
    } catch (error) {
        console.error("Error processing wallet payment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process wallet payment",
            data: {},
        });
    }
};
