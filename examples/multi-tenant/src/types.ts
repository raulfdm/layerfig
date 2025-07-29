import type { TenantConfigType, TenantId } from "./config";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AugmentedTenant<T extends TenantId> = TenantConfigType<T> & {
  createdAt: Date;
};

export interface TenantContext<T extends TenantId> {
  tenantId: TenantId;
  tenant: AugmentedTenant<T>;
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
