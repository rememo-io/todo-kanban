import * as vscode from "vscode";
import { generateVscodeLink } from "./utils";
import {
  extractID,
  removeTaskIDFromComment,
  updateTodoCommentWithID,
} from "./core";
import * as dotenv from "dotenv";
dotenv.config();

export const backendUrl = "https://rememo.io";
// const backendUrl = process.env.BACKEND_URL;

export async function getToken(): Promise<string | undefined> {
  const token = vscode.workspace
    .getConfiguration("todoTracker")
    .get<string>("apiToken");
  if (!token) {
    vscode.window.showWarningMessage(
      "API token is not set. Please add your API token in the settings."
    );
  }
  return token;
}

export async function taskExistsInRememo(
  commentText: string,
  line: number
): Promise<boolean> {
  const id = extractID(commentText);
  if (!id) {
    return false;
  }

  try {
    const token = await getToken();
    if (!token) {
      return false;
    }
    const link = generateVscodeLink(
      vscode.window.activeTextEditor?.document.uri.fsPath || "",
      line
    );
    const response = await fetch(`${backendUrl}/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "api-key": token,
      },
      body: JSON.stringify({ link }),
    });

    if (response.ok) {
      return true;
    } else {
      const errorMessage = await response.text();
      vscode.window.showErrorMessage(
        `Failed to update task. Status: ${response.status}, Message: ${errorMessage}`
      );
      return false;
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error updating task: ${error.message}`);
    console.error("Error updating task:", error);
    return false;
  }
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
  const response = await fetch(`${backendUrl}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
    body: JSON.stringify({
      data,
    }),
  });

  if (response.ok) {
    const responseData = (await response.json()) as any;
    const taskId = responseData.id;
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

  const taskId = extractID(lineText);

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

  const response = await fetch(`${backendUrl}/api/tasks`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
    body: JSON.stringify({ data, where: { id: taskId } }),
  });

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

  const taskId = extractID(lineText);

  const response = await fetch(`${backendUrl}/api/tasks`, {
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

  if (response.ok) {
    vscode.window.showInformationMessage("Task deleted on rememo.io");
    removeTaskIDFromComment(editor, task.line);
    return true;
  } else {
    const errorMessage = await response.text();
    vscode.window.showErrorMessage(
      `Failed to delete task. Status: ${response.status}, Message: ${errorMessage}`
    );
    return false;
  }
}
