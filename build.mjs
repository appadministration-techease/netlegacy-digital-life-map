// Builds ONE self-contained file: index.html
//   - the app (React, bundled)       - its styling (Tailwind, compiled)
//   - the Atkinson Hyperlegible font - a strict Content-Security-Policy
// Nothing is loaded from the internet, and the policy forbids any network request.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
mkdirSync(".build", { recursive: true });

// 1. Compile the Tailwind classes the app actually uses
execFileSync(process.execPath, [
  require.resolve("tailwindcss/lib/cli.js"),
  "-i", "src/tailwind.input.css", "-o", ".build/tailwind.css", "--minify",
], { stdio: "inherit" });
const tailwind = readFileSync(".build/tailwind.css", "utf8");

// 2. Bundle the app
const out = await build({
  entryPoints: ["src/main.jsx"],
  bundle: true, minify: true, write: false, format: "iife",
  jsx: "automatic", loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
});
let js = out.outputFiles[0].text;

// The app asks Google Fonts for its font when run inside Claude. Here the font is
// built in instead, so remove that request (it would also expose a visitor's address).
const before = js.length;
js = js.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);?/g, "");
if (js.length === before) throw new Error("Expected to strip the Google Fonts @import, but did not find it.");
if (js.includes("googleapis")) throw new Error("A reference to googleapis is still in the bundle.");
js = js.replace(/<\/script/gi, "<\\/script"); // safe to inline in a <script> tag

// 3. Embed the font (regular + bold)
const fontFile = (w) => readFileSync(`node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-${w}-normal.woff2`).toString("base64");
const fontCss = [400, 700].map((w) =>
  `@font-face{font-family:'Atkinson Hyperlegible';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${fontFile(w)}) format('woff2');}`
).join("");

// 4. Lock it down: the page may run its own script and nothing else, and may not talk to any server
const hash = createHash("sha256").update(js).digest("base64");
const csp = [
  "default-src 'none'",
  `script-src 'sha256-${hash}'`,
  "style-src 'unsafe-inline'",
  "font-src data:",
  "img-src data: blob:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

const favicon = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1E2A5A"/>' +
  '<path d="M14 54V30a18 18 0 0 1 36 0v24" fill="none" stroke="#7CB894" stroke-width="5" stroke-linecap="round"/>' +
  '<circle cx="32" cy="38" r="5" fill="#fff"/><path d="M29 41h6l1.5 11h-9z" fill="#fff"/></svg>');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="description" content="NetLegacy Digital Life Map, a Tech Ease program. Make a map of your accounts so the person you trust is never left searching in the dark. Nothing leaves your device.">
<title>NetLegacy Digital Life Map — a Tech Ease program</title>
<link rel="icon" href="${favicon}">
<style>${fontCss}${tailwind}</style>
</head>
<body style="margin:0">
<div id="root"></div>
<noscript><p style="font-family:sans-serif;font-size:20px;padding:24px">NetLegacy Digital Life Map needs JavaScript turned on to run. Nothing is sent anywhere.</p></noscript>
<script>${js}</script>
</body>
</html>
`;
writeFileSync("index.html", html);
console.log(`Built index.html (${(html.length / 1024).toFixed(0)} KB)`);
