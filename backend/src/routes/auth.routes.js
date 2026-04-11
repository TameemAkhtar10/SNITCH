import {Router} from 'express';
import { registercontroller } from '../controller/auth.controller.js';
import validateRegister from '../validators/auth.validator.js';

 const router = Router();

router.post('/register', validateRegister, registercontroller)

export default router;