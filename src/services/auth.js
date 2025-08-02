import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import createError from 'http-errors';
import { nanoid } from 'nanoid';

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '30d';

export const findUserByEmail = (email) => User.findOne({ email });

export const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ name, email, password: hashedPassword });
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid email or password');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw createError(401, 'Invalid email or password');

  // Видаляємо стару сесію (якщо існує)
  await Session.findOneAndDelete({ userId: user._id });

  const payload = { sub: user._id.toString(), sid: nanoid() };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

  const accessExp = new Date(Date.now() + 15 * 60 * 1000); // 15 хв
  const refreshExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 днів

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: accessExp,
    refreshTokenValidUntil: refreshExp,
  });

  return { accessToken, refreshToken };
};

export const refreshSession = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw createError(401, 'Refresh token is missing');

  let payload;
  try {
    payload = jwt.verify(oldRefreshToken, REFRESH_SECRET);
  } catch (err) {
    throw createError(401, 'Invalid refresh token');
  }

  const existingSession = await Session.findOne({
    refreshToken: oldRefreshToken,
  });
  if (!existingSession) throw createError(401, 'Session not found');

  // Видаляємо стару сесію
  await Session.findByIdAndDelete(existingSession._id);

  const newPayload = { sub: payload.sub, sid: nanoid() };

  const accessToken = jwt.sign(newPayload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(newPayload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

  const accessExp = new Date(Date.now() + 15 * 60 * 1000);
  const refreshExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await Session.create({
    userId: payload.sub,
    accessToken,
    refreshToken,
    accessTokenValidUntil: accessExp,
    refreshTokenValidUntil: refreshExp,
  });

  return { accessToken, refreshToken };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) throw createError(401, 'Refresh token is missing');
  await Session.findOneAndDelete({ refreshToken });
};
