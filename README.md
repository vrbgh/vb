# Portfolio

Content, structure, style and behaviour live in separate places.

```
index.html          page structure and <template> markup (no SEO tags here, see below)
css/style.css       look and layout
js/render.js        reads data/*.json and fills the page
js/signal.js        the animated signal graphic
data/               every word, link and file name shown on the page
  site.json           name, headline, intro, photo, email, phone, social links, resume files, footer
  projects.json       projects
  training.json       training and internships
  education.json      degrees
  certificates.json   certificates (image shown when clicked)
  skills.json         skill groups
  recognition.json    awards and presentations
  seo.json            tab title, description, site address, share image: everything link previews use
tools/build-seo.py  builds the publishable copy (_site/) with the link-preview tags added
.github/workflows/deploy.yml   runs that build and publishes to GitHub Pages on every push
assets/             images, resume PDF, favicon, share images
```

## Edit content (no HTML needed)

Change the matching file in `data/`, commit, done.

- **Add a project:** add an object to `projects.json` with `title`, `meta` (role and tools), `description`, and optionally `url`. Without `url` the title is plain text.
- **Add a certificate:** put the image in `assets/images/`, then add `{ "id": "c4", "title": "...", "date": "...", "image": "assets/images/....jpg", "alt": "..." }` to `certificates.json`. Each `id` must be unique.
- **Training / education:** objects with `title`, `date`, `subtitle` and an optional `description`.
- **Skills:** `{ "name": "Embedded", "items": ["Arduino", "NodeMCU"] }`.
- **New resume:** replace the PDF and the three page images in `assets/`, and update the paths in `site.json` if the names change.

Order on the page is the order in the file.

## Preview locally

Browsers block `fetch` on `file://`, so serve the folder:

```
python3 -m http.server
```

then open http://localhost:8000. (On GitHub Pages it just works.)

## Link previews (LinkedIn, WhatsApp, X, Google)

`index.html` has no title, description or preview tags, only a `<!-- seo -->` placeholder. Preview bots read the
raw HTML and do not run JavaScript, so the real tags are added when the site is published:

1. Edit `data/seo.json` (site address, titles, description, share image).
2. Commit and push to `main`. The workflow runs `tools/build-seo.py`, which copies the site to `_site/`,
   fills the placeholder from `seo.json` and `site.json`, and publishes `_site/`.

**One-time setup:** repo Settings > Pages > Build and deployment > Source: **GitHub Actions**.
(If Pages is still set to "Deploy from a branch", it publishes the raw files and the preview tags will be missing.)

To see the published version locally: `python3 tools/build-seo.py`, then serve `_site/`
(`cd _site && python3 -m http.server`). Opening the root folder also works, it just has no preview tags or tab title.

- `title` is the browser tab. `shareTitle` is what LinkedIn, WhatsApp and X show; keep it under about 35
  characters if you do not want it cut off in LinkedIn's Featured section.
- After changing the share image, set `image.version` to a new value (for example `"2"`) so apps fetch the new file, then
  re-check the link at https://www.linkedin.com/post-inspector/.
- If the site moves to another address, change `url` in `seo.json`.
