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