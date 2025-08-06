import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) throw createError(401, 'Access token missing');

    const payload = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) throw createError(401, 'User not found');

    req.user = user;
    next();
  } catch (err) {
    next(createError(401, 'Access token expired or invalid'));
  }
};
