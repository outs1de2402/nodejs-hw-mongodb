import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const router = express.Router();

const swaggerFile = JSON.parse(fs.readFileSync('./docs/swagger.json', 'utf8'));

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

export default router;
