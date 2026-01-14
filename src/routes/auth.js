import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  sendResetEmail,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerSchema,
  loginSchema,
  requestResetEmailSchema,
} from '../schemas/authSchema.js';
import { resetPassword } from '../controllers/auth.js';
import { resetPasswordSchema } from '../schemas/authSchema.js';
const router = express.Router();

router.post('/register', validateBody(registerSchema), ctrlWrapper(register));
router.post('/login', validateBody(loginSchema), ctrlWrapper(login));
router.post('/refresh', ctrlWrapper(refresh));
router.post('/logout', ctrlWrapper(logout));
router.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(sendResetEmail),
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPassword),
);

export default router;
