import {Router as Routes} from 'express';
import {authenticateUser} from '../middleware/auth.middleware.js';
import {validateAddToCart} from '../validators/cart.validator.js';
import {addToCart} from '../controller/cart.controller.js';




const router = Routes();


router.post('/add/:productId/:variantId',authenticateUser,validateAddToCart,addToCart)

export default router;