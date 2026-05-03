import { Router as Routes } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validateAddToCart, validateUpdateCartQuantity } from '../validators/cart.validator.js';
import { addToCart, getCart, removeCartItem, updateCartItem } from '../controller/cart.controller.js';




const router = Routes();


router.post('/add/:productId/:variantId', authenticateUser, validateAddToCart, addToCart)
router.get('/', authenticateUser, getCart)
router.get('/get', authenticateUser, getCart)
router.put('/update/:cartItemId', authenticateUser, validateUpdateCartQuantity, updateCartItem)
router.delete('/remove/:cartItemId', authenticateUser, removeCartItem)

export default router;