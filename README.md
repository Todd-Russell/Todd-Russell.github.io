# Todd Russell — Engineering Portfolio

Personal portfolio hosted on todd-russell.github.io/portfolio.

## Repository Structure

```
todd-russell.github.io/portfolio
├── index.html       # Main site — renders from the JSON data files at runtime
├── resume.json      # Hero, stats, experience, education, coursework, skills, publications
├── projects.json    # Projects, grouped into four categories
├── assets/          # Project images (referenced by projects.json)
└── README.md
```

All content lives in the two JSON files. The HTML rarely needs to change for content updates.

## Build & validate (run before every commit)

The site is **pre-rendered**: `index.html` and `resume.html` ship with the real
content baked into the HTML so search engines, social link previews, and applicant
tracking systems see a full page even without running JavaScript. The browser then
"hydrates" from the same data for the interactive bits (tabs, expandable cards, the
CAD/build slider).

After editing `resume.json` or `projects.json`, regenerate the pages:

```
cd portfolio
node build.js
```

`build.js` will:
1. **Validate both JSON files** with `python -m json.tool` and abort if either is
   invalid, so a broken file can never be committed.
2. Re-render every section into the static HTML.
3. Inline the JSON for fast hydration.

If you only want the parse check without rebuilding:

```
python -m json.tool resume.json  > /dev/null && echo OK
python -m json.tool projects.json > /dev/null && echo OK
```

Then commit `index.html`, `resume.html`, `render.js`, `build.js`, the two JSON files,
and `assets/`. Do **not** hand-edit the content inside the `<!--SSR:...-->` fences in
the HTML; edit the JSON and re-run `node build.js`.

### How the rendering is shared
`render.js` holds the single set of HTML builders used by **both** the browser and
`build.js`, so there is no duplicate render logic to keep in sync.

## Local preview

Serve the folder over HTTP, then open the local URL:

```
python -m http.server 8000
# visit http://localhost:8000
```

Opening `index.html` directly (file://) will not work, because the browser blocks
`fetch` of the local JSON files. A simple HTTP server (or GitHub Pages) is required.

## Updating the site

### Add or edit a project

Add an object to `projects.json`. Schema:

```json
{
  "id": "unique-id",
  "category": "Work",
  "featured": false,
  "company": "Company or Team Name",
  "title": "Project Title",
  "year": "2025",
  "image": "assets/your-photo.jpg",
  "metric": { "value": "500%", "label": "throughput increase" },
  "summary": "One-line result shown on the card.",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "par": {
    "problem": "What needed solving.",
    "action": "What you did.",
    "result": "The measurable outcome."
  }
}
```

Field notes:
- `category` — one of `Work`, `Class`, `Club`, `Personal`. Drives the filter tabs.
- `featured` — set `true` for the one project that leads its category as the spotlight.
- `image` — relative path to a file in `assets/`, or `null`. If `null`, the card shows
  an accent metric tile (from `metric`) instead of a photo.
- `metric` — `{ value, label }` used for the metric tile and as a headline number.
  Optional; omit with `null`.
- `par` — optional Problem/Action/Result detail revealed when the card is expanded.

### Update resume data

Edit `resume.json`: `tagline`, `descriptors`, `stats`, `experience`, `education`,
`coursework`, `skills`, `publications`, `resumePdf`, `linkedin`, `email`.

### Programmatic update via GitHub API

```
# 1. Get current file SHA (required for PUT)
GET https://api.github.com/repos/todd-russell/todd-russell.github.io/contents/portfolio/resume.json
GET https://api.github.com/repos/todd-russell/todd-russell.github.io/contents/portfolio/projects.json

# 2. Update the file
PUT https://api.github.com/repos/todd-russell/todd-russell.github.io/contents/portfolio/resume.json
PUT https://api.github.com/repos/todd-russell/todd-russell.github.io/contents/portfolio/projects.json
Headers: Authorization: Bearer <GITHUB_TOKEN>
Body:
{
  "message": "Update projects",
  "content": "<base64-encoded JSON string>",
  "sha": "<sha from step 1>"
}
```

GitHub Pages auto-deploys within ~30 seconds of each commit.

> Reminder: run `node build.js` (which runs the JSON parse check and re-renders) before committing.
