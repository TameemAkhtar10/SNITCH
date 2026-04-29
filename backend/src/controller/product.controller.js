import productModel from "../models/product.model.js";
import ImageKit from "imagekit";

import config from '../config/config.js';

const imagekit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    publicKey: "public_9Zt7n1sHh8Xl5mLh2uQe3qjvM=",
    urlEndpoint: 'https://ik.imagekit.io/4kqj6c9g0'
})

export const createproductcontroller = async (req, res) => {
    console.log(req.body)
    console.log(req.files)
    try {
        const { title, description, priceAmount, priceCurrency = "INR", variants } = req.body;
        const sellerId = req.user._id;

        if (!title || !description || !priceAmount) {
            return res.status(400).json({ message: "Title, description, and price are required" });
        }

        // Upload images if provided
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `${Date.now()}_${file.originalname}`
                    });
                    uploadedImages.push({ url: response.url });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    return res.status(500).json({ message: "Failed to upload image" });
                }
            }
        }

        const newProduct = await productModel.create({
            title,
            description,
            seller: sellerId,
            price: {
                amount: priceAmount,
                currency: priceCurrency
            },
            images: uploadedImages,
            variants: variants ? JSON.parse(variants) : []
        });

        const populatedProduct = await newProduct.populate('seller', 'fullname email contact');

        return res.status(201).json({
            message: "Product created successfully",
            success: true,
            product: populatedProduct
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getSellerProducts(req, res) {
    const seller = req.user;

    const products = await productModel.find({ seller: seller._id });


    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts(req, res) {
    const products = await productModel.find()

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}
export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({
            message: "Product fetched successfully",
            success: true,
            product
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateproductcontroller = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priceAmount, priceCurrency = "INR", variants, existingImages } = req.body;
        const sellerId = req.user._id;

        // Find the product
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the current user is the seller
        if (product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({ message: "Unauthorized to update this product" });
        }

        // Handle new images upload
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `${Date.now()}_${file.originalname}`
                    });
                    uploadedImages.push({ url: response.url });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    return res.status(500).json({ message: "Failed to upload image" });
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
            message: "Product updated successfully",
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}