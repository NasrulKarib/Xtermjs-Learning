# Xterm.js Learning – Web CLI

A minimal web terminal built with xterm.js showcasing keyboard handling, search highlighting, clipboard copy, command history, and dynamic themes.

## Overview
- Built with `@xterm/xterm` and Vite
- Focuses on simple functional code (no classes)
- Clean keyboard shortcuts and command-driven UX

## Quick Start
```bash
# install deps
npm install

# start dev server
npm run dev
```

On Windows without Bash, you can also run:
```bat
npm run dev
```

## Implemented Addons
- `@xterm/addon-fit`: Resize terminal to container
- `@xterm/addon-search`: Find/navigate matches; highlight with decorations
- `@xterm/addon-web-links`: Auto-detect and open URLs
- `@xterm/addon-clipboard`: Clipboard integration (copy selection/current input)

## Implemented APIs (xterm.js)
- `Terminal` options: `cursorBlink`, `theme`, `fontSize`, `cursorStyle`
- Proposed API: `allowProposedApi: true` to enable `term.getSelection()`
- Events: `term.attachCustomKeyEventHandler`, `term.onData`
- Methods: `term.write`, `term.clear`, `term.open`, `term.focus`, `term.loadAddon`

## Commands
- `clear`: Clears screen (also clears search highlights) and shows welcome
- `quit`: Disposes terminal
- `theme`: Cycles between themes (Dark, Light, Hacker, Solarized Dark)
- `fontsize`: Cycles font size
- `cursor`: Cycles cursor style (block, underline, bar)
- `history`: Lists typed command history
- `help`: Shows help text and shortcuts

## Keyboard Shortcuts
- `Ctrl+Q`: Force quit
- `Ctrl+F`: Prompt search term + highlight matches
- `Ctrl+C`: Copy selected text or current input to clipboard
- `F1`: Show shortcuts overlay
- `ArrowUp/ArrowDown`: Navigate command history
- `Esc`: Cancel current input

## Search + Highlight
- Uses `SearchAddon.findNext()`/`findPrevious()` with `decorations` to highlight matches
- `clear` and `clearsearch` remove all search decorations

## Theming
Themes are switched via the `theme` command and include:
- Dark (default)
- Light
- Hacker (green on black)
- Solarized Dark (full ANSI palette)

Each theme sets foreground/background, cursor, and selection colors for readability.

## Notes (Windows)
- If PowerShell blocks npm scripts, run PowerShell as Admin and execute:
```powershell
Set-ExecutionPolicy RemoteSigned
```
- Alternatively, use Git Bash to run bash scripts like `start.sh`.

## Tech Stack
- xterm.js, Vite, Vanilla JS
- Addons: fit, search, web-links, clipboard

## License
MIT