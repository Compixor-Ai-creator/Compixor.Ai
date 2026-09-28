# Workspace Guidelines & Autonomous Pairing Rules

## 1. Claude Code Autonomous Pairing (`claude-free`)
- For non-trivial coding tasks, complex features, algorithmic changes (e.g. PDF/DOCX engines), refactoring, or architecture decisions, the agent MUST automatically consult Claude Code.
- Claude Code is configured locally to run free with Gemini 3.8 Flash via LiteLLM proxy.
- **CLI Command:** `claude-free -p "<prompt>"`
- Before finalizing critical logic or when seeking a second perspective, run `claude-free -p "..."` via terminal to gather insights, review diffs, or verify edge cases.

## 2. Project Architecture & Philosophy
- **Compixor Web App (`d:/vs code/compixor`):**
  - **100% Client-Side Processing:** All conversion, compression, and file processing tools MUST run in the browser using WebAssembly, web workers, and client-side JS libraries (zero server hosting costs).
  - **Design System:** Clean, professional modern UI inspired by SlideSpeak and Microsoft Fluent Design, with authentic 3D icons, drag-and-drop support, and smooth user feedback.
