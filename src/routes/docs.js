// routes/docs.js
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Читаємо згенерований Redocly JSON
const swaggerFilePath = path.join(process.cwd(), 'docs', 'swagger.json');
let swaggerDocument = {};
if (fs.existsSync(swaggerFilePath)) {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf-8'));
}

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
