import express from 'express';
import * as ctrl from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/authSchema.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(ctrl.register),
);

router.post('/login', validateBody(loginSchema), ctrlWrapper(ctrl.login));
router.post('/logout', authenticate, ctrlWrapper(ctrl.logout));
router.post('/refresh', ctrlWrapper(ctrl.refreshSession));

export default router;
