import * as vscode from "vscode";
import { extractID, extractMatches } from "./core";
import { TODO_REGEX, FIXME_REGEX, FIX_REGEX } from "./config";
import { taskExistsInRememo } from "./fetch";

const decorationStyles = {
  notCreated: {
    "TODO:": {
      color: "#555",
      backgroundColor: "#ffbd2a",
      borderRadius: "4px",
      overviewRulerColor: "rgba(255,189,42,0.8)",
    },
    "FIXME:": {
      color: "#555",
      backgroundColor: "#f06292",
      borderRadius: "4px",
      overviewRulerColor: "rgba(240,98,146,0.8)",
    },
    "FIX:": {
      color: "#555",
      backgroundColor: "#f06292",
      borderRadius: "4px",
      overviewRulerColor: "rgba(240,98,146,0.8)",
    },
  },
  created: {
    keyword: {
      dark: {
        color: "#555",
        backgroundColor: "#17CA97",
      },
      light: {
        color: "#555",
        backgroundColor: "#17CA97",
      },
    },
    highlight: {
      dark: {
        color: "#555",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
      light: {
        color: "#555",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      },
    },
  },
};

const decorationTypes: Record<string, vscode.TextEditorDecorationType> = {};

Object.keys(decorationStyles.notCreated).forEach((key) => {
  decorationTypes[key] = vscode.window.createTextEditorDecorationType(
    // @ts-ignore
    decorationStyles.notCreated[key]
  );
});

const createdKeywordDecorationType =
  vscode.window.createTextEditorDecorationType({
    light: decorationStyles.created.keyword.light,
    dark: decorationStyles.created.keyword.dark,
  });

const createdHighlightDecorationType =
  vscode.window.createTextEditorDecorationType({
    light: decorationStyles.created.highlight.light,
    dark: decorationStyles.created.highlight.dark,
  });

export async function updateDecorations() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const text = editor.document.getText();
    const regex = new RegExp(
      `${TODO_REGEX.source}|${FIXME_REGEX.source}|${FIX_REGEX.source}`,
      "g"
    );

    const matches = extractMatches(text, regex);

    const { created, default: defaultDecorations } = await getTaskDecorations(
      matches,
      text,
      editor
    );

    Object.keys(defaultDecorations).forEach((key) => {
      editor.setDecorations(decorationTypes[key], defaultDecorations[key]);
    });

    editor.setDecorations(createdKeywordDecorationType, created.keywords);

    editor.setDecorations(createdHighlightDecorationType, created.highlights);
  }
}

export async function getTaskDecorations(
  matches: { startPos: number; endPos: number; match: string }[],
  text: string,
  editor: vscode.TextEditor
): Promise<{
  created: {
    keywords: vscode.DecorationOptions[];
    highlights: vscode.DecorationOptions[];
  };
  default: { [key: string]: vscode.DecorationOptions[] };
}> {
  const defaultDecorations: { [key: string]: vscode.DecorationOptions[] } = {
    "TODO:": [],
    "FIXME:": [],
    "FIX:": [],
  };
  const createdKeywords: vscode.DecorationOptions[] = [];
  const createdHighlights: vscode.DecorationOptions[] = [];

  for (const { startPos, endPos, match } of matches) {
    const restOfLine = text.substring(endPos).split("\n")[0].trim();
    const titleMatch = restOfLine.split("description:")[0].trim();
    const title = titleMatch.trim();
    const line = editor.document.positionAt(startPos).line;
    const id = extractID(match);

    if (id) {
      createdKeywords.push({
        range: new vscode.Range(
          editor.document.positionAt(startPos),
          editor.document.positionAt(endPos)
        ),
      });

      const textRange = new vscode.Range(
        editor.document.positionAt(endPos + 1),
        editor.document.positionAt(endPos + restOfLine.length + 1)
      );
      createdHighlights.push({
        range: textRange,
      });

      taskExistsInRememo(title, line);
    } else {
      defaultDecorations[match].push({
        range: new vscode.Range(
          editor.document.positionAt(startPos),
          editor.document.positionAt(endPos)
        ),
      });
    }
  }

  return {
    created: { keywords: createdKeywords, highlights: createdHighlights },
    default: defaultDecorations,
  };
}
