import * as service from '../services/contacts.js';
import createError from 'http-errors';
import { Contact } from '../models/contact.js';

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
  const { _id: userId } = req.user;
  const contactData = { ...req.body, userId };

  if (req.file?.path) {
    contactData.photo = req.file.path; // Cloudinary повертає URL в req.file.path
  }

  const contact = await Contact.create(contactData);
  res.status(201).json(contact);
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;

  const updateData = { ...req.body };
  if (req.file?.path) {
    updateData.photo = req.file.path;
  }

  const contact = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true },
  );

  if (!contact) throw createError(404, 'Contact not found');

  res.status(200).json(contact);
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const result = await service.deleteContact(contactId, userId);

  if (!result) throw createError(404, 'Contact not found');

  res.status(204).send();
};
