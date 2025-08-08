import * as service from '../services/contacts.js';
import createError from 'http-errors';
import fs from 'fs/promises';
import { uploadImage } from '../services/cloudinary.js';
export const getAllContacts = async (req, res) => {
  const userId = req.user._id;
  const result = await service.getAllContacts(userId, req.query);
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: result,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const data = await service.getContactById(contactId, userId);
  if (!data) throw createError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data,
  });
};

export const createContact = async (req, res) => {
  const userId = req.user._id;
  const data = await service.createContact(req.body, userId);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const data = await service.updateContact(contactId, req.body, userId);

  if (!data) throw createError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: 'Successfully updated a contact!',
    data,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const result = await service.deleteContact(contactId, userId);

  if (!result) throw createError(404, 'Contact not found');

  res.status(204).send(); // No content
};

export default {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
export const addContact = async (req, res) => {
  const { _id: userId } = req.user;
  const { path } = req.file || {};

  let photoUrl = '';
  if (path) {
    photoUrl = await uploadImage(path);
    await fs.unlink(path);
  }

  const contact = await Contact.create({
    ...req.body,
    userId,
    photo: photoUrl,
  });

  res.status(201).json(contact);
};
