# NetLegacy™ Digital Life Map

A Tech Ease program. A senior-friendly interview that builds a map of someone's accounts, a printable packet for the person they trust, and a separate Password List they fill in by hand. Afterward, a **My Map** menu lets them change one thing (a login, a new streaming service) without starting over.

**The finished app is one file: `index.html`.** It has the code, the styling and the font built in. It runs by double-clicking it, and it loads nothing from the internet.

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The finished app. This is what gets published. |
| `src/life-map-builder.jsx` | The app's source code. The one file to edit. |
| `src/main.jsx`, `src/tailwind.input.css`, `tailwind.config.cjs` | Small supporting files for the build. |
| `build.mjs`, `package.json` | The build script that turns `src/` into `index.html`. |
| `.nojekyll` | Tells GitHub Pages to serve the file as-is. Optional. |
| `.gitignore` | Keeps saved `.netlegacy` files and build leftovers out of the repo. |

## 1. Put it on GitHub Pages

1. On github.com, choose **New repository**. Name it `netlegacy-digital-life-map`.
2. Choose **Public** (see "Before you go public" below), then create it.
3. Choose **uploading an existing file** and drag in the contents of this folder: `index.html`, `src`, `build.mjs`, `package.json`, `tailwind.config.cjs`, `README.md`, `.gitignore`, and `.nojekyll` if your computer shows hidden files. Do **not** upload `node_modules` or `.build`. Commit.
4. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, then **Save**.
5. After a minute or two the page shows your address:
   `https://YOUR-USERNAME.github.io/netlegacy-digital-life-map/`
6. Open it and click through. Try **Save & continue later**, then **Continue a saved map**, then **Print my packet**.

## 2. Put it on your website

Use the address from step 5 in place of `YOUR-ADDRESS`.

```html
<iframe src="YOUR-ADDRESS" title="NetLegacy Digital Life Map"
        style="width:100%;height:1100px;border:0" loading="lazy"></iframe>
```

- **WordPress (self-hosted):** add a **Custom HTML** block and paste the snippet.
- **WordPress.com:** Custom HTML and iframes need the **Business plan or higher**. On lower plans, link to the GitHub Pages address instead.
- **Google Sites:** choose **Insert → Embed → By URL**, paste the address, and make the box as large as it allows.

In a narrow box the app switches to its phone layout on its own.

**Check these inside your own site before announcing it:** Save & continue later (the file downloads), Continue a saved map (you can pick the file), and Print. I could test the page by itself but not inside WordPress or Google Sites. If any of those is blocked there, add a plain link ("Open the full-size version") to the GitHub Pages address, where they all work.

## 3. Changing the app later

1. Edit `src/life-map-builder.jsx`.
2. Install Node.js 18 or newer, then in this folder run:
   ```
   npm install
   npm run build
   ```
   (`npm install` is only needed the first time.)
3. This rewrites `index.html`. Commit and upload it. Pages updates within a minute or two.

## 4. Privacy, and how it's enforced

- The app stores nothing and has no server. Everything happens in the visitor's browser.
- It never asks for an account password. The Password List is filled in by hand on paper.
- The only thing it ever creates is the `.netlegacy` file the person chooses to download. That file is encrypted with a phrase they make up. The phrase isn't stored anywhere, so a lost phrase means a lost file.
- `index.html` carries a strict Content-Security-Policy that forbids any request to any server. I tested this: the finished page makes zero network requests, and a deliberate attempt to contact an outside server is blocked by the browser itself.
- The font is built in, so a visitor's address isn't sent to Google Fonts either.
- There is no analytics or tracking of any kind. If you add some later, that changes this promise and the policy would have to be loosened, so think twice.

## Before you go public

- **A free GitHub Pages site needs a public repository**, so anyone can read the source code, not just use the app. There's no personal data in it. Real maps only ever exist in people's own downloaded files, and `.gitignore` keeps those out of the repo. If you'd rather keep the code private, Pages from a private repo needs a paid GitHub plan.
- **No license file is included, on purpose.** With no license, the default is "all rights reserved." Choose one deliberately if you want to share the code.
- **Name and logo:** the mockup arch-and-keyhole logo isn't in the app yet. A simple stand-in mark is used in the page header and browser tab.
