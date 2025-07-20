import * as service from '../services/contacts.js';
import createError from 'http-errors';

export const getAllContacts = async (req, res) => {
  const result = await service.getAllContacts(req.query);
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: result,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const data = await service.getContactById(contactId);
  if (!data) throw createError(404, 'Contact not found');
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data,
  });
};

export const createContact = async (req, res) => {
  const data = await service.createContact(req.body);
  res
    .status(201)
    .json({ status: 201, message: 'Successfully created a contact!', data });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const data = await service.updateContact(contactId, req.body);
  if (!data) throw createError(404, 'Contact not found');
  res
    .status(200)
    .json({ status: 200, message: 'Successfully patched a contact!', data });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await service.deleteContact(contactId);
  if (!result) throw createError(404, 'Contact not found');
  res.status(204).send();
};

export default {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
