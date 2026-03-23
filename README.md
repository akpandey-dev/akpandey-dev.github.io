# akpandey-dev.github.io

My personal portfolio site, built to showcase projects, experiments, and tools dynamically using the GitHub API.

This site is intentionally simple.

---

## Why this approach

Instead of hardcoding screenshots and repository names, this site uses APIs:

- Projects are fetched **live** from GitHub
- Repositories update automatically
- Activity reflects reality

If it’s on the site, it exists in code.

---

## How it works

The site is a static GitHub Pages project powered by the **public GitHub API**.

Core ideas:
- `index.html` renders the structure
- `script` fetches repositories from GitHub
- Repos are filtered, sorted, and rendered dynamically
- No authentication required for normal usage

This keeps the site:
- fast
- transparent
- easy to audit
- easy to extend

---

## Tech stack

- HTML (structure)
- CSS (layout and visual restraint)
- Vanilla JavaScript (logic + API integration)
- GitHub Pages (hosting)
- GitHub API (data source)

No frameworks by design.  
Understanding beats abstraction at this stage.

---

**Everything served directly from the root, as GitHub Pages expects.**

---

## License

The projects it links to follow their own licenses.  
Check individual repositories for details.

---