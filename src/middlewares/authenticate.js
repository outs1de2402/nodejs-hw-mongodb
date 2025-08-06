import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/user.js';

const ACCESS_SECRET = process.env.ACCESS_SECRET;

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(createError(401, 'Unauthorized'));
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) throw createError(401, 'User not found');

    req.user = user;
    next();
  } catch {
    next(createError(401, 'Access token expired'));
  }
};
