import express from 'express';
import { addVariant, getVariants, updateVariant, deleteVariant } from '../controller/variant.controller.js';
import { authenticateSeller } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/:productId/variants', authenticateSeller, upload.array('files'), addVariant);

router.get('/:productId/variants', getVariants);

router.put('/:productId/variants/:variantId', authenticateSeller, upload.array('files'), updateVariant);

router.delete('/:productId/variants/:variantId', authenticateSeller, deleteVariant);

export default router;
