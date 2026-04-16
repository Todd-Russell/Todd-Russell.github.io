# Todd Russell — Engineering Portfolio

Personal portfolio hosted on [GitHub Pages](https://pages.github.com).

## Repository Structure

```
toddrussell.github.io/
├── index.html          # Main site — reads and renders from JSON data files
├── data/
│   ├── resume.json     # Experience, education, skills, stats bar
│   └── projects.json   # Project cards grid
├── assets/             # Images and static files (optional)
└── README.md
```

## GitHub Pages Setup

1. Create a repo named exactly `toddrussell.github.io`
2. Push all files to the `main` branch
3. Go to **Settings → Pages** and confirm source is set to `main` branch, root directory
4. Site will be live at `https://toddrussell.github.io` within ~60 seconds

## Updating the Site (Cowork Automation)

All content lives in two JSON files. The HTML never needs to change for content updates.

### Add a new project

Add an object to `data/projects.json`:

```json
{
  "id": "unique-id",
  "title": "Project Title",
  "company": "Company or Team Name",
  "year": "2025",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "description": "One to two sentence description of the project and key outcomes."
}
```

### Update experience or resume data

Edit the relevant fields in `data/resume.json` — experience entries, education, skills, or stats.

### Programmatic update via GitHub API

```
# 1. Get current file SHA (required for PUT)
GET https://api.github.com/repos/toddrussell/toddrussell.github.io/contents/data/projects.json
  → note the "sha" field

# 2. Update the file
PUT https://api.github.com/repos/toddrussell/toddrussell.github.io/contents/data/projects.json
Headers: Authorization: Bearer <GITHUB_TOKEN>
Body:
{
  "message": "Update projects",
  "content": "<base64-encoded JSON string>",
  "sha": "<sha from step 1>"
}
```

GitHub Pages auto-deploys within ~30 seconds of each commit.
