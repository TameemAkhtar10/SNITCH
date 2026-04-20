import express from 'express';
import morgan from 'morgan';
import config from './config/config.js';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cookieParser from 'cookie-parser';

import routes from '../src/routes/auth.routes.js'
import productRoutes from '../src/routes/product.route.js'


const app = express();
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
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

app.use(morgan('dev'));
app.use('/api/auth', routes)
app.use('/api/product', productRoutes)
export default app; 