import type { TenantConfig } from "./config";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant extends TenantConfig {
  createdAt: Date;
}

export interface TenantContext {
  tenantId: TenantConfig['id'];
  tenant: Tenant;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
