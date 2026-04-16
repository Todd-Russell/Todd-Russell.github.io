# Todd Russell — Engineering Portfolio

Personal portfolio hosted on todd-russell.github.io/portfolio.

## Repository Structure

```
todd-russell.github.io/portfolio
├── index.html          # Main site — reads and renders from JSON data files
├── resume.json     # Experience, education, skills, stats bar
├── projects.json   # Project cards grid
├── assets/             # Images and static files (optional)
└── README.md
```

## Updating the Site (Cowork Automation)

All content lives in two JSON files. The HTML never needs to change for content updates.

### Add a new project

Add an object to `projects.json`:

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

Edit the relevant fields in `resume.json` — experience entries, education, skills, or stats.

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
