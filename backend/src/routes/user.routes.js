import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { addRecentlyViewed, getRecentlyViewed, addAddress, getAddresses, deleteAddress, setDefaultAddress, updateProfile } from '../controller/user.controller.js';
import { validateRecentlyViewed } from '../validators/user.validator.js';

const router = Router();

router.post('/recently-viewed', authenticateUser, validateRecentlyViewed, addRecentlyViewed);
router.get('/recently-viewed', authenticateUser, getRecentlyViewed);

// Address routes
router.post('/address', authenticateUser, addAddress);
router.get('/addresses', authenticateUser, getAddresses);
router.delete('/address/:addressId', authenticateUser, deleteAddress);
router.patch('/address/:addressId/default', authenticateUser, setDefaultAddress);

// Profile routes
router.patch('/profile', authenticateUser, updateProfile);

export default router;