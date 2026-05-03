import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { addRecentlyViewed, getRecentlyViewed } from '../controller/user.controller.js';
import { validateRecentlyViewed } from '../validators/user.validator.js';

const router = Router();

router.post('/recently-viewed', authenticateUser, validateRecentlyViewed, addRecentlyViewed);
router.get('/recently-viewed', authenticateUser, getRecentlyViewed);

export default router;