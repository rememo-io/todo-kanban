import * as vscode from "vscode";
import { registerHoverProvider } from "./hoverProvider";
import { registerCommands } from "./commands";
import { updateDecorations } from "./decorations";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "todo-tracker" is now active!');

  registerCommands(context);
  registerHoverProvider(context);

  vscode.workspace.onDidChangeTextDocument((event) => {
    updateDecorations();
  });

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateDecorations();
    }
  });

  if (vscode.window.activeTextEditor) {
    updateDecorations();
  }
}

export function deactivate() {}
