# akp-labs.github.io

Personal portfolio site for **AKP Labs**, built to showcase projects, experiments, and tools dynamically using the GitHub API.

This site is intentionally simple. No frameworks, no build step, no artificial polish.  
The goal is clarity, honesty, and direct access to real work.

---

## Why this approach

Portfolios may lie quietly.

They hardcode screenshots, list repositories manually, and freeze a moment in time.  
This site does the opposite.

- Projects are fetched **live** from GitHub
- Repositories update automatically
- Activity reflects reality, not marketing

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