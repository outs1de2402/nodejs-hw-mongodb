import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import createError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';

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
  if (!session) throw createError(401, 'Session not found');

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
