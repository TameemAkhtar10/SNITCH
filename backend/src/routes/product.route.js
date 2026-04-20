import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { createproductcontroller, getSellerProducts } from "../controller/product.controller.js";
const router = Router();

import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', upload.array('files', 7), authenticateUser, createproductcontroller);

router.get('/seller', authenticateUser, getSellerProducts);


export default router;