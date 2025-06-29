import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { tenantMiddleware, errorHandler } from './middleware.js';
import {
  getHomePage,
  getTaskPage,
  getNewTaskPage,
  createTaskHandler,
  getEditTaskPage,
  updateTaskHandler,
  completeTaskHandler,
  uncompleteTaskHandler,
  deleteTaskHandler,
} from './handlers.js';
import { initializeSampleData } from './data-store.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize sample data
initializeSampleData();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles for simplicity
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form submissions

// Health check endpoint (no tenant required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root redirect for main domain
app.get('/', (req, res, next) => {
  const host = req.headers.host;
  if (host === `localhost:${PORT}` || host === '127.0.0.1:3000') {
    res.send(`
      <h1>🏢 Multi-Tenant Task Manager</h1>
      <p>Welcome! Please select a tenant:</p>
      <ul style="list-style: none; padding: 20px;">
        <li style="margin: 10px 0;"><a href="http://acme.localhost:${PORT}" style="display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">🏢 Acme Corp</a></li>
        <li style="margin: 10px 0;"><a href="http://beta.localhost:${PORT}" style="display: inline-block; padding: 10px 15px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">🏭 Beta Industries</a></li>
      </ul>
      <hr style="margin: 30px 0;">
      <h3>🛠️ Setup for Local Development:</h3>
      <p>Add these lines to your <code>/etc/hosts</code> file (or <code>C:\\Windows\\System32\\drivers\\etc\\hosts</code> on Windows):</p>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px;">127.0.0.1 acme.localhost
127.0.0.1 beta.localhost</pre>
      <p><small>Then restart your browser and visit the links above.</small></p>
    `);
    return;
  }
  next();
});

// Apply tenant middleware to all routes except health check and root
app.use(tenantMiddleware);

// HTML Routes
app.get('/', getHomePage);
app.get('/new', getNewTaskPage);
app.post('/tasks', createTaskHandler);
app.get('/tasks/:taskId', getTaskPage);
app.get('/tasks/:taskId/edit', getEditTaskPage);
app.post('/tasks/:taskId/update', updateTaskHandler);
app.get('/tasks/:taskId/complete', completeTaskHandler);
app.get('/tasks/:taskId/uncomplete', uncompleteTaskHandler);
app.get('/tasks/:taskId/delete', deleteTaskHandler);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).send(`
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Go Home</a>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Multi-tenant HTML app running on port ${PORT}`);
  console.log(`\n🌍 Access your tenants at:`);
  console.log(`   📋 Acme Corp: http://acme.localhost:${PORT}`);
  console.log(`   📋 Beta Industries: http://beta.localhost:${PORT}`);
  console.log(`\n⚙️  Setup Instructions:`);
  console.log(`   1. Add to /etc/hosts (or Windows hosts file):`);
  console.log(`      127.0.0.1 acme.localhost`);
  console.log(`      127.0.0.1 beta.localhost`);
  console.log(`   2. Restart your browser`);
  console.log(`   3. Visit the URLs above`);
  console.log(`\n   Or visit http://localhost:${PORT} for setup instructions`);
});
