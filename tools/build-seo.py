#!/usr/bin/env python3
"""Builds the publishable site into _site/ . Needs only Python 3, no packages.

  python3 tools/build-seo.py

It copies the site to _site/ and replaces the "<!-- seo -->" line in _site/index.html with the
title, description, link-preview (Open Graph / X) and JSON-LD tags generated from
data/seo.json and data/site.json. Your own index.html is never modified.

Why a build step and not JavaScript: LinkedIn, WhatsApp, X and Google's first pass read the
raw HTML and do not run JavaScript, so these tags must be real text in the HTML that is served.
"""
import json, shutil, sys, pathlib
from html import escape

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLACEHOLDER = '<!-- seo -->'
SKIP = {'.git', '.github', '.gitignore', 'tools', '_site', 'README.md', 'node_modules'}

def load(name):
    return json.loads((ROOT / 'data' / name).read_text(encoding='utf-8'))

def build():
    s, site = load('seo.json'), load('site.json')
    q = lambda v: escape(str(v), quote=True)
    base = s['url'].rstrip('/') + '/'
    img = s['image']
    img_url = base + img['path'] + ('?v=' + str(img['version']) if img.get('version') else '')
    share = s.get('shareTitle') or s['title']
    ld = {
        '@context': 'https://schema.org', '@type': 'Person', 'name': site['name'], 'url': base,
        'jobTitle': s['jobTitle'], 'sameAs': [l['url'] for l in site['links']],
    }
    ld_json = json.dumps(ld, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    meta = lambda k, n, v: f'<meta {k}="{n}" content="{q(v)}">'
    lines = [
        meta('name', 'description', s['description']),
        meta('name', 'author', s['author']),
        f'<meta name="theme-color" content="{q(s["themeColor"]["light"])}" media="(prefers-color-scheme: light)">',
        f'<meta name="theme-color" content="{q(s["themeColor"]["dark"])}" media="(prefers-color-scheme: dark)">',
        f'<link rel="canonical" href="{q(base)}">',
        f'<link rel="icon" href="{q(s["favicon"])}" type="image/svg+xml">',
        '',
        '<!-- Link previews: LinkedIn, Facebook, WhatsApp, Slack, iMessage (Open Graph) -->',
        meta('property', 'og:type', 'website'),
        meta('property', 'og:site_name', s['siteName']),
        meta('property', 'og:title', share),
        meta('property', 'og:description', s['description']),
        meta('property', 'og:url', base),
        meta('property', 'og:image', img_url),
        meta('property', 'og:image:type', 'image/png' if img['path'].endswith('.png') else 'image/jpeg'),
        meta('property', 'og:image:width', img['width']),
        meta('property', 'og:image:height', img['height']),
        meta('property', 'og:image:alt', img['alt']),
        '<!-- X / Twitter -->',
        meta('name', 'twitter:card', 'summary_large_image'),
        meta('name', 'twitter:title', share),
        meta('name', 'twitter:description', s['description']),
        meta('name', 'twitter:image', img_url),
        meta('name', 'twitter:image:alt', img['alt']),
        f'<script type="application/ld+json">{ld_json}</script>',
        f'<title>{q(s["title"])}</title>',
    ]
    return '\n'.join(lines)

def main():
    out = ROOT / '_site'
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(ROOT, out, ignore=lambda d, names: [n for n in names if n in SKIP and pathlib.Path(d) == ROOT])
    page = out / 'index.html'
    html = page.read_text(encoding='utf-8')
    if PLACEHOLDER not in html:
        sys.exit('index.html needs a "' + PLACEHOLDER + '" line inside <head>.')
    page.write_text(html.replace(PLACEHOLDER, build(), 1), encoding='utf-8')
    print('Built _site/ (link-preview tags added to _site/index.html)')

if __name__ == '__main__':
    main()
