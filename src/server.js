import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routes/contacts.js';

export function setupServer() {
  const app = express();
  const logger = pino();

  app.use(pinoHttp({ logger }));
  app.use(cors());
  app.use(express.json());

  // ---------- маршрути ----------
  app.use('/contacts', contactsRouter);

  // ---------- 404 ----------
  app.use('*', (_, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
}
