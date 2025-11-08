---
description: Quick, focused guidance to help an AI coding agent be productive in this repository.
---

# Key context for code edits

- Project type: React app built with Vite (see `package.json` and `vite.config.js`). Dev server: `npm run dev` (Vite). Build: `npm run build`. Preview: `npm run preview`.
- PDF handling: uses `pdfjs-dist` (v3.x) and the worker shipped in `public/pdf.worker.min.js`. Worker path is set in `src/main.jsx` via `pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'` — do not change one without updating the other.
- State & storage conventions:
  - Last opened PDF is stored in sessionStorage under key `lastPdf` as base64 (see `src/utils/pdfUtils.js` and `src/App.jsx`).
  - Fake auth stores users in localStorage key `usersDB` and the logged-in email in `currentUserEmail` (see `src/context/AuthContext.jsx`). Tools are gated by `currentUser`.

# Architecture & important files

- `src/main.jsx` — app entry. Wraps routes in `AuthProvider` and sets up pdf.js worker.
- `src/App.jsx` — main composition: `TopToolbar`, `ViewerPane`, `ToolsPane`. PDF ArrayBuffer flows into `pdfjsLib.getDocument` then to `ViewerPane`/`PdfPage`.
- `src/api/gemini.js` — wrapper for Gemini API. Reads `VITE_GEMINI_API_KEY` from `import.meta.env`. Expects `.env.local` with `VITE_GEMINI_API_KEY` for dev. Handles JSON vs text mime types.
- `src/context/AuthContext.jsx` — simple client-only auth helpers: `signup`, `login`, `logout`. Implementation is intentionally insecure (localStorage plain-text). Treat as application behaviour to preserve unless replacing with real auth.
- `src/components/PdfPage.jsx` — renders page canvas and text layer using `pdfjsLib.renderTextLayer`. Keep compatibility with `pdfjs-dist` APIs.
- `src/utils/pdfUtils.js` — base64 <> ArrayBuffer helpers. `sessionStorage` and these helpers are used to persist the PDF between reloads.

# Project-specific patterns & conventions

- Props-driven handlers: major UI actions (load file, load sample, toggle tools, logout) are passed down from `App.jsx` to `TopToolbar` and `ToolsPane`. Example: `TopToolbar` calls `onFileChange` and shows `currentUser` and `onLogout` (see `src/components/TopToolbar.jsx`).
- Selection flow: text selection is captured globally (`window.getSelection()` in `App.jsx`) and passed to `ToolsPane` to operate on selected text (summarize, translate, quiz).
- Error/UX patterns: components commonly call `alert()` for user-visible errors and `console.error()` for diagnostics. Preserve this style when editing UI behaviour unless improving UX across the repo.

# Integration points and external dependencies

- Gemini (Generative Language) API: `src/api/gemini.js` posts to a Google endpoint and expects `VITE_GEMINI_API_KEY` in `.env.local`. If missing, the module throws — catch in callers when adding features.
- Firebase is declared in `package.json` but no Firebase wiring appears in these core files — search `src` when changing auth to ensure you don't break intended future use.
- `pdfjs-dist` version matters: code relies on v3 APIs (e.g., `renderTextLayer` signature used in `PdfPage.jsx`). When upgrading, verify text-layer rendering.

# How to run & debug (explicit)

- Start dev server (Windows PowerShell):
```powershell
npm install
npm run dev
```
- Open http://localhost:5173 (default Vite port). Use browser DevTools console for runtime errors.
- Common local debugging checks:
  - Confirm `public/pdf.worker.min.js` exists; `pdfjs` worker path is set in `src/main.jsx`.
  - If Gemini calls fail, ensure `.env.local` (root) contains `VITE_GEMINI_API_KEY=your_key` and restart dev server.
  - To reproduce PDF issues, use the app's Sample button (calls a Mozilla sample PDF) — traces appear in console.

# Safe edit rules for an AI agent (do not change silently)

- Do not change the pdf worker path in `src/main.jsx` without updating the file in `public/`.
- Preserve the sessionStorage key `lastPdf` and the base64 helpers in `src/utils/pdfUtils.js` unless you update both storage and consumers.
- Any change to auth behaviour should note that current code is insecure (plain-text passwords in localStorage) — if replacing, search & update usages of `currentUser`, `usersDB`, and `currentUserEmail` (AuthProvider shape: `{currentUser, signup, login, logout}`).
- When calling Gemini, keep existing response parsing logic: the wrapper may return parsed JSON (if `responseMimeType === 'application/json'`) or trimmed text. Update callers accordingly.

# Example locations to reference in edits

- `src/App.jsx`, `src/main.jsx`, `src/api/gemini.js`, `src/context/AuthContext.jsx`, `src/components/PdfPage.jsx`, `src/components/TopToolbar.jsx`, `src/utils/pdfUtils.js`, `public/pdf.worker.min.js`, `package.json`.

If anything in these notes is unclear or you want more detail on a specific area (auth, Gemini flows, pdf rendering), tell me which area and I'll expand or adjust the instructions.
