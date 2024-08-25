# Todo-Kanban: Code Comments and Task Management

Todo-Kanban is a VS Code extension that transforms your code annotations into actionable tasks on Rememo.io. It's designed to prevent important development notes from falling through the cracks.

<img src="https://raw.githubusercontent.com/rememo-io/todo-kanban/master/static/hero.webp">

## The Problem:
Developers often scatter TODOs, FIXMEs, and other notes throughout their codebase, intending to address them later. As projects expand, these comments can become overwhelming, forgotten, or ignored - potentially leading to missed deadlines or lingering issues.

## The Solution:
Todo-Kanban connects your code annotations directly to your Rememo.io Kanban board. This integration ensures that every TODO or FIXME becomes a trackable task, allowing for more effective work management and prioritization.

### Core Functionality:
- Create kanban tasks from code annotations
- Edit or remove tasks without leaving VS Code
- Sync in-code notes with your Kanban board
- Manage tasks while staying in your coding environment

## Setup:

Get the extension from VS Code Marketplace
Add your Rememo.io API token in VS Code settings under 'Todo-Kanban Settings'. To get token - open List settings and hit "Generate key" button.

## Usage:
### Create Task:

- Select a code comment with keyword `TODO:`, `FIX:` or `FIXME:`
- Use the 'Create Task' command in hover panel
- The annotation will be updated with assigned task ID

### Edit Task:

- Edit text that follow TODO keyword and hover it
- Hit 'Edit Task'

### Delete Task:

- Hover the TODO keyword
- Hit 'Delete Task'

## Configuration:
Todo-Kanban needs a Rememo.io API token. Set it in VS Code:

```json
{
  "todoKanban.apiToken": "your-api-token-here"
}
```

## Contributing:
Found a bug or have an idea? Open an issue or submit a pull request on GitHub.

## Licensing:
This project uses the MIT License. Check the LICENSE file for details.