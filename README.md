# NovaTools

2,119 single-purpose tools that run entirely in the visitor's browser, plus the
content and legal pages a site needs before it can carry advertising.

Static files. No build step, no framework, no server, no package manager. Copy
the folder to any static host and it works.

## Files

| file | what it is |
|---|---|
| `index.html` | The application. Self-contained: styling, code and all 2,119 tools. |
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

- `nt-config.js` → `origin: 'https://mynovatools.com'` (no trailing slash)
- Every `.html` file, plus `robots.txt` and both sitemaps, already carry
  `https://mynovatools.com`. If the domain ever changes, find and replace it.

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
- Submit `https://mynovatools.com/sitemap-launch.xml`
- Check that `robots.txt` resolves

A custom domain is worth the ~£10/year. Ad networks approve `yoursite.com` far
more readily than `username.github.io/tools`, and it stays yours if you move
hosts.

## Advertising

Nothing loads until `adsense.client` is set. Before that: no script tag, no
request, no cookie, no consent banner, and every slot stays `display:none`
rather than leaving a labelled hole in the page.

`nt-config.js` sits in the `<head>` of every page and emits the AdSense loader
itself, so the tag is in the head during the initial parse rather than appended
later by a deferred script. `nt.js` then fills the slots. That split exists
because AdSense's verifier looks in the head of the HTML, and "we couldn't find
the code on your site" is otherwise the first thing you hit.

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

### Setting up AdSense, in order

The order matters. Steps 1–3 happen before you apply; 4–8 after you are
approved, which takes anywhere from a day to a few weeks.

**1. Get the site live on the domain and indexed.**
Set `origin` in `nt-config.js` (already `https://mynovatools.com`), submit
`sitemap-launch.xml` in Search Console, and wait until Search Console's Pages
report shows real indexed pages. Do not apply before this. "Site not
available" and "low value content" are both usually this.

**2. Create the AdSense account** at adsense.google.com and add the site.
AdSense will give you a publisher ID in the form `ca-pub-0000000000000000`.

**3. Put the publisher ID in `nt-config.js` and redeploy.**

```js
adsense: {
  client: 'ca-pub-0000000000000000',
  slots: { /* leave all of these empty for now */ }
}
```

That one line is the verification snippet. `nt-config.js` is in the `<head>` of
every page and is parser-blocking, so the AdSense loader is in the head before
the body is parsed — which is where AdSense's checker looks. With the client
set and every slot still empty, the loader is present and no ad unit renders,
which is exactly the state AdSense wants to review.

Confirm it worked before clicking Request Review: open the live site, View
Source, and search for `adsbygoogle`. If it is not there, the deploy did not
pick up your edit.

Then click **Request review** in AdSense and wait.

**4. Once approved, replace `ads.txt`.**
Copy the exact line from AdSense → Sites → Ads.txt. It looks like:

```
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

The whole file is that one line. Until you do this AdSense shows "Earnings at
risk", and it is right to — without `ads.txt` anyone can claim to sell your
inventory.

**5. Create ad units.** AdSense → Ads → By ad unit → Display ad. Make one per
placement you want, name it after the placement, choose **Responsive**, and
copy the `data-ad-slot` number — the 10 digits, not the whole snippet. You do
not need the HTML AdSense shows you; this project builds the tag itself.

**6. Paste the numbers into `slots`.**

```js
slots: {
  belowHero: '1234567890',
  aboveFooter: '0987654321',
  inArticle: '',            // still off
  ...
}
```

Turn them on one at a time and give each a week. A placement with no number
renders nothing, so this is a safe way to find out which ones actually earn
rather than just annoy.

**7. Leave `autoAds: false`.** Auto ads let Google insert units anywhere it
likes, including on top of a tool someone is mid-way through using. On a site
whose whole point is "it just works in your browser", that is a bad trade.

**8. Check it on a phone.** Most of the traffic a tool site gets is mobile, and
`aboveFooter` plus `belowHero` on a small screen is already two units on a
short page. If it looks like an ad farm to you, it looks like one to a reviewer.

### If AdSense rejects you

The rejection email names a reason, and the two common ones have specific fixes
rather than general ones:

- **"Low value content"** — usually the converters. 1,637 of the tools are
  generated from one template, and a crawler that meets them first sees a wall
  of near-identical pages. That is what `sitemap-launch.xml` exists for; make
  sure that is the one submitted, and that the eight blog articles are indexed.
- **"Site not available"** — almost always the snippet, not the site. Check
  step 3, and check that the domain you added in AdSense matches the one that
  actually serves the site, including www / non-www.

You can reapply. Fix the named reason first; reapplying unchanged just spends
the wait again.

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

### Two sitemaps, and which one to submit

`sitemap.xml` lists everything: 2,135 URLs, of which 1,632 are conversion pairs
generated from the same template.

`sitemap-launch.xml` lists 590: every page, every hand-written tool, and the 87
conversions people actually search for. Submit **this one** while the site is
new and waiting on AdSense. A brand-new domain whose sitemap is mostly
near-identical templated pages is what Google's helpful-content system is
looking for, and the converters are the part of the catalogue least able to
defend itself on quality. Nothing is hidden — the tools all still work and are
linked from the directory; they are simply not the first thing a crawler meets.

Once the site is approved, point `robots.txt` at `sitemap.xml` and resubmit.
The trimmed file regenerates the same way as the full one:

```js
copy(ncSitemap('https://yourdomain.com/', { launch: true }))
```

The conversions it keeps are the `LAUNCH_PAIRS` list in `index.html`.

## Licence

MIT — see `LICENSE`.
