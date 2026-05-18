import { Router } from "express";
import { authenticateUser, authenticateSeller } from "../middleware/auth.middleware.js";
import { createproductcontroller, getSellerProducts, getAllProducts, getProductById, updateproductcontroller, bulkUploadProducts } from "../controller/product.controller.js";
import { validateCreateProduct, validateUpdateProduct } from "../validators/product.validator.js";
const router = Router();

import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Specific routes should come before generic :id route
router.get('/seller', authenticateUser, getSellerProducts);
// Use upload.any() so multiple fieldnames (e.g. 'files' and 'variantFiles_0') are accepted
router.post('/', upload.any(), authenticateUser, validateCreateProduct, createproductcontroller);
// Bulk CSV upload - single file field named 'file'
router.post('/bulk-upload', upload.single('file'), authenticateUser, authenticateSeller, bulkUploadProducts);
router.put('/:id', upload.any(), authenticateUser, authenticateSeller, validateUpdateProduct, updateproductcontroller);

// Generic routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

export default router;