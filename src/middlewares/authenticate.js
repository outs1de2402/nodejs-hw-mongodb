import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/user.js';

const ACCESS_SECRET = process.env.ACCESS_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) throw createError(401, 'Not authorized');

    const { sub } = jwt.verify(token, ACCESS_SECRET); // <-- тут важливо
    const user = await User.findById(sub); // <-- шукаємо користувача по sub

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
