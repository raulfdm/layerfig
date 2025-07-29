import type { TenantId } from "./config";
import type { AugmentedTenant, Task } from "./types";

const baseLayout = (
  title: string,
  content: string,
  tenant: AugmentedTenant<TenantId>,
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${tenant.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .tenant-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
        }

        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .task {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
            background: #fafafa;
        }

        .task.completed {
            opacity: 0.7;
            text-decoration: line-through;
        }

        .task-title {
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 5px;
        }

        .task-description {
            color: #666;
            margin-bottom: 10px;
        }

        .task-meta {
            font-size: 0.9em;
            color: #888;
            margin-bottom: 10px;
        }

        .task-actions {
            display: flex;
            gap: 10px;
        }

        .btn {
            display: inline-block;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }

        .btn:hover {
            background: #0056b3;
        }

        .btn-secondary {
            background: #6c757d;
        }

        .btn-secondary:hover {
            background: #545b62;
        }

        .btn-danger {
            background: #dc3545;
        }

        .btn-danger:hover {
            background: #c82333;
        }

        .btn-success {
            background: #28a745;
        }

        .btn-success:hover {
            background: #218838;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }

        .form-group textarea {
            height: 100px;
            resize: vertical;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .checkbox-group input[type="checkbox"] {
            width: auto;
        }

        .nav {
            margin-bottom: 20px;
        }

        .nav a {
            display: inline-block;
            padding: 10px 15px;
            background: white;
            color: #007bff;
            text-decoration: none;
            border-radius: 4px;
            margin-right: 10px;
            border: 1px solid #ddd;
        }

        .nav a:hover {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="tenant-info">
                <h1>📋 ${tenant.name} Task Manager</h1>
                <p>Tenant ID: ${tenant.id} | Subdomain: ${tenant.subdomain}</p>
            </div>
            <nav class="nav">
                <a href="/">📋 All Tasks</a>
                <a href="/new">➕ New Task</a>
            </nav>
        </div>
        ${content}
    </div>
</body>
</html>
`;

export const renderTaskList = (
  tasks: Task[],
  tenant: AugmentedTenant<TenantId>,
): string => {
  const content = `
    <div class="card">
        <h2>Tasks (${tasks.length})</h2>
        ${
    tasks.length === 0
      ? '<p>No tasks yet. <a href="/new">Create your first task!</a></p>'
      : tasks.map((task) => `
            <div class="task ${task.completed ? "completed" : ""}">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    Status: ${
        task.completed ? "✅ Completed" : "🔄 In Progress"
      } |
                    Created: ${task.createdAt.toLocaleDateString()}
                </div>
                <div class="task-actions">
                    <a href="/tasks/${task.id}" class="btn btn-secondary">View</a>
                    <a href="/tasks/${task.id}/edit" class="btn">Edit</a>
                    ${
        !task.completed
          ? `<a href="/tasks/${task.id}/complete" class="btn btn-success">Complete</a>`
          : `<a href="/tasks/${task.id}/uncomplete" class="btn btn-secondary">Uncomplete</a>`
      }
                    <a href="/tasks/${task.id}/delete" class="btn btn-danger"
                       onclick="return confirm('Are you sure you want to delete this task?')">Delete</a>
                </div>
            </div>
          `).join("")
  }
    </div>
  `;

  return baseLayout("Tasks", content, tenant);
};

export const renderTask = (
  task: Task,
  tenant: AugmentedTenant<TenantId>,
): string => {
  const content = `
    <div class="card">
        <div class="task ${task.completed ? "completed" : ""}">
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                Status: ${
    task.completed ? "✅ Completed" : "🔄 In Progress"
  }<br>
                Created: ${task.createdAt.toLocaleString()}<br>
                Updated: ${task.updatedAt.toLocaleString()}
            </div>
            <div class="task-actions">
                <a href="/" class="btn btn-secondary">← Back to Tasks</a>
                <a href="/tasks/${task.id}/edit" class="btn">Edit</a>
                ${
    !task.completed
      ? `<a href="/tasks/${task.id}/complete" class="btn btn-success">Complete</a>`
      : `<a href="/tasks/${task.id}/uncomplete" class="btn btn-secondary">Uncomplete</a>`
  }
                <a href="/tasks/${task.id}/delete" class="btn btn-danger"
                   onclick="return confirm('Are you sure you want to delete this task?')">Delete</a>
            </div>
        </div>
    </div>
  `;

  return baseLayout(`Task: ${task.title}`, content, tenant);
};

export const renderNewTask = (tenant: AugmentedTenant<TenantId>): string => {
  const content = `
    <div class="card">
        <h2>Create New Task</h2>
        <form method="POST" action="/tasks">
            <div class="form-group">
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>
            </div>
            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" name="description" required></textarea>
            </div>
            <div class="task-actions">
                <button type="submit" class="btn btn-success">Create Task</button>
                <a href="/" class="btn btn-secondary">Cancel</a>
            </div>
        </form>
    </div>
  `;

  return baseLayout("New Task", content, tenant);
};

export const renderEditTask = (
  task: Task,
  tenant: AugmentedTenant<TenantId>,
): string => {
  const content = `
    <div class="card">
        <h2>Edit Task</h2>
        <form method="POST" action="/tasks/${task.id}/update">
            <div class="form-group">
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" value="${task.title}" required>
            </div>
            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" name="description" required>${task.description}</textarea>
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="completed" name="completed" ${
    task.completed ? "checked" : ""
  }>
                    <label for="completed">Mark as completed</label>
                </div>
            </div>
            <div class="task-actions">
                <button type="submit" class="btn btn-success">Update Task</button>
                <a href="/tasks/${task.id}" class="btn btn-secondary">Cancel</a>
            </div>
        </form>
    </div>
  `;

  return baseLayout(`Edit: ${task.title}`, content, tenant);
};

export const renderError = (
  error: string,
  tenant?: AugmentedTenant<TenantId>,
): string => {
  const content = `
    <div class="card">
        <h2>❌ Error</h2>
        <p>${error}</p>
        <div class="task-actions">
            <a href="/" class="btn">← Go Back</a>
        </div>
    </div>
  `;

  const defaultTenant = {
    id: "unknown",
    name: "Unknown Tenant",
    subdomain: "unknown",
    createdAt: new Date(),
  } as never;

  return baseLayout("Error", content, tenant || defaultTenant);
};
