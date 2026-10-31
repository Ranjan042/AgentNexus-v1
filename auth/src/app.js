import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from './config/passport.js';
import router from './routes/authroutes.js';
import { isDatabaseConnected } from './config/database.js';

const app = express();

// Global Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Health check endpoint (reports service and database readiness)
app.get('/health', (req, res) => {
  const connected = isDatabaseConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    service: 'auth-service',
    database: connected ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState,
  });
});

// Auth Routes (mounted at /api)
app.use('/api', router);

// Centralized 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware (Google Style Guide best practice)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;
