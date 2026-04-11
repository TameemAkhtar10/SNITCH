import express from 'express';
import morgan from 'morgan';

import routes from '../src/routes/auth.routes.js'


const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth',routes)
export default app; 