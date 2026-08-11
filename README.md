# NovaTools

498 single-purpose tools that run entirely in the visitor's browser, plus the
content and legal pages a site needs before it can carry advertising.

Static files. No build step, no framework, no server, no package manager. Copy
the folder to any static host and it works.

## Files

| file | what it is |
|---|---|
| `index.html` | The application. Self-contained: styling, code and all 498 tools. |
| `nt-config.js` | **The only file you have to edit.** IDs, endpoints, your domain. |
| `nt.css` | Shared stylesheet for the content pages. |
| `nt.js` | Shared runtime: navbar, footer, ad slots, measurement, forms. |
| `about.html` `pricing.html` `contact.html` | Content pages. |
| `privacy.html` `terms.html` `cookies.html` `disclaimer.html` | Legal pages. |
| `blog.html` + `blog/` | Eight reference articles with a category filter. |
| `robots.txt` `sitemap.xml` `ads.txt` | Crawler and ad-network files. |

`index.html` still works on its own if `nt-config.js` and `nt.js` are missing.
You lose advertising and analytics, not tools.

## Going live

### 1. Set your domain

Two places, and they must agree:

- `nt-config.js` → `origin: 'https://yourdomain.com'` (no trailing slash)
- Find and replace `https://REPLACE-ME` with your domain across every `.html`
  file, plus `robots.txt` and `sitemap.xml`

Canonical and Open Graph tags are written into each page so a crawler that does
not run scripts still reads them. `nt.js` also patches them from `origin` at
runtime, which covers you if a replace was missed — but do the replace anyway,
because it is what non-rendering crawlers see.

### 2. Fill in the rest of `nt-config.js`

`owner`, `jurisdiction` and `email` appear in the legal pages.

Those pages describe this site as it is actually built rather than being a
generic template — the privacy policy names the two local-storage keys, the
cookie policy lists the specific services, the disclaimer says where each kind
of tool can be wrong. Read them before publishing. They are not legal advice,
and if your situation is unusual, have them reviewed.

### 3. Submit to Google

- Add the property in Search Console; verify with the meta tag
  (`analytics.searchConsole`) or a DNS record
- Submit `https://yourdomain.com/sitemap.xml`
- Check that `robots.txt` resolves

A custom domain is worth the ~£10/year. Ad networks approve `yoursite.com` far
more readily than `username.github.io/tools`, and it stays yours if you move
hosts.

## Advertising

Nothing loads until `adsense.client` is set. Before that: no script tag, no
request, no cookie, no consent banner, and every slot stays `display:none`
rather than leaving a labelled hole in the page.

```js
adsense: {
  client: 'ca-pub-0000000000000000',
  slots: { belowHero: '1234567890', aboveFooter: '', ... }
}
```

A placement with no slot ID renders nothing, so you can switch them on one at a
time and watch what each does to your numbers.

**To see where the slots are without enabling anything**, add `?adpreview=1` to
any URL. Every placement is outlined and labelled.

| placement | where |
|---|---|
| `belowHero` | Under the hero, above the tool directory |
| `inDirectory` | Below the tool grid |
| `betweenSections` | Between long content sections |
| `aboveFooter` | Above the footer, on every page |
| `sidebar` | Fixed rail, only above 1400px where there is unused margin |
| `inArticle` | Mid-article on blog posts |

Two rules are enforced in code rather than left to discipline: a slot placed
inside the tool panel or a form is removed at load, and no space is reserved
until a slot is known to be live — so a page without ads has no gaps and a page
with ads does not jump. `autoAds` is off and should stay off; it lets Google
place a unit over a tool someone is using.

### Before applying to AdSense

AdSense does not approve a site for having ad slots. It approves for content,
navigation and policy pages. What is here for that reason: eight substantial
reference articles, four specific legal pages, a working contact route, and a
footer that links only to pages that exist.

What you still have to do: put it on a real domain, get it indexed, and replace
`ads.txt` with the line AdSense gives you once approved. Applying with zero
indexed pages is the most common rejection.

## Measurement

Each is independent, and each is off until it has an ID.

```js
analytics: { ga4: 'G-XXXXXXXXXX', clarity: '', plausible: 'yourdomain.com',
             metaPixel: '', searchConsole: '' }
```

All of it loads at browser idle, after the page is interactive, so none of it
competes with rendering. Plausible sets no cookies and needs no consent banner;
the other three do, and the banner appears by itself when one is enabled.

## Newsletter and contact forms

Both take an endpoint that accepts a `POST` and allows CORS from your domain —
Buttondown, ConvertKit, Mailchimp, Formspree and Listmonk all work.

```js
newsletter: { endpoint: 'https://...', fieldName: 'email' },
contact:    { endpoint: 'https://...' }
```

With no endpoint, both open the visitor's mail client instead. Neither will ever
show a success message for a request that was not made.

## Why every tool has its own URL

`?t=sz-youtube-thumbnail` opens the YouTube thumbnail resizer directly, with its
own title, its own meta description and its own canonical link.

This matters more than anything else here. A single-page site with a modal gives
Google one thing to index: "Tools". Nobody searches for "tools". They search for
"youtube thumbnail size" and "inches to cm", and each of those has to be a page
that can rank and be linked to.

## Adding a tool

Most tools come from tables near the bottom of `index.html`. A social placement
size is one row:

```js
['Instagram carousel', 1080, 1080, 'instagram'],
```

The card, the description, the implementation, the URL and the sitemap entry all
follow from it. The rule those tables observe: an entry must vary a real
parameter — a dimension, a cap, a factor, a platform rule — never just the title.

## Adding a blog post

Posts share one shell, so the table of contents, reading time, sharing, ad slots
and structured data are identical everywhere. Copy a file in `blog/`, replace
the `<article>` contents and the head tags, and add it to `sitemap.xml`.
Headings get IDs and the contents list builds itself.

## Regenerating the sitemap

```js
// browser console, on index.html
copy(ncSitemap('https://yourdomain.com/'))
```

It is built from the live catalogue, so it cannot list a tool that does not
exist. Add the content and blog pages to the top of the file by hand.

## Licence

MIT — see `LICENSE`.
