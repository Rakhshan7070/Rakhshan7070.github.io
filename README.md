# Rakhshan Ali — Neo Glass Portfolio

Static, data-driven portfolio for GitHub Pages.

## Content is separate from the UI

Edit only `data/site.json`, `data/projects.json`, `data/experience.json`, and `data/teams.json` for normal updates. The JavaScript builds the cards, filters, timeline, and project dialog automatically.

## Deploy

Create `YOUR_USERNAME.github.io`, copy these files, push to `main`, then enable GitHub Pages from the repository's Settings → Pages.

No server, database, Node.js runtime, PHP, or exposed API token is required. JSON is fetched by the visitor's browser, so this remains a static GitHub Pages site.

## Personal image

The hero uses a CSS-generated silhouette so the project works immediately. Replace the `.person` element in `index.html` with your own image when you want a real portrait.
