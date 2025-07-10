import { Router } from 'express';
import {
  handleGetAllContacts,
  handleGetContactById,
} from '../controller/contacts.js';

const router = Router();

router.get('/', handleGetAllContacts);
router.get('/:contactId', handleGetContactById);

export default router;
