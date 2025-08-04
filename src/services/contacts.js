import { Contact } from '../models/contact.js';

export const getAllContacts = async (
  userId,
  {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  },
) => {
  const skip = (page - 1) * perPage;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const filter = { userId };
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined') {
    filter.isFavourite = isFavourite === 'true';
  }

  const [totalItems, data] = await Promise.all([
    Contact.countDocuments(filter),
    Contact.find(filter).sort(sort).skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const getContactById = (id, userId) =>
  Contact.findOne({ _id: id, userId });

export const createContact = (data, userId) =>
  Contact.create({ ...data, userId });

export const updateContact = (id, data, userId) =>
  Contact.findOneAndUpdate({ _id: id, userId }, data, { new: true });

export const deleteContact = (id, userId) =>
  Contact.findOneAndDelete({ _id: id, userId });
