import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import createHttpError from 'http-errors';

import { sendEmail } from './email.js';

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
  if (!user) throw createHttpError(401, 'Invalid email or password');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw createHttpError(401, 'Invalid email or password');

  await Session.deleteMany({ userId: user._id });

  const sid = nanoid();

  const accessToken = jwt.sign({}, ACCESS_SECRET, {
    subject: user._id.toString(),
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ sid }, REFRESH_SECRET, {
    subject: user._id.toString(),
    expiresIn: REFRESH_EXPIRES_IN,
  });

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken, session };
};

export const refreshSession = async (oldRefreshToken) => {
  const payload = jwt.verify(oldRefreshToken, REFRESH_SECRET);
  const session = await Session.findOne({ refreshToken: oldRefreshToken });
  if (!session) throw createHttpError(401, 'Session not found');

  await session.deleteOne();

  const newSid = nanoid();

  const accessToken = jwt.sign({}, ACCESS_SECRET, {
    subject: payload.sub,
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ sid: newSid }, REFRESH_SECRET, {
    subject: payload.sub,
    expiresIn: REFRESH_EXPIRES_IN,
  });

  const newSession = await Session.create({
    userId: payload.sub,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken, session: newSession };
};

export const logoutUser = async (sessionId) => {
  await Session.findByIdAndDelete(sessionId);
};
export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found');

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;
  const html = `<p>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`;

  try {
    await sendEmail(email, 'Password Reset', html);
  } catch (err) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
