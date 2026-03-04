import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

// Serve static files from the project root
const rootPath = path.join(__dirname, '../../');
app.use(express.static(rootPath));

// Import routers with .js extension for ESM compatibility
import executiveRouter from './routes/executive.js';
import salesRouter from './routes/sales.js';
import marketingRouter from './routes/marketing.js';
import financeRouter from './routes/finance.js';
import operationsRouter from './routes/operations.js';
import supportRouter from './routes/support.js';
import payrollRouter from './routes/payroll.js';
import { verifyUser, adminOnly } from './middleware/auth.js';

// Auth Sub-Router
const apiRouter = express.Router();

// 1. Verify User for ALL API calls
apiRouter.use(verifyUser);

// 2. Protect ALL POST routes (Updates) with adminOnly check
apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST') {
    return adminOnly(req as any, res, next);
  }
  next();
});

// 3. Mount individual routes on the protected apiRouter
apiRouter.use('/executive', executiveRouter);
apiRouter.use('/sales', salesRouter);
apiRouter.use('/marketing', marketingRouter);
apiRouter.use('/finance', financeRouter);
apiRouter.use('/operations', operationsRouter);
apiRouter.use('/support', supportRouter);
apiRouter.use('/payroll', payrollRouter);

// 4. Mount the entire protected API
app.use('/api', apiRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
