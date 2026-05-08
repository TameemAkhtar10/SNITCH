import productModel from "../models/product.model.js";
import ImageKit from "imagekit";

import config from '../config/config.js';

const imagekit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    publicKey: "public_9Zt7n1sHh8Xl5mLh2uQe3qjvM=",
    urlEndpoint: 'https://ik.imagekit.io/4kqj6c9g0'
})

const normalizeSizes = (rawSizes, fallbackSize) => {
    let sizes = [];

    if (Array.isArray(rawSizes)) {
        sizes = rawSizes;
    } else if (typeof rawSizes === 'string' && rawSizes.trim()) {
        try {
            const parsed = JSON.parse(rawSizes);
            sizes = Array.isArray(parsed) ? parsed : [];
        } catch {
            sizes = rawSizes.split(',');
        }
    }

    if (!sizes.length && fallbackSize !== undefined && fallbackSize !== null && String(fallbackSize).trim()) {
        sizes = [fallbackSize];
    }

    return [...new Set(
        sizes
            .map((s) => String(s || '').trim())
            .filter(Boolean)
    )];
};

export const createproductcontroller = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency = "INR", stock, variants } = req.body;
        const sellerId = req.user._id;

        if (!title || !description || !priceAmount) {
            return res.status(400).json({ success: false, message: "Title, description, and price are required", data: {} });
        }

        // Upload main product images (fieldname: 'files')
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            const mainFiles = req.files.filter(f => f.fieldname === 'files');
            for (const file of mainFiles) {
                try {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `${Date.now()}_${file.originalname}`
                    });
                    uploadedImages.push({ url: response.url });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    return res.status(500).json({ success: false, message: "Failed to upload image", data: {} });
                }
            }
        }

        // Process variant images and data
        const variantsData = variants ? JSON.parse(variants) : [];
        const processedVariants = [];
        for (let i = 0; i < variantsData.length; i++) {
            const variantFiles = req.files ? req.files.filter(f => f.fieldname === `variantFiles_${i}`) : [];
            const variantImages = [];
            for (const file of variantFiles) {
                try {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `variant_${Date.now()}_${file.originalname}`
                    });
                    variantImages.push({ url: response.url });
                } catch (error) {
                    console.error("Error uploading variant image:", error);
                    return res.status(500).json({ success: false, message: "Failed to upload variant image", data: {} });
                }
            }

            const normalizedSizes = normalizeSizes(variantsData[i].sizes, variantsData[i].size);

            processedVariants.push({
                stock: variantsData[i].stock !== undefined && variantsData[i].stock !== '' ? parseInt(variantsData[i].stock, 10) : 0,
                price: { amount: variantsData[i].priceAmount !== undefined ? parseFloat(variantsData[i].priceAmount) : 0, currency: variantsData[i].priceCurrency },
                attributes: {
                    size: normalizedSizes[0] || undefined,
                    sizes: normalizedSizes,
                    color: variantsData[i].color
                },
                images: variantImages
            });
        }

        const newProduct = await productModel.create({
            title,
            description,
            seller: sellerId,
            price: {
                amount: priceAmount !== undefined ? parseFloat(priceAmount) : 0,
                currency: priceCurrency
            },
            stock: stock !== undefined && stock !== '' ? parseInt(stock, 10) : 0,
            images: uploadedImages,
            variants: processedVariants
        });

        const populatedProduct = await newProduct.populate('seller', 'fullname email contact');

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: populatedProduct,
            data: { product: populatedProduct }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", data: {} });
    }
}

export async function getSellerProducts(req, res) {
    try {
        const seller = req.user;
        const products = await productModel.find({ seller: seller._id });

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
            data: { products }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", data: {} });
    }
}

export async function getAllProducts(req, res) {
    try {
        const { search, category, minPrice, maxPrice } = req.query;
        const query = {};

        // Add search filter - case insensitive regex on title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Add category filter
        if (category && category !== 'All Products') {
            query.category = category;
        }

        // Add price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            query['price.amount'] = {};
            if (minPrice !== undefined) {
                query['price.amount'].$gte = parseFloat(minPrice);
            }
            if (maxPrice !== undefined) {
                query['price.amount'].$lte = parseFloat(maxPrice);
            }
        }

        const products = await productModel.find(query);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
            data: { products }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", data: {} });
    }
}
export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found", data: {} });
        }
        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product,
            data: { product }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", data: {} });
    }
}

export const updateproductcontroller = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priceAmount, priceCurrency = "INR", stock, variants, existingImages } = req.body;
        const sellerId = req.user._id;

        // Find the product
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found", data: {} });
        }

        // Check if the current user is the seller
        if (product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this product", data: {} });
        }

        // Handle new images upload (only main product images with fieldname 'files')
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            const mainFiles = req.files.filter(f => f.fieldname === 'files');
            for (const file of mainFiles) {
                try {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `${Date.now()}_${file.originalname}`
                    });
                    uploadedImages.push({ url: response.url });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    return res.status(500).json({ success: false, message: "Failed to upload image", data: {} });
                }
            }
        }

        // Combine existing and new images
        let images = [];
        if (existingImages) {
            try {
                images = JSON.parse(existingImages);
            } catch (e) {
                images = [];
            }
        }
        images = [...images, ...uploadedImages];

        // Update product
        product.title = title || product.title;
        product.description = description || product.description;
        product.price = {
            amount: priceAmount || product.price.amount,
            currency: priceCurrency || product.price.currency
        };
        if (stock !== undefined && stock !== '') {
            product.stock = parseInt(stock, 10);
        }
        if (images.length > 0) {
            product.images = images;
        }
        if (variants) {
            try {
                product.variants = JSON.parse(variants);
            } catch (e) {
                product.variants = [];
            }
        }

        await product.save();
        const updatedProduct = await product.populate('seller', 'fullname email contact');

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
            data: { product: updatedProduct }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", data: {} });
    }
}