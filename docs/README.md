## docs/

The `docs/` directory is a mirrored version of the root site.

It contains the same portfolio, split into separate files:

- `index.html`
- `style.css`
- `script.js`

This exists to support GitHub Pages setups when the site source is configured to be served from the `/docs` directory instead of the repository root.

### Why this exists

GitHub Pages allows two common deployment modes:
- Serve from the repository **root**
- Serve from the `/docs` folder

Keeping a `docs/` copy makes it easy to switch deployment strategies without restructuring the project or introducing a build step.

### Important note

Only **one** location is meant to be active at a time:
- Either `/` (root)
- Or `/docs`

The contents are intentionally kept identical to avoid divergence and confusion.

This is a structural convenience, not a separate site.
