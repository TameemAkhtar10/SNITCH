import Cartmodel from '../models/Cart.model.js';
import productModel from '../models/product.model.js'
import { stockOfVarient } from '../Dao/Product.Dao.js';

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const buildCartItemResponse = (item) => {
    const itemObj = item.toObject ? item.toObject() : item
    const product = itemObj.product
    const variantId = itemObj.variant ? String(itemObj.variant) : null

    if (!product || !variantId) {
        return {
            ...itemObj,
            variantId,
            variant: null,
            productStock: null,
            variantStock: null,
            stock: 0,
        }
    }

    const productId = String(product._id)
    const productStock = toNumber(product.stock, 0)

    if (variantId === productId) {
        return {
            ...itemObj,
            variantId,
            variant: null,
            productStock,
            variantStock: null,
            stock: productStock,
        }
    }

    const matchedVariant = variantId && Array.isArray(product?.variants)
        ? product.variants.find((v) => String(v._id) === variantId)
        : null
    const variantStock = matchedVariant ? toNumber(matchedVariant.stock, 0) : null
    const stock = variantStock ?? productStock

    return {
        ...itemObj,
        variantId,
        variant: matchedVariant,
        productStock,
        variantStock,
        stock,
    }
}

export const addToCart = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        // Check if product exists
        let product = await productModel.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found', data: {} });
        }

        // If variantId is same as productId, it means product has no variants
        let isNoVariantProduct = variantId === productId;
        let selectedVariant = null;

        if (!isNoVariantProduct) {
            // Product has variants - find the variant manually from full product
            selectedVariant = product.variants.find(v => String(v._id) === String(variantId));
            if (!selectedVariant) {
                return res.status(404).json({ success: false, message: 'Variant not found', data: {} });
            }
        } else {
            // Product has no variants - use product's base price and stock
            selectedVariant = {
                _id: productId,
                stock: product.stock,
                price: product.price
            };
        }

        const stock = selectedVariant.stock;

        let cart = (await Cartmodel.findOne({ user: req.user._id })) || new Cartmodel({ user: req.user._id, items: [] });

        const isItemExist = cart.items.find(p => String(p.product) === String(productId) && String(p.variant) === String(variantId));

        if (isItemExist) {
            const quantity = isItemExist.quantity + req.body.quantity;
            if (quantity > stock) {
                return res.status(400).json({ success: false, message: `Only ${stock} items in stock`, data: {} });
            }
            await Cartmodel.findOneAndUpdate(
                { user: req.user._id, 'items._id': isItemExist._id },
                { $set: { 'items.$.quantity': quantity } },
                { new: true }
            );
            const updatedCart = await Cartmodel.findOne({ user: req.user._id }).populate('items.product', 'stock variants images title description price');
            return res.status(200).json({ success: true, message: 'Cart updated successfully', cart: updatedCart, items: updatedCart.items, data: { cart: updatedCart } });
        } else {
            if (req.body.quantity > stock) {
                return res.status(400).json({ success: false, message: `Only ${stock} items in stock`, data: {} });
            }
            cart.items.push({
                product: productId,
                variant: variantId,
                quantity: req.body.quantity,
                amount: selectedVariant.price.amount,
                currency: selectedVariant.price.currency
            });
            await cart.save();
            const updatedCart = await Cartmodel.findOne({ user: req.user._id }).populate('items.product', 'stock variants images title description price');
            return res.status(200).json({ success: true, message: 'Product added to cart successfully', cart: updatedCart, items: updatedCart.items, data: { cart: updatedCart } });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
}

export const getCart = async (req, res) => {
    let user = req.user
    try {
        let cart = await Cartmodel.findOne({ user: user._id }).populate('items.product', 'stock variants images title description price');
        if (!cart) {
            cart = await Cartmodel.create({ user: user._id });
        }

        const cartObj = cart.toObject();
        cartObj.items = (cartObj.items || []).map((item) => buildCartItemResponse(item));

        // Calculate totals via aggregation
        const cartAggregation = await Cartmodel.aggregate([
            { $match: { user: req.user._id } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$_id',
                    subtotal: { $sum: { $multiply: ['$items.amount', '$items.quantity'] } },
                    totalItems: { $sum: '$items.quantity' },
                    itemCount: { $sum: 1 }
                }
            }
        ]).exec();

        const totals = cartAggregation && cartAggregation.length ? cartAggregation[0] : { subtotal: 0, totalItems: 0, itemCount: 0 }

        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            cart: cartObj,
            items: cartObj.items,
            subtotal: totals.subtotal || 0,
            totalItems: totals.totalItems || 0,
            itemCount: totals.itemCount || 0,
            data: { cart: cartObj, items: cartObj.items },
        });
    } catch (error) {
        console.error('Error retrieving cart:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
}

export const updateCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const quantity = toNumber(req.body.quantity, 0);

        const cart = await Cartmodel.findOne({ user: req.user._id }).populate('items.product', 'stock variants images title description price');
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found', data: {} });
        }

        const cartItem = cart.items.id(cartItemId);
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found', data: {} });
        }

        const cartItemWithStock = buildCartItemResponse(cartItem.toObject());
        if (quantity > cartItemWithStock.stock) {
            return res.status(400).json({ success: false, message: `Only ${cartItemWithStock.stock} items in stock`, data: {} });
        }

        cartItem.quantity = quantity;
        await cart.save();
        await cart.populate('items.product', 'stock variants images title description price');

        const cartObj = cart.toObject();
        cartObj.items = (cartObj.items || []).map((item) => buildCartItemResponse(item));

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart: cartObj,
            items: cartObj.items,
            data: { cart: cartObj, items: cartObj.items },
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
}

export const removeCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params;

        const updatedCart = await Cartmodel.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { items: { _id: cartItemId } } },
            { new: true }
        ).populate('items.product', 'stock variants images title description price');

        if (!updatedCart) {
            return res.status(404).json({ success: false, message: 'Cart not found', data: {} });
        }

        return res.status(200).json({ success: true, message: 'Item removed successfully', cart: updatedCart, data: { cart: updatedCart } });
    } catch (error) {
        console.error('Error removing cart item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
}

