/* ============================================================================
   NovaTools — shared runtime for the content pages
   ============================================================================
   Loaded with `defer` after nt-config.js. It builds the navbar and footer,
   places the ad slots, loads whichever measurement tools have been configured,
   wires the forms, and fills in the origin-dependent parts of the SEO tags.

   Three rules it follows throughout:

   1. Nothing loads that has not been configured. An empty ID means the script
      tag is never created, so there is no request, no cookie and no consent
      question to ask.
   2. Nothing renders that has no content. An ad slot with no unit ID stays
      display:none rather than leaving a labelled hole in the page.
   3. Nothing is claimed that is not true. The newsletter and contact forms
      either post to a real endpoint or open a mail client — they never show a
      success message for a request that was not made.
   ============================================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     CONFIG
     nt-config.js may be missing entirely (someone copies one page on its own),
     so every read goes through a default.
     --------------------------------------------------------------------------- */
  var C = window.NT || {};
  C.name = C.name || 'NovaTools';
  C.adsense = C.adsense || {}; C.adsense.slots = C.adsense.slots || {};
  C.analytics = C.analytics || {};
  C.newsletter = C.newsletter || {};
  C.contact = C.contact || {};
  C.social = C.social || {};
  window.NT = C;

  var origin = (C.origin || '').replace(/\/$/, '');

  /* Pages inside a subfolder (the blog) set <html data-base="../">, so the one
     set of nav and footer links resolves from any depth without hard-coding
     absolute URLs that would break on a project-page host like GitHub Pages. */
  var BASE = document.documentElement.getAttribute('data-base') || '';

  /* index.html is the application: it ships its own navbar, footer and theme
     toggle inside one self-contained file, and it must keep working if this
     script is absent. It marks itself with data-nt-app, and everything here
     that would collide with its own chrome stands down. What it does still get
     is the parts that have no local equivalent — ad slots, measurement, the
     consent notice and the canonical/Open Graph fill-in. */
  var APP = document.documentElement.hasAttribute('data-nt-app');
  var mailto = C.email ? 'mailto:' + C.email : '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------------------------------------------------------------------------
     SEO: finish what the static tags started
     Each page hard-codes its canonical and Open Graph URLs with a REPLACE-ME
     host, because a crawler that does not run scripts still needs to read them.
     If nt-config.js knows the real origin, patch them here too — that way
     setting one value fixes every page even if the find-and-replace was missed.
     --------------------------------------------------------------------------- */
  function seo() {
    if (!origin) return;
    $$('link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"]').forEach(function (n) {
      var a = n.hasAttribute('href') ? 'href' : 'content';
      var v = n.getAttribute(a);
      if (v && v.indexOf('REPLACE-ME') > -1) n.setAttribute(a, v.replace(/https?:\/\/REPLACE-ME/g, origin));
    });
    $$('script[type="application/ld+json"]').forEach(function (n) {
      if (n.textContent.indexOf('REPLACE-ME') > -1) {
        n.textContent = n.textContent.replace(/https?:\/\/REPLACE-ME/g, origin);
      }
    });
    if (C.analytics.searchConsole && !$('meta[name="google-site-verification"]')) {
      document.head.appendChild(el('meta', {
        name: 'google-site-verification', content: C.analytics.searchConsole }));
    }
  }

  /* ---------------------------------------------------------------------------
     THEME
     The page head runs a two-line inline script that sets data-theme before
     first paint; this only handles the toggle so the two never fight.
     --------------------------------------------------------------------------- */
  function theme() {
    if (APP) return;
    var b = $('#themebtn');
    if (!b) return;
    b.addEventListener('click', function () {
      var now = document.documentElement.dataset.theme ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = now === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('nt_theme', next); } catch (e) {}
      b.setAttribute('aria-label', 'Switch to ' + (next === 'dark' ? 'light' : 'dark') + ' theme');
    });
  }

  /* ---------------------------------------------------------------------------
     NAV + FOOTER
     Only pages that exist appear in either. A footer full of links to pages
     that were never written is a bad visitor experience, a crawl budget leak,
     and one of the things a human AdSense reviewer checks by clicking.
     --------------------------------------------------------------------------- */
  var NAV = [
    ['index.html', 'Tools'],
    ['blog.html', 'Blog'],
    ['about.html', 'About'],
    ['pricing.html', 'Pricing'],
    ['contact.html', 'Contact']
  ];

  var FOOTER = [
    ['Product', [
      ['index.html', 'All tools'],
      ['index.html#features', 'Features'],
      ['index.html#roadmap', 'Roadmap'],
      ['pricing.html', 'Pricing'],
      ['blog.html', 'Blog']
    ]],
    ['Popular tools', [
      ['index.html?t=word-counter', 'Word counter'],
      ['index.html?t=password', 'Password generator'],
      ['index.html?t=sz-youtube-thumbnail', 'YouTube thumbnail size'],
      ['index.html?t=json-formatter', 'JSON formatter'],
      ['index.html?t=img-compress', 'Image compressor']
    ]],
    ['Company', [
      ['about.html', 'About'],
      ['contact.html', 'Contact'],
      ['blog.html', 'Blog']
    ]],
    ['Legal', [
      ['privacy.html', 'Privacy Policy'],
      ['terms.html', 'Terms of Service'],
      ['cookies.html', 'Cookie Policy'],
      ['disclaimer.html', 'Disclaimer']
    ]]
  ];

  var ICON = {
    x: 'X', github: 'GH', youtube: 'YT', linkedin: 'in', mastodon: 'M'
  };

  function here() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function nav() {
    if (APP) return;
    var host = $('#ntnav');
    if (!host) return;
    var cur = here();
    host.innerHTML =
      '<div class="navin">' +
        '<a class="brand" href="' + BASE + 'index.html">' +
          '<span class="brandsq" aria-hidden="true">N</span><span>' + esc(C.name) + '</span></a>' +
        '<div class="navlinks">' +
          NAV.map(function (l) {
            return '<a href="' + BASE + l[0] + '"' + (l[0] === cur ? ' aria-current="page"' : '') + '>' + l[1] + '</a>';
          }).join('') +
        '</div>' +
        '<div class="navright">' +
          '<button class="iconbtn" id="themebtn" aria-label="Switch theme" title="Switch theme">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
            '<path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor"/></svg></button>' +
          '<a class="cta" href="' + BASE + 'index.html">Open the tools</a>' +
        '</div>' +
      '</div>';
  }

  function foot() {
    if (APP) return;
    var host = $('#ntfoot');
    if (!host) return;
    var socials = Object.keys(C.social).filter(function (k) { return C.social[k]; });
    host.innerHTML =
      '<div class="wrap">' +
        '<div class="footcols">' +
          '<div>' +
            '<a class="brand" href="' + BASE + 'index.html" style="margin-bottom:12px">' +
              '<span class="brandsq" aria-hidden="true">N</span><span>' + esc(C.name) + '</span></a>' +
            '<p>' + esc(C.tagline || 'Free browser tools that never upload your files') + '</p>' +
            '<form class="news" id="ntnews" novalidate>' +
              '<label class="sr" for="ntnewsmail">Email address</label>' +
              '<input id="ntnewsmail" name="email" type="email" placeholder="you@example.com" autocomplete="email">' +
              '<button class="cta" type="submit">Subscribe</button>' +
            '</form>' +
            '<p class="formmsg" id="ntnewsmsg" role="status" aria-live="polite"></p>' +
          '</div>' +
          FOOTER.map(function (col) {
            return '<div><h2>' + col[0] + '</h2>' +
              col[1].map(function (l) { return '<a href="' + BASE + l[0] + '">' + l[1] + '</a>'; }).join('') +
              '</div>';
          }).join('') +
        '</div>' +
        '<div class="footbot">' +
          '<span>&copy; ' + new Date().getFullYear() + ' ' + esc(C.name) +
            (C.owner ? ' &middot; ' + esc(C.owner) : '') + '</span>' +
          '<span>Runs entirely in your browser</span>' +
          (socials.length
            ? '<div class="social">' + socials.map(function (k) {
                return '<a href="' + esc(C.social[k]) + '" rel="me noopener" target="_blank" ' +
                  'aria-label="' + k + '"><span aria-hidden="true">' + (ICON[k] || k[0]) + '</span></a>';
              }).join('') + '</div>'
            : '') +
        '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------------------------
     AD SLOTS
     Markup a page writes:   <div class="adslot" data-ad="belowHero"></div>
     Nothing else. Whether that becomes an ad, a preview outline or nothing at
     all is decided here from the config, so a placement can be moved, added or
     removed without touching any ad code.

     The one rule that is enforced rather than documented: a slot inside the
     tool panel is refused. Interrupting someone mid-task is the fastest way to
     lose both the visitor and the AdSense account.
     --------------------------------------------------------------------------- */
  var adPreview = /[?&]adpreview=1/.test(location.search);

  function ads() {
    var client = C.adsense.client;
    $$('.adslot, .adrail').forEach(function (slot) {
      var name = slot.dataset.ad;
      var unit = C.adsense.slots[name];

      if (slot.closest('#sheet, .sbox, form')) {           // never over a tool or a form
        slot.remove();
        return;
      }
      if (client && unit) {
        slot.classList.add('live');
        slot.appendChild(el('span', { class: 'adlabel' }, 'Advertisement'));
        var ins = el('ins', {
          class: 'adsbygoogle',
          style: 'display:block',
          'data-ad-client': client,
          'data-ad-slot': unit,
          'data-ad-format': slot.dataset.format || 'auto',
          'data-full-width-responsive': 'true'
        });
        slot.appendChild(ins);
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      } else if (adPreview) {
        slot.classList.add('preview');
        slot.appendChild(el('div', { class: 'adbox' },
          'Ad slot &middot; <code>' + esc(name || '?') + '</code>' +
          (client ? ' &middot; no unit ID set' : ' &middot; no publisher ID set')));
      }
    });

    if (!client) return;
    var s = el('script', {
      async: '', crossorigin: 'anonymous',
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client)
    });
    document.head.appendChild(s);
    if (C.adsense.autoAds) {
      document.head.appendChild(el('script', null,
        '(adsbygoogle=window.adsbygoogle||[]).push({google_ad_client:"' + client + '",enable_page_level_ads:true});'));
    }
  }

  /* ---------------------------------------------------------------------------
     MEASUREMENT
     Loaded after the page is interactive so none of it competes with rendering.
     Plausible is first because it is the only one of the four that sets no
     cookie and needs no consent banner.
     --------------------------------------------------------------------------- */
  function measure() {
    var a = C.analytics;

    if (a.plausible) {
      document.head.appendChild(el('script', {
        defer: '', 'data-domain': a.plausible,
        src: (a.plausibleHost || 'https://plausible.io') + '/js/script.js'
      }));
    }
    if (a.ga4) {
      document.head.appendChild(el('script', {
        async: '', src: 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(a.ga4) }));
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', a.ga4, { anonymize_ip: true });
    }
    if (a.clarity) {
      document.head.appendChild(el('script', null,
        '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};' +
        't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;' +
        'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})' +
        '(window,document,"clarity","script","' + a.clarity + '");'));
    }
    if (a.metaPixel) {
      document.head.appendChild(el('script', null,
        '!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?' +
        'n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;' +
        'n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;' +
        't.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,' +
        '"script","https://connect.facebook.net/en_US/fbevents.js");' +
        'fbq("init","' + a.metaPixel + '");fbq("track","PageView");'));
    }
  }

  /* Does anything on this page store or read something that a visitor would
     reasonably want a say in? Only then is a banner honest. */
  function needsConsent() {
    return !!(C.adsense.client || C.analytics.ga4 || C.analytics.clarity || C.analytics.metaPixel);
  }

  function consent() {
    if (!needsConsent()) return;
    var KEY = 'nt_consent';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) return;

    var box = el('div', { id: 'ntconsent', role: 'dialog', 'aria-live': 'polite',
      'aria-label': 'Cookie notice' },
      '<p>This site shows ads and measures traffic, which sets cookies in your browser. ' +
      'The tools themselves work either way &mdash; nothing you paste or open is ever uploaded. ' +
      '<a href="' + BASE + 'cookies.html">What each cookie does</a>.</p>' +
      '<div class="row"><button class="cta" id="ntok">Accept</button>' +
      '<a class="ghost" href="' + BASE + 'cookies.html">Read first</a></div>');
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('show'); });
    $('#ntok').addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      box.remove();
    });
  }

  /* ---------------------------------------------------------------------------
     FORMS
     Both forms behave the same way: post if there is somewhere to post to,
     otherwise hand off to the visitor's mail client. What they never do is
     say "thanks, you're subscribed" when nothing left the page.
     --------------------------------------------------------------------------- */
  function post(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('The server answered ' + r.status + '.');
      return r;
    });
  }

  function say(node, text, kind) {
    if (!node) return;
    node.textContent = text;
    node.className = 'formmsg' + (kind ? ' ' + kind : '');
  }

  function newsletter() {
    var f = $('#ntnews'); if (!f) return;
    var msg = $('#ntnewsmsg');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#ntnewsmail').value.trim();
      if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v)) return say(msg, 'That does not look like an email address.', 'err');

      if (!C.newsletter.endpoint) {
        say(msg, 'There is no mailing list yet — opening your mail app instead.');
        location.href = (mailto || 'mailto:') + '?subject=' + encodeURIComponent('Subscribe to ' + C.name) +
          '&body=' + encodeURIComponent('Please add ' + v + ' to the list.');
        return;
      }
      say(msg, 'Sending…');
      var body = {}; body[C.newsletter.fieldName || 'email'] = v;
      post(C.newsletter.endpoint, body)
        .then(function () { say(msg, 'Done — check your inbox to confirm.', 'ok'); f.reset(); })
        .catch(function (err) { say(msg, 'That did not go through: ' + err.message, 'err'); });
    });
  }

  function contactForm() {
    var f = $('#ntcontact'); if (!f) return;
    var msg = $('#ntcontactmsg');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = {
        name: $('#cname').value.trim(),
        email: $('#cemail').value.trim(),
        subject: $('#csubject').value.trim(),
        message: $('#cmessage').value.trim()
      };
      if (!d.message) return say(msg, 'The message is empty.', 'err');
      if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(d.email)) return say(msg, 'That does not look like an email address.', 'err');

      if (!C.contact.endpoint) {
        say(msg, 'No form endpoint is configured — opening your mail app with this filled in.');
        location.href = (mailto || 'mailto:') + '?subject=' +
          encodeURIComponent(d.subject || (C.name + ' enquiry')) +
          '&body=' + encodeURIComponent(d.message + '\n\n— ' + d.name + ' <' + d.email + '>');
        return;
      }
      say(msg, 'Sending…');
      post(C.contact.endpoint, d)
        .then(function () { say(msg, 'Sent. You will get a reply at ' + d.email + '.', 'ok'); f.reset(); })
        .catch(function (err) { say(msg, 'That did not go through: ' + err.message, 'err'); });
    });
  }

  /* ---------------------------------------------------------------------------
     ARTICLE FURNITURE
     Table of contents, reading time and share links are built from the article
     that is already on the page, so writing a post means writing the post.
     --------------------------------------------------------------------------- */
  function article() {
    var body = $('#article'); if (!body) return;

    var heads = $$('h2', body).filter(function (h) { return !h.closest('.toc'); });
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'h-' + (i + 1) + '-' + h.textContent.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    });

    var toc = $('#toc');
    if (toc && heads.length > 2) {
      toc.innerHTML = '<h2>On this page</h2><ol>' + heads.map(function (h) {
        return '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>';
      }).join('') + '</ol>';
      toc.hidden = false;
    }

    var rt = $('#readtime');
    if (rt) {
      var words = body.textContent.trim().split(/\s+/).length;
      rt.textContent = Math.max(1, Math.round(words / 220)) + ' min read';
    }

    var share = $('#share');
    if (share) {
      var url = location.href.split('#')[0];
      var title = (document.title || '').split('|')[0].trim();
      var links = [
        ['X', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url)],
        ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url)],
        ['Reddit', 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title)],
        ['Email', 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url)]
      ];
      share.innerHTML = '<span>Share</span>' + links.map(function (l) {
        return '<a class="tag" href="' + l[1] + '" rel="noopener" target="_blank">' + l[0] + '</a>';
      }).join('') + '<button class="tag" id="copylink" type="button">Copy link</button>';
      $('#copylink').addEventListener('click', function () {
        var b = this;
        navigator.clipboard.writeText(url).then(function () {
          b.textContent = 'Copied';
          setTimeout(function () { b.textContent = 'Copy link'; }, 1600);
        }).catch(function () { b.textContent = 'Press Ctrl+C'; });
      });
    }
  }

  /* Images below the fold decode lazily and reserve their box from width and
     height attributes, which is the whole of the layout-shift problem for a
     content site. Applied here so an author cannot forget it. */
  function media() {
    $$('img').forEach(function (img, i) {
      if (!img.hasAttribute('loading') && i > 0) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
    $$('iframe').forEach(function (f) {
      if (!f.hasAttribute('loading')) f.setAttribute('loading', 'lazy');
    });
  }

  /* ------------------------------------------------------------------------- */
  function boot() {
    seo(); nav(); foot(); theme(); article(); media();
    newsletter(); contactForm(); ads();
    /* Measurement waits for idle: it is the least important thing on the page
       and the easiest to make someone wait for by accident. */
    if ('requestIdleCallback' in window) requestIdleCallback(function () { measure(); consent(); });
    else setTimeout(function () { measure(); consent(); }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
