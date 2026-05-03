import { Router } from 'express';
import { checkDeliveryByPincode } from '../controller/delivery.controller.js';

const router = Router();

router.get('/check/:pincode', checkDeliveryByPincode);

export default router;