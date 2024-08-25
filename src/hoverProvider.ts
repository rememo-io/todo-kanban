import * as vscode from "vscode";
import { TODO_REGEX, FIXME_REGEX, FIX_REGEX } from "./config";
import { parseCommentContent } from "./core";
import { generateVscodeLink } from "./utils";

export function registerHoverProvider(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerHoverProvider("*", {
    async provideHover(document, position, token) {
      const range =
        document.getWordRangeAtPosition(position, TODO_REGEX) ||
        document.getWordRangeAtPosition(position, FIXME_REGEX) ||
        document.getWordRangeAtPosition(position, FIX_REGEX);

      if (range) {
        const startLine = range.start.line;
        const fullRange = new vscode.Range(
          range.start,
          new vscode.Position(
            startLine,
            document.lineAt(startLine).range.end.character
          )
        );
        const commentText = document.getText(fullRange);
        const { title, description, id } = parseCommentContent(commentText);
        const filePath =
          vscode.window.activeTextEditor?.document.uri.fsPath || "";
        const link = generateVscodeLink(filePath, startLine);

        let hoverContent;

        if (id) {
          hoverContent = createHoverContentForCreatedTask(
            title,
            description,
            filePath,
            startLine,
            id
          );
        } else {
          hoverContent = createHoverContentForNewTask(
            title,
            description,
            filePath,
            startLine
          );
        }

        return new vscode.Hover(hoverContent, range);
      }
      return null;
    },
  });

  context.subscriptions.push(provider);
}

function createHoverContentForCreatedTask(
  title: string,
  description: string,
  filePath: string,
  line: number,
  id: string
) {
  const editCommandUri = makeMarkdownCommand("editRememoTask", {
    id,
    title,
    description,
    link: generateVscodeLink(filePath, line),
    line,
  });
  const deleteCommandUri = makeMarkdownCommand("deleteRememoTask", {
    id,
    line,
  });

  let markdownContent = `
  Title: ${title}
          `;

  if (description) {
    markdownContent += `
  Description: ${description}
            `;
  }

  markdownContent += `
  $(pencil) [Edit Task](${editCommandUri})
  $(trash) [Delete Task](${deleteCommandUri})
          `;

  const markdownText = new vscode.MarkdownString(markdownContent, true);
  markdownText.supportThemeIcons = true;
  markdownText.isTrusted = true;
  return markdownText;
}

function createHoverContentForNewTask(
  title: string,
  description: string,
  filePath: string,
  line: number
) {
  const createCommandUri = makeMarkdownCommand("createRememoTask", {
    title,
    description,
    link: generateVscodeLink(filePath, line),
    line,
  });

  let markdownContent = `
  Title: ${title}
          `;

  if (description) {
    markdownContent += `
  Description: ${description}
            `;
  }

  markdownContent += `
  $(plus) [Create Task](${createCommandUri})
          `;

  const markdownText = new vscode.MarkdownString(markdownContent, true);
  markdownText.supportThemeIcons = true;
  markdownText.isTrusted = true;
  return markdownText;
}

export function makeMarkdownCommand(command: string, args: any): string {
  return `command:${command}?${encodeURIComponent(JSON.stringify(args))}`;
}
