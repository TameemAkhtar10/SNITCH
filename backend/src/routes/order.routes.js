import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { cancelOrder, createOrder, generateBill, getOrderById, getSellerOrders, getUserOrders, updateOrderStatus } from '../controller/order.controller.js';

const router = Router();

router.use(authenticateUser);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/seller', getSellerOrders);
router.post('/:orderId/bill', generateBill);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/cancel', cancelOrder);
router.patch('/:orderId/status', updateOrderStatus);

export default router;
