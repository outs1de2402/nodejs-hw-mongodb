import 'dotenv/config';
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';
import jwt from 'jsonwebtoken';

(async () => {
  await initMongoConnection();
  setupServer();
})();
