import express from 'express';
import * as ctrl from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contactSchema.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadCloud } from '../services/cloudinary.js';

const router = express.Router();

router.use(authenticate);

router.get('/', ctrlWrapper(ctrl.getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(ctrl.getContactById));
router.post(
  '/',
  uploadCloud.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(ctrl.createContact),
);
router.patch(
  '/:contactId',
  isValidId,
  uploadCloud.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(ctrl.updateContact),
);
router.delete('/:contactId', isValidId, ctrlWrapper(ctrl.deleteContact));

export default router;
