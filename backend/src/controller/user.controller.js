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

export const addAddress = async (req, res) => {
    try {
        const { name, phone, street, city, state, pincode, country = 'India', isDefault } = req.body;
        
        if (!name || !phone || !street || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: 'All address fields are required', data: {} });
        }

        const user = await usermodel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', data: {} });
        }

        if (!Array.isArray(user.addresses)) {
            user.addresses = [];
        }

        const newAddress = { name, phone, street, city, state, pincode, country, isDefault: isDefault || false };
        
        // If this is the first address or explicitly set as default, make it default
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        } else if (isDefault) {
            // Remove default from other addresses
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Address added successfully',
            addresses: user.addresses,
            data: { addresses: user.addresses }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const user = await usermodel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', data: {} });
        }

        return res.status(200).json({
            success: true,
            message: 'Addresses fetched successfully',
            addresses: user.addresses || [],
            data: { addresses: user.addresses || [] }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await usermodel.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', data: {} });
        }

        const addressIndex = user.addresses.findIndex(addr => String(addr._id) === String(addressId));
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found', data: {} });
        }

        const wasDefault = user.addresses[addressIndex].isDefault;
        user.addresses.splice(addressIndex, 1);

        // If deleted address was default, set the first remaining address as default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            addresses: user.addresses,
            data: { addresses: user.addresses }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await usermodel.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', data: {} });
        }

        const addressIndex = user.addresses.findIndex(addr => String(addr._id) === String(addressId));
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found', data: {} });
        }

        // Remove default from all addresses
        user.addresses.forEach(addr => addr.isDefault = false);
        
        // Set the selected address as default
        user.addresses[addressIndex].isDefault = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            addresses: user.addresses,
            data: { addresses: user.addresses }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, contact } = req.body;
        const user = await usermodel.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', data: {} });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (contact) user.contact = contact;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                contact: user.contact,
                role: user.role
            },
            data: { user }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};