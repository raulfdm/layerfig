import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { tenantMiddleware, errorHandler } from './middleware';
import {
  getTasks,
  getTask,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  getTenantInfo,
} from './handlers';
import { initializeSampleData } from './data-store';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize sample data
initializeSampleData();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint (no tenant required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply tenant middleware to all routes except health check
app.use(tenantMiddleware);

// Routes
app.get('/api/tenant', getTenantInfo);
app.get('/api/tasks', getTasks);
app.post('/api/tasks', createTaskHandler);
app.get('/api/tasks/:taskId', getTask);
app.put('/api/tasks/:taskId', updateTaskHandler);
app.delete('/api/tasks/:taskId', deleteTaskHandler);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Multi-tenant server running on port ${PORT}`);
  console.log(`📋 Available tenants:`);
  console.log(`   - Tenant ID: tenant-1 (Acme Corp)`);
  console.log(`   - Tenant ID: tenant-2 (Beta Industries)`);
  console.log(`\n📡 API Usage:`);
  console.log(`   curl -H "X-Tenant-ID: tenant-1" http://localhost:${PORT}/api/tasks`);
});
