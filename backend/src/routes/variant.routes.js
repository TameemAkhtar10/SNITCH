import express from 'express';
import { addVariant, getVariants, updateVariant, deleteVariant } from '../controller/variant.controller.js';
import { authenticateSeller } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { validateAddVariant, validateUpdateVariant } from '../validators/variant.validator.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/:productId/variants', authenticateSeller, upload.array('files'), validateAddVariant, addVariant);

router.get('/:productId/variants', getVariants);

router.put('/:productId/variants/:variantId', authenticateSeller, upload.array('files'), validateUpdateVariant, updateVariant);

router.delete('/:productId/variants/:variantId', authenticateSeller, deleteVariant);

export default router;
