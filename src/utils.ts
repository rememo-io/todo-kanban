export function generateVscodeLink(filePath: string, line: number): string {
  const normalizedFilePath = filePath.replace(/^\/+|\\+/g, "/");
  return `vscode://file/${normalizedFilePath}:${line + 1}`;
}
