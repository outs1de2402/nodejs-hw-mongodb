import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().allow(null),
  isFavourite: Joi.boolean().optional(),
  contactType: Joi.string().valid('personal', 'home', 'work').required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().email().allow(null),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('personal', 'home', 'work'),
}).min(1);
