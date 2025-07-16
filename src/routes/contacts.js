import express from 'express';
import ctrl from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', ctrlWrapper(ctrl.getAllContacts));
router.get('/:contactId', ctrlWrapper(ctrl.getContactById));
router.post('/', ctrlWrapper(ctrl.createContact));
router.patch('/:contactId', ctrlWrapper(ctrl.updateContact));
router.delete('/:contactId', ctrlWrapper(ctrl.deleteContact));

export default router;
