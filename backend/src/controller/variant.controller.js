import productModel from '../models/product.model.js';
import ImageKit from 'imagekit';
import config from '../config/config.js';

const imagekit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    publicKey: 'public_9Zt7n1sHh8Xl5mLh2uQe3qjvM=',
    urlEndpoint: 'https://ik.imagekit.io/4kqj6c9g0',
});

export const addVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock, priceAmount, priceCurrency = 'INR' } = req.body;
        const sellerId = req.user._id;
        if (stock === undefined || stock === null || stock === '' || priceAmount === undefined || priceAmount === null || priceAmount === '') {
            return res.status(400).json({
                message: 'Stock and price are required',
                success: false,
            });
        }
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                success: false,
            });
        }

        if (product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({
                message: 'Unauthorized to add variants to this product',
                success: false,
            });
        }
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `variant_${Date.now()}_${file.originalname}`,
                    });
                    uploadedImages.push({ url: response.url });
                } catch (error) {
                    console.error('Error uploading image:', error);
                    return res.status(500).json({
                        message: 'Failed to upload image',
                        success: false,
                    });
                }
            }
        }
        const newVariant = {
            stock: parseInt(stock),
            price: {
                amount: parseFloat(priceAmount),
                currency: priceCurrency,
            },
            images: uploadedImages.length > 0 ? uploadedImages : [],
        };
        product.variants.push(newVariant);
        await product.save();

        res.status(201).json({
            message: 'Variant added successfully',
            success: true,
            variant: newVariant,
            data: { variant: newVariant },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

export const getVariants = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                success: false,
            });
        }

        res.status(200).json({
            message: 'Variants fetched successfully',
            success: true,
            variants: product.variants,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

export const updateVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const { stock, priceAmount, priceCurrency } = req.body;
        const sellerId = req.user._id;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                success: false,
            });
        }

        if (product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({
                message: 'Unauthorized to update variants',
                success: false,
            });
        }
        const variantIndex = product.variants.findIndex((v) => v._id.toString() === variantId);
        if (variantIndex === -1) {
            return res.status(404).json({
                message: 'Variant not found',
                success: false,
            });
        }
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `variant_${Date.now()}_${file.originalname}`,
                    });
                    uploadedImages.push({ url: response.url });
                } catch (error) {
                    console.error('Error uploading image:', error);
                    return res.status(500).json({
                        message: 'Failed to upload image',
                        success: false,
                    });
                }
            }
        }
        if (stock !== undefined && stock !== '') product.variants[variantIndex].stock = parseInt(stock, 10);
        if (priceAmount !== undefined && priceAmount !== '') product.variants[variantIndex].price.amount = parseFloat(priceAmount);
        if (priceCurrency) product.variants[variantIndex].price.currency = priceCurrency;
        if (uploadedImages.length > 0) {
            product.variants[variantIndex].images = uploadedImages;
        }

        await product.save();

        res.status(200).json({
            message: 'Variant updated successfully',
            success: true,
            variant: product.variants[variantIndex],
            data: { variant: product.variants[variantIndex] },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

export const deleteVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const sellerId = req.user._id;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                success: false,
            });
        }

        if (product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({
                message: 'Unauthorized to delete variants',
                success: false,
            });
        }
        product.variants = product.variants.filter((v) => v._id.toString() !== variantId);
        await product.save();

        res.status(200).json({
            message: 'Variant deleted successfully',
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};
