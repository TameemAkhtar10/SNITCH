import { Router } from "express";
import { authenticateUser, authenticateSeller } from "../middleware/auth.middleware.js";
import { createproductcontroller, getSellerProducts, getAllProducts, getProductById, updateproductcontroller } from "../controller/product.controller.js";
const router = Router();

import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Specific routes should come before generic :id route
router.get('/seller', authenticateUser, getSellerProducts);
router.post('/', upload.array('files', 7), authenticateUser, createproductcontroller);
router.put('/:id', upload.array('files', 7), authenticateUser, authenticateSeller, updateproductcontroller);

// Generic routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

export default router;