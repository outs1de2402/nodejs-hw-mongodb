import { Contact } from '../models/contact.js';

export const getAllContacts = () => Contact.find();

export const getContactById = (id) => Contact.findById(id);
