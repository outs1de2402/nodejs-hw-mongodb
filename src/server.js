import 'dotenv/config';
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

await initMongoConnection();
setupServer();

// src/server.js
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundhandler.js';

export function setupServer() {
  const app = express();
  const logger = pino();

  app.use(pinoHttp({ logger }));
  app.use(cors());
  app.use(express.json());

  app.use('/contacts', contactsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
}
