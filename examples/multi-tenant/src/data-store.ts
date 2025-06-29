import { config } from "./config";
import type { Task, Tenant } from "./types";

// In-memory data store (in production, use a proper database)
const tenants = new Map<string, Tenant>();
const tenantTasks = new Map<string, Map<string, Task>>();

// Initialize sample tenants
export const initializeSampleData = (): void => {
  const sampleTenants: Tenant[] = Object.values(config.tenants).map((t) => ({
    ...t,
    createdAt: new Date(),
  }));

  sampleTenants.forEach((tenant) => {
    tenants.set(tenant.id, tenant);
    tenantTasks.set(tenant.id, new Map());
  });
};

// Tenant operations
export const getTenantById = (tenantId: string): Tenant | undefined => {
  return tenants.get(tenantId);
};

export const getTenantBySubdomain = (subdomain: string): Tenant | undefined => {
  return Array.from(tenants.values()).find(
    (tenant) => tenant.subdomain === subdomain,
  );
};

// Task operations
export const getTasksByTenant = (tenantId: string): Task[] => {
  const tasks = tenantTasks.get(tenantId);
  return tasks ? Array.from(tasks.values()) : [];
};

export const getTaskById = (
  tenantId: string,
  taskId: string,
): Task | undefined => {
  const tasks = tenantTasks.get(tenantId);
  return tasks?.get(taskId);
};

export const createTask = (tenantId: string, taskData: {
  title: string;
  description: string;
}): Task => {
  const task: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: taskData.title,
    description: taskData.description,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let tasks = tenantTasks.get(tenantId);
  if (!tasks) {
    tasks = new Map();
    tenantTasks.set(tenantId, tasks);
  }

  tasks.set(task.id, task);
  return task;
};

export const updateTask = (
  tenantId: string,
  taskId: string,
  updates: Partial<Pick<Task, "title" | "description" | "completed">>,
): Task | undefined => {
  const tasks = tenantTasks.get(tenantId);
  const task = tasks?.get(taskId);

  if (!task) {
    return undefined;
  }

  const updatedTask: Task = {
    ...task,
    ...updates,
    updatedAt: new Date(),
  };

  tasks!.set(taskId, updatedTask);
  return updatedTask;
};

export const deleteTask = (tenantId: string, taskId: string): boolean => {
  const tasks = tenantTasks.get(tenantId);
  return tasks?.delete(taskId) ?? false;
};
