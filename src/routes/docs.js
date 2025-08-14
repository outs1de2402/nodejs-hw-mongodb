// routes/docs.js
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const swaggerPath = path.resolve('docs', 'swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
