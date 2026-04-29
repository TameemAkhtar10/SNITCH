import productModel from "../models/product.model.js";

export const stockOfVarient = async (productId, variantId) => {
    try {

        const product = await productModel.findOne({ _id: productId, 'variants._id': variantId }, 

        );

        const stock = product?.variants.find(v => v._id.toString() === variantId)?.stock || 0;
        return stock;
    } catch (error) {
        console.log(error);
        throw error;
    }
}