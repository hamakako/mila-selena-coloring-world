# Mila & Selena Coloring World

A small browser coloring game for Mila and Selena. It uses only HTML, CSS, and JavaScript. There is no backend, no login, no ads, no paid API, and no external face or image service.

## How to Run Locally

1. Open Terminal in this project folder.
2. Run:

```bash
python3 -m http.server 4173
```

3. Open this address in your browser:

```text
http://localhost:4173
```

Stop the local server by pressing `Control + C` in Terminal.

## How to Replace Mila and Selena Photos

The player photos are here:

```text
assets/characters/mila/profile.jpg
assets/characters/selena/profile.jpg
```

To replace a photo:

1. Make a small `.jpg` image.
2. Name it `profile.jpg`.
3. Put it in the correct folder.
4. Refresh the game.

Privacy note: these photos are local project files. If you publish this project online, any photo inside the project can become publicly visible. Remove or replace private photos before publishing if you do not want them online.

## How to Add New Coloring Pages

Coloring pages are SVG files in:

```text
assets/coloring-pages/
```

Each colorable part should use this class:

```svg
class="color-area"
```

Then add the page to `src/levels.js` with an `id`, `category`, `title`, and `asset` path.

## How to Edit Sound Messages

Sound captions and reactions are in:

```text
src/game.js
src/voice.js
```

Look for the `speak(...)` captions in `src/game.js`. The audible reactions are music-only Web Audio notes in `src/voice.js`. There is no computer speech or bundled voice file now, so the app uses soft tap, save, try-again, and win melodies instead of a robot voice. Sounds start only after the player taps Start.

## How to Deploy Online

This is a static website, so it can be hosted for free on Render, Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

Render option for a stable `onrender.com` link:

1. Put this project in a GitHub, GitLab, or Bitbucket repository.
2. Sign in to Render.
3. Create a new Static Site or Blueprint from that repository.
4. Use the included `render.yaml` file. It publishes the project root as a static site.

After Render deploys it, Render gives the game a stable `onrender.com` URL.

Simple Netlify option:

1. Go to `https://app.netlify.com/drop`.
2. Sign in or create a free account.
3. Drag this whole project folder onto the page.
4. Netlify will give you a free website link.

Simple Vercel option:

1. Go to `https://vercel.com/new`.
2. Sign in or create a free account.
3. Upload or import this project.
4. Keep the default settings because there is no build command.
5. Click Deploy.

## Permanent Live Website Link

Use GitHub Pages or Render for the final link. This package includes both:

- `.github/workflows/pages.yml` for GitHub Pages
- `render.yaml` for Render

Cloudflare quick tunnel links are not permanent, so do not use them as the final family link.

Remember: publishing with the current `profile.jpg` files makes those photos public inside the hosted game files.

## What Is Included

- 50 original SVG coloring pages
- Mila and Selena player selection
- Fill bucket, brush, eraser, undo, redo, clear
- Icon-based coloring tools for younger kids
- Colored target picture on every level with 1, 2, or 3 star scoring
- Save artwork to browser storage
- Gallery with open, download PNG, and delete
- Level locking, completion stars, and progress
- Sound On / Off button with subtitles
- Kid-friendly musical reactions with no robot voice
- Mobile, tablet, and desktop responsive layout
