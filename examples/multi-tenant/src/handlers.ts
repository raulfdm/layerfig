import type { Request, Response } from 'express';
import type { CreateTaskRequest, UpdateTaskRequest } from './types';
import {
  getTasksByTenant,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from './data-store';

export const getTasks = (req: Request, res: Response): void => {
  const { tenantContext } = req;

  if (!tenantContext) {
    res.status(400).json({ error: 'Tenant context not found' });
    return;
  }

  const tasks = getTasksByTenant(tenantContext.tenantId);

  res.json({
    tenant: tenantContext.tenant.name,
    tasks,
    count: tasks.length,
  });
};

export const getTask = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;

  if (!tenantContext) {
    res.status(400).json({ error: 'Tenant context not found' });
    return;
  }

  if(!taskId){
    res.status(400).json({ error: 'Task ID not found' });
    return;
  }

  const task = getTaskById(tenantContext.tenantId, taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json({
    tenant: tenantContext.tenant.name,
    task,
  });
};

export const createTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const taskData: CreateTaskRequest = req.body;

  if (!tenantContext) {
    res.status(400).json({ error: 'Tenant context not found' });
    return;
  }

  if (!taskData.title || !taskData.description) {
    res.status(400).json({
      error: 'Missing required fields',
      required: ['title', 'description']
    });
    return;
  }

  const task = createTask(tenantContext.tenantId, taskData);

  res.status(201).json({
    tenant: tenantContext.tenant.name,
    task,
  });
};

export const updateTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;
  const updates: UpdateTaskRequest = req.body;

  if (!tenantContext) {
    res.status(400).json({ error: 'Tenant context not found' });
    return;
  }

  if(!taskId){
    res.status(400).json({ error: 'Task ID not found' });
    return;
  }

  const task = updateTask(tenantContext.tenantId, taskId, updates);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json({
    tenant: tenantContext.tenant.name,
    task,
  });
};

export const deleteTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;

  if (!tenantContext) {
    res.status(400).json({ error: 'Tenant context not found' });
    return;
  }

  if(!taskId){
    res.status(400).json({ error: 'Task ID not found' });
    return;
  }

  const deleted = deleteTask(tenantContext.tenantId, taskId);

  if (!deleted) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.status(204).send();
};

export const getTenantInfo = (req: Request, res: Response): void => {
  const { tenantContext } = req;

  if (!tenantContext) {
    res.status(400).json({ error: 'Tenant context not found' });
    return;
  }

  res.json({
    tenant: tenantContext.tenant,
    taskCount: getTasksByTenant(tenantContext.tenantId).length,
  });
};
