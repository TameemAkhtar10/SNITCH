import Cartmodel from '../models/Cart.model.js';
import productModel from '../models/product.model.js'
import { stockOfVarient } from '../Dao/Product.Dao.js';

export const addToCart = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const product = await productModel.findOne({ _id: productId, 'variants._id': variantId }, { 'variants.$': 1 });
        if (!product) {
            return res.status(404).json({ message: 'Product not found', success: false });
        }
        const stock = await stockOfVarient(productId, variantId);

        let cart = (await Cartmodel.findOne({ user: req.user._id })) || new Cartmodel({ user: req.user._id, products: [] });

        const isproductExist = cart.products.find(p => p.product.toString() === productId && p.variant.toString() === variantId);
        if (isproductExist) {
            const quantity = isproductExist.quantity + req.body.quantity;
            if (quantity > stock) {
                return res.status(400).json({ message: `Only ${stock} items in stock`, success: false });
            }
            await Cartmodel.findOneAndUpdate(
                { user: req.user._id, 'products._id': isproductExist._id },
                { $set: { 'products.$.quantity': quantity } },
                { new: true }
            );
            return res.status(200).json({ message: 'Cart updated successfully', success: true });
        } else {
            if (req.body.quantity > stock) {
                return res.status(400).json({ message: `Only ${stock} items in stock`, success: false });
            }
            cart.products.push({
                product: productId,
                variant: variantId,
                quantity: req.body.quantity
            });
            await cart.save();
            return res.status(200).json({ message: 'Product added to cart successfully', success: true });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getCart = async (req, res) => {
    let user = req.user
    let cart = await Cartmodel.findOne({ user: user._id }).populate('products.product').populate('products.variant');
    if (!cart) {
        cart = await Cartmodel.create({ user: user._id });
    }
    res.status(200).json({ message: 'Cart retrieved successfully', success: true, cart });
}