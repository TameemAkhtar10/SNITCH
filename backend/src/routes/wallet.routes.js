import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  getWalletBalance,
  getWalletTransactions,
  addMoneyToWallet,
  verifyWalletTopup,
  payWithWallet,
} from "../controller/wallet.controller.js";

const router = Router();

router.get("/balance", authenticateUser, getWalletBalance);
router.get("/transactions", authenticateUser, getWalletTransactions);
router.post("/add", authenticateUser, addMoneyToWallet);
router.post("/verify", authenticateUser, verifyWalletTopup);
router.post("/pay", authenticateUser, payWithWallet);

export default router;
