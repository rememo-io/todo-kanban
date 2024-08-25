import * as vscode from "vscode";
import { createRememoTask, editRememoTask, deleteRememoTask } from "./fetch";

import * as dotenv from "dotenv";
dotenv.config();
export function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("createRememoTask", async (args) => {
      vscode.window.showInformationMessage(
        `Creating task on ${process.env.BACKEND_URL}`,
        JSON.stringify(args)
      );
      await createRememoTask(args);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("editRememoTask", async (args) => {
      vscode.window.showInformationMessage(
        `Editing task on ${process.env.BACKEND_URL}`,
        JSON.stringify(args)
      );
      await editRememoTask(args);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("deleteRememoTask", async (args) => {
      vscode.window.showInformationMessage(
        `Deleting task on ${process.env.BACKEND_URL}`,
        JSON.stringify(args)
      );
      await deleteRememoTask(args);
    })
  );
}
