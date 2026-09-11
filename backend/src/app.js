import express from 'express';
import morgan from 'morgan';
import config from './config/config.js';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import routes from '../src/routes/auth.routes.js';
import productRoutes from '../src/routes/product.route.js';
import variantRoutes from '../src/routes/variant.routes.js';
import cartRoutes from '../src/routes/cart.routes.js';
import wishlistRoutes from '../src/routes/wishlist.routes.js';
import reviewsRoutes from '../src/routes/reviews.routes.js';
import deliveryRoutes from '../src/routes/delivery.routes.js';
import userRoutes from '../src/routes/user.routes.js';
import orderRoutes from '../src/routes/order.routes.js';
import walletRoutes from '../src/routes/wallet.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173',
    'https://snitch-aukv.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.use(express.json());

app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
    )
    next()
})

app.use(morgan('dev'));

app.use('/api/auth', routes);
app.use('/api/product', productRoutes);
app.use('/api/products', variantRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);

const distPath = path.join(__dirname, '../public/dist');
console.log('Serving static files from:', distPath);

app.use(express.static(distPath, {
    maxAge: '1d',
    etag: false,
    index: false
}));

// SPA fallback: serve index.html for non-API routes
app.use((req, res) => {
    if (/\.[a-z]+$/i.test(req.path)) {
        return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

export default app;