import * as vscode from "vscode";
import { generateVscodeLink } from "./utils";
import {
  extractID,
  removeTaskIDFromComment,
  updateTodoCommentWithID,
} from "./core";
import * as dotenv from "dotenv";
dotenv.config();

// export const backendUrl = "http://localhost:5555";
export const backendUrl = "https://api.rememo.io";

// const backendUrl = process.env.BACKEND_URL;
export async function getToken(): Promise<string | undefined> {
  const token = vscode.workspace
    .getConfiguration("todoKanban")
    .get<string>("apiToken");
  if (!token) {
    vscode.window.showWarningMessage(
      "API token is not set. Please add your API token in the settings."
    );
  }
  console.log("Retrieved token:", token);
  return token;
}

export async function createRememoTask(task: {
  id: string;
  title: string;
  description?: string;
  link: string;
  line: number;
}) {
  const token = await getToken();
  if (!token) {
    return false;
  }
  const data = {
    ...(task.title && { title: task.title }),
    ...(task.link && { link: task.link }),
    ...(task.description && {
      rendered_description: `<p>${task.description}</p>`,
    }),
  };

  const url = `${backendUrl}/api/tasks`;
  console.log("Creating task with URL:", url);
  console.log("API Key:", token);
  console.log("Creating task with data:", data);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
    body: JSON.stringify({
      data,
    }),
  });

  console.log("Response status:", response.status);
  console.log("Response headers:", response.headers);

  if (response.ok) {
    const responseData = (await response.json()) as any;
    const taskId = responseData.id;
    console.log("Task created with ID:", taskId);
    vscode.window.showInformationMessage(
      `Task created on rememo.io with ID: ${taskId}`
    );

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      updateTodoCommentWithID(editor, taskId, task.line);
    }
  } else {
    const errorMessage = await response.text();
    vscode.window.showErrorMessage(
      `Failed to create task. Status: ${response.status}, Message: ${errorMessage}`
    );
    console.error("Failed to create task:", errorMessage);
  }
}

export async function editRememoTask(task: {
  line: number;
  title: string;
  description?: string;
  link: string;
}): Promise<boolean> {
  const token = await getToken();
  if (!token) {
    return false;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active text editor found.");
    return false;
  }

  const lineText = editor.document.lineAt(task.line).text;
  console.log("Editing task with line text:", lineText);

  const taskId = extractID(lineText);
  console.log("Extracted task ID:", taskId);

  if (!taskId) {
    vscode.window.showErrorMessage("No task ID found in the selected line.");
    return false;
  }

  const data = {
    ...(task.title && { title: task.title }),
    ...(task.link && { link: task.link }),
    ...(task.description && {
      rendered_description: `<p>${task.description}</p>`,
    }),
  };

  const url = `${backendUrl}/api/tasks`;
  console.log("Updating task with URL:", url);
  console.log("API Key:", token);
  console.log("Updating task with data:", data);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
    body: JSON.stringify({ data, where: { id: taskId } }),
  });

  console.log("Response status:", response.status);
  console.log("Response headers:", response.headers);

  if (response.ok) {
    vscode.window.showInformationMessage(
      `Task with ID: ${taskId} updated on rememo.io`
    );

    return true;
  } else {
    const errorMessage = await response.text();
    vscode.window.showErrorMessage(
      `Failed to update task. Status: ${response.status}, Message: ${errorMessage}`
    );
    console.error("Failed to update task:", errorMessage);
    return false;
  }
}

export async function deleteRememoTask(task: {
  id: string;
  title: string;
  link: string;
  line: number;
}): Promise<boolean> {
  const token = await getToken();
  if (!token) {
    return false;
  }
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active text editor found.");
    return false;
  }

  const lineText = editor.document.lineAt(task.line).text;
  console.log("Deleting task with line text:", lineText);

  const taskId = extractID(lineText);
  console.log("Extracted task ID:", taskId);

  const url = `${backendUrl}/api/tasks`;
  console.log("Deleting task with URL:", url);
  console.log("API Key:", token);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
    body: JSON.stringify({
      where: {
        id: taskId,
      },
    }),
  });

  console.log("Response status:", response.status);
  console.log("Response headers:", response.headers);

  if (response.ok) {
    vscode.window.showInformationMessage("Task deleted on rememo.io");
    removeTaskIDFromComment(editor, task.line);
    return true;
  } else {
    const errorMessage = await response.text();
    vscode.window.showErrorMessage(
      `Failed to delete task. Status: ${response.status}, Message: ${errorMessage}`
    );
    console.error("Failed to delete task:", errorMessage);
    return false;
  }
}
