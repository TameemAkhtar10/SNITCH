import { Router } from 'express';
import passport from 'passport';
import { registercontroller, logincontroller, googleCallback, getmecontroller, logoutcontroller } from '../controller/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', authRateLimit, validateRegister, registercontroller)
router.post('/login', authRateLimit, validateLogin, logincontroller)
router.get('/google', (req, res, next) => {
    const redirectTo = req.query.redirectTo || '/home';
    return passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: redirectTo,
    })(req, res, next);
});
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: 'https://snitch-aukv.onrender.com/login', session: false }),
    googleCallback
);
router.get('/me', authenticateUser, getmecontroller);
router.post('/logout', authenticateUser, logoutcontroller);

export default router;