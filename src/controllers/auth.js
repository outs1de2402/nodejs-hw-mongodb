import * as service from '../services/auth.js';
import createError from 'http-errors';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await service.findUserByEmail(email);
  if (user) throw createError(409, 'Email in use');
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
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
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
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed  in an user!',
    data: { accessToken },
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await service.logoutUser(refreshToken);
  res.clearCookie('refreshToken');
  res.status(204).send();
};
