import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controller/wishlist.controller.js';
import { validateAddWishlist } from '../validators/wishlist.validator.js';

const router = Router();

router.post('/add', authenticateUser, validateAddWishlist, addToWishlist);
router.delete('/remove/:productId', authenticateUser, removeFromWishlist);
router.get('/', authenticateUser, getWishlist);

export default router;