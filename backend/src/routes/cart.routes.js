import { Router as Routes } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validateAddToCart, validateUpdateCartQuantity } from '../validators/cart.validator.js';
import { addToCart, getCart, removeCartItem, updateCartItem, clearCart, createOrderController, verifyordercontroller } from '../controller/cart.controller.js';
import { createOrder } from '../services/Payment.service.js';



const router = Routes();


router.post('/add/:productId/:variantId', authenticateUser, validateAddToCart, addToCart)
router.get('/', authenticateUser, getCart)
router.get('/get', authenticateUser, getCart)
router.put('/update/:cartItemId', authenticateUser, validateUpdateCartQuantity, updateCartItem)
router.delete('/remove/:cartItemId', authenticateUser, removeCartItem)
router.delete('/clear', authenticateUser, clearCart)
router.post('/payment/create-order', authenticateUser, createOrderController)
router.post('/payment/verify', authenticateUser, verifyordercontroller)
export default router;