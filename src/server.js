import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routes/contacts.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import { notFoundHandler } from './middlewares/notFoundhandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import docsRouter from './routes/docs.js';

export function setupServer() {
  const app = express();
  const logger = pino();

  // 🔧 Порядок важливий
  app.use(pinoHttp({ logger }));
  app.use(
    cors({
      origin: 'http://localhost:3000', // або твій фронт
      credentials: true,
    }),
  );
  app.use(express.json()); // 🔥 JSON parser має бути перед роутами
  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.send('API is working');
  });

  // 🔧 Роути підключаються після всіх парсерів
  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  app.use(docsRouter);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
}
