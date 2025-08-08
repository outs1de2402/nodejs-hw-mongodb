import * as service from '../services/auth.js';
import { User } from '../models/user.js';
import { sendEmail } from '../services/email.js';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await service.findUserByEmail(email);
  if (user) throw createHttpError(409, 'Email in use');
  const newUser = await service.createUser({ name, email, password });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, session } = await service.loginUser(
    email,
    password,
  );

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .cookie('sessionId', session._id.toString(), {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
};

export const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await service.refreshSession(
    oldRefreshToken,
  );

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
};

export const logout = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) await service.logoutUser(sessionId);

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.status(204).send();
};

//!

//!
export const sendResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found!');

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

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

//!!!!!!!!
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, 'User not found!');

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
