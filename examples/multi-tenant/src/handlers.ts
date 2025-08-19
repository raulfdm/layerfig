import type { Request, Response } from "express";
import type { CreateTaskRequest, UpdateTaskRequest } from "./types";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByTenant,
  updateTask,
} from "./data-store";
import {
  renderEditTask,
  renderError,
  renderNewTask,
  renderTask,
  renderTaskList,
} from "./templates";

export const getHomePage = (req: Request, res: Response): void => {
  const { tenantContext } = req;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  const tasks = getTasksByTenant(tenantContext.tenantId);
  res.send(renderTaskList(tasks, tenantContext.tenant));
};

export const getTaskPage = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  if (!taskId) {
    res.status(400).send(renderError("Task ID is required"));
    return;
  }

  const task = getTaskById(tenantContext.tenantId, taskId);

  if (!task) {
    res.status(404).send(renderError("Task not found", tenantContext.tenant));
    return;
  }

  res.send(renderTask(task, tenantContext.tenant));
};

export const getNewTaskPage = (req: Request, res: Response): void => {
  const { tenantContext } = req;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  res.send(renderNewTask(tenantContext.tenant));
};

export const createTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { title, description }: CreateTaskRequest = req.body;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  if (!title || !description) {
    res.status(400).send(
      renderError("Title and description are required", tenantContext.tenant),
    );
    return;
  }

  createTask(tenantContext.tenantId, { title, description });
  res.redirect("/");
};

export const getEditTaskPage = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  if (!taskId) {
    res.status(400).send(renderError("Task ID is required"));
    return;
  }

  const task = getTaskById(tenantContext.tenantId, taskId);

  if (!task) {
    res.status(404).send(renderError("Task not found", tenantContext.tenant));
    return;
  }

  res.send(renderEditTask(task, tenantContext.tenant));
};

export const updateTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;
  const { title, description, completed }: UpdateTaskRequest & {
    completed?: string;
  } = req.body;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  if (!taskId) {
    res.status(400).send(renderError("Task ID is required"));
    return;
  }

  const updates: UpdateTaskRequest = {
    title,
    description,
    completed: completed === "on", // HTML checkboxes send 'on' when checked
  };

  const task = updateTask(tenantContext.tenantId, taskId, updates);

  if (!task) {
    res.status(404).send(renderError("Task not found", tenantContext.tenant));
    return;
  }

  res.redirect(`/tasks/${taskId}`);
};

export const completeTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  if (!taskId) {
    res.status(400).send(renderError("Task ID is required"));
    return;
  }

  updateTask(tenantContext.tenantId, taskId, { completed: true });
  res.redirect("/");
};

export const uncompleteTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  if (!taskId) {
    res.status(400).send(renderError("Task ID is required"));
    return;
  }

  updateTask(tenantContext.tenantId, taskId, { completed: false });
  res.redirect("/");
};

export const deleteTaskHandler = (req: Request, res: Response): void => {
  const { tenantContext } = req;
  const { taskId } = req.params;

  if (!tenantContext) {
    res.status(400).send(renderError("Tenant context not found"));
    return;
  }

  if (!taskId) {
    res.status(400).send(renderError("Task ID is required"));
    return;
  }

  const deleted = deleteTask(tenantContext.tenantId, taskId);

  if (!deleted) {
    res.status(404).send(renderError("Task not found", tenantContext.tenant));
    return;
  }

  res.redirect("/");
};
