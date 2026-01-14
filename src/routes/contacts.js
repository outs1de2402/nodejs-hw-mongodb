import express from 'express';
import * as ctrl from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contactSchema.js';
import { authenticate } from '../middlewares/authenticate.js'; // 🔐 Додано

const router = express.Router();

// 🔐 Захист усіх маршрутів
router.use(authenticate);

router.get('/', ctrlWrapper(ctrl.getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(ctrl.getContactById));
router.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(ctrl.createContact),
);
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(ctrl.updateContact),
);
router.delete('/:contactId', isValidId, ctrlWrapper(ctrl.deleteContact));

export default router;
