import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import ticketsRouter from './routes/tickets.js';
import usersRouter from './routes/users.js';
import performanceRouter from './routes/performance.js';
import tasksRouter from './routes/tasks.js';
import notificationsRouter from './routes/notifications.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/users', usersRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/dashboard', dashboardRouter);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
