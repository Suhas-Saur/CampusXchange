import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';
import { seedInMemoryStore } from './utils/mockData';

// Route imports
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import lostFoundRoutes from './routes/lostFound';
import orderRoutes from './routes/orders';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import reportRoutes from './routes/reports';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect database
connectDB();
seedInMemoryStore();

// API Routing
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', lostFoundRoutes); // Mounts /lost and /found directly under /api
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
