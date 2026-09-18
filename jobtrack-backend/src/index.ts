import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

import jobsRouter from './routes/jobs';
import rolesRouter from './routes/roles';
import contactsRouter from './routes/contacts';

// Basic health check
app.get('/healthz', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/contacts', contactsRouter);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
