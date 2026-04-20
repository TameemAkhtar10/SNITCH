import { Router } from 'express';
import passport from 'passport';
import { registercontroller, logincontroller, googleCallback ,getmecontroller} from '../controller/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validateRegister, registercontroller)
router.post('/login', validateLogin, logincontroller)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login', session: false }),
    googleCallback
);
router.get('/me', authenticateUser, getmecontroller);

export default router;