import * as vscode from "vscode";
import {
  ID_REGEX,
  TITLE_REGEX,
  DESCRIPTION_REGEX,
  FIX_REGEX,
  FIXME_REGEX,
  TODO_REGEX,
} from "./config";
import { taskExistsInRememo } from "./fetch";

export function extractTitle(commentText: string): string {
  const titleMatch = commentText.match(TITLE_REGEX);
  return titleMatch ? titleMatch[1].trim() : "";
}

export function extractDescription(commentText: string): string {
  const descriptionMatch = commentText.match(DESCRIPTION_REGEX);
  return descriptionMatch ? descriptionMatch[1].trim() : "";
}

export function extractID(commentText: string): string {
  const idMatch = commentText.match(ID_REGEX);
  return idMatch ? idMatch[1] || idMatch[2] || idMatch[3] : "";
}

export function parseCommentContent(commentText: string) {
  if (!commentText.trim()) {
    return { title: "", description: "", id: "" };
  }

  const id = extractID(commentText);
  let title = extractTitle(commentText);
  let description = extractDescription(commentText);

  if (!title) {
    const keywordMatch = commentText.match(
      /^(TODO|FIXME|FIX)(-\w+)?:\s*(.*?)(?=\s*description:|$)/
    );
    if (keywordMatch) {
      title = keywordMatch[3].trim();
    }
  }

  if (!title && description && !/<.*?>/.test(description)) {
    title = `description: ${description}`;
    description = "";
  } else if (!title) {
    title = commentText.split(":")[1]?.trim() || "";
  }

  return { id, title, description };
}

export function extractMatches(
  text: string,
  regex: RegExp
): { startPos: number; endPos: number; match: string }[] {
  let match;
  const matches = [];
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      startPos: match.index,
      endPos: match.index + match[0].length,
      match: match[0],
    });
  }
  return matches;
}

export function updateTodoCommentWithID(
  editor: vscode.TextEditor,
  taskId: string,
  line: number
) {
  const lineText = editor.document.lineAt(line).text;

  const match =
    lineText.match(TODO_REGEX) ||
    lineText.match(FIXME_REGEX) ||
    lineText.match(FIX_REGEX);

  if (match && !extractID(match[0])) {
    const newText = lineText.replace(
      match[0],
      `${match[0].replace(/^(TODO|FIXME|FIX):/, `$1-${taskId}:`)}`
    );
    const range = editor.document.lineAt(line).range;

    editor
      .edit((editBuilder) => {
        editBuilder.replace(range, newText);
      })
      .then((success) => {
        if (success) {
          console.log(`Successfully updated the comment with ID: ${taskId}`);
        } else {
          console.error(`Failed to update the comment with ID: ${taskId}`);
        }
      });
  } else {
    console.log(
      `Skipped updating as the comment already has an ID or no match found.`
    );
  }
}

/**
 * Removes the ID from the comment in the specified line.
 * Example: "TODO-123: Fix this issue" becomes "TODO: Fix this issue"
 * @param editor - The active text editor
 * @param line - The line number where the comment is located
 */
export function removeTaskIDFromComment(
  editor: vscode.TextEditor,
  line: number
): void {
  const lineText = editor.document.lineAt(line).text;

  const newLineText = lineText.replace(/-(\w+):/, ":");

  const range = editor.document.lineAt(line).range;
  editor.edit((editBuilder) => {
    editBuilder.replace(range, newLineText);
  });
}
