import http from 'http';
import express from 'express';
import morgan from 'morgan';
import { sandboxAuthGuard } from './middleware/authGuard.js';
import { attachWsUpgradeHandler } from './handlers/wsUpgradeHandler.js';

const app = express();

app.use(morgan('combined'));

// Public health probe endpoint
app.get('/router/health', (req, res) => {
  res.status(200).send('My health is ok :)');
});

// Protected Sandbox Routing Middleware
app.use(sandboxAuthGuard);

const server = http.createServer(app);
server.setMaxListeners(100);

// Attach Protected WebSocket Upgrade Handler
attachWsUpgradeHandler(server);

export default server;
