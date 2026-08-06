# NovaTools

498 free browser tools — 109 of them for social media. One static HTML file, no
build step, no server, no dependencies.

Everything runs in the visitor's browser. Nothing is uploaded, which is both the
privacy story and the hosting story: this costs nothing to run at any traffic
level.

## Contents

| file | what it is |
|---|---|
| `index.html` | the whole site |
| `privacy.html` | required before any ad network will approve you |
| `sitemap.xml` | 496 URLs, one per tool |
| `robots.txt` | points crawlers at the sitemap |
| `ads.txt` | placeholder — replace with the line AdSense gives you |

## Deploying

1. Create a repository, add these files.
2. Settings → Pages → deploy from `main`, root.
3. Replace every `REPLACE-ME` with your real domain — in `robots.txt`,
   `sitemap.xml`, and the `<link rel=canonical>` in `index.html`.
4. Regenerate the sitemap after adding tools: open the site, and in the browser
   console run `ncSitemap('https://yourdomain.com/')`. Save the output over
   `sitemap.xml`. It is generated from the catalogue so it cannot drift.

A custom domain is worth the ~£10/year. Ad networks approve `yoursite.com`
far more readily than `username.github.io/tools`, and it is yours if you ever
move hosts.

## Why every tool has its own URL

`?t=sz-youtube-thumbnail` opens the YouTube thumbnail resizer directly, with its
own `<title>`, its own meta description and its own canonical link.

This matters more than anything else in this repo. A single-page site with a
modal gives Google one thing to index: "Tools". Nobody searches "tools". They
search "youtube thumbnail size" and "inches to cm" — and each of those has to be
a page that can rank and be linked to. 496 indexable URLs is the entire
business model; the tools are what make people stay once they arrive.

## Before you apply for ads

- Replace the contact line in `privacy.html` with a real address.
- Put your real domain in place of every `REPLACE-ME`.
- Submit the sitemap in Google Search Console and wait until pages are actually
  indexed. Applying with zero indexed pages is the most common rejection.
