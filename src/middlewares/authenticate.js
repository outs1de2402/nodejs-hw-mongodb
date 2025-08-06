import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/user.js';

const ACCESS_SECRET = process.env.ACCESS_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) throw createError(401, 'Not authorized');

    const { sub } = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(sub);
    if (!user) throw createError(401, 'User not found');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      next(createError(401, 'Access token expired'));
    } else {
      next(createError(401, 'Invalid token'));
    }
  }
};
