import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { addOrUpdateReview, deleteReview, getReviewsByProductId } from '../controller/review.controller.js';
import { validateAddReview } from '../validators/review.validator.js';

const router = Router();

router.post('/:productId', authenticateUser, validateAddReview, addOrUpdateReview);
router.get('/:productId', getReviewsByProductId);
router.delete('/:reviewId', authenticateUser, deleteReview);

export default router;