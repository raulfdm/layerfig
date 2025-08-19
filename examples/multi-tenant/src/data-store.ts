import {
  availableTenants,
  getTenantConfig,
  type TenantConfigType,
  type TenantId,
} from "./config";
import type { AugmentedTenant, Task } from "./types";

// In-memory data store (in production, use a proper database)
const tenants = new Map<TenantId, AugmentedTenant<TenantId>>();
const tenantTasks = new Map<TenantId, Map<string, Task>>();

// Initialize sample tenants
export const initializeSampleData = (): void => {
  const sampleTenants = availableTenants.map((t) => ({
    ...getTenantConfig(t),
    createdAt: new Date(),
  }));

  sampleTenants.forEach((tenant) => {
    tenants.set(tenant.id, tenant);
    tenantTasks.set(tenant.id, new Map());
  });
};

// Tenant operations
export const getTenantById = (
  tenantId: TenantId,
): AugmentedTenant<TenantId> | undefined => {
  return tenants.get(tenantId);
};

export const getTenantBySubdomain = (
  subdomain: string,
): AugmentedTenant<TenantId> | undefined => {
  return Array.from(tenants.values()).find(
    (tenant) => tenant.subdomain === subdomain,
  );
};

// Task operations
export const getTasksByTenant = (tenantId: TenantId): Task[] => {
  const tasks = tenantTasks.get(tenantId);
  return tasks ? Array.from(tasks.values()) : [];
};

export const getTaskById = (
  tenantId: TenantId,
  taskId: string,
): Task | undefined => {
  const tasks = tenantTasks.get(tenantId);
  return tasks?.get(taskId);
};

export const createTask = (tenantId: TenantId, taskData: {
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
  tenantId: TenantId,
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

export const deleteTask = (tenantId: TenantId, taskId: string): boolean => {
  const tasks = tenantTasks.get(tenantId);
  return tasks?.delete(taskId) ?? false;
};
