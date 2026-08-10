/* ============================================================================
   NovaTools — site configuration
   ============================================================================
   Everything that changes between "my copy" and "the live site" lives here, so
   nothing else in the project has to be edited to go live.

   This is the static-site equivalent of environment variables. There is no
   build step and no server, so there is nothing to read a .env file — but the
   property that matters is the same one: no ID is hard-coded into a page, and
   turning a service on is a single line in a single file.

   IMPORTANT: this file ships to the browser. Everything in it is public by
   definition. Put publisher IDs, measurement IDs and public form endpoints
   here. Never put an API secret, a private key or an SMTP password here — if
   a service hands you something it calls "secret", it does not belong in a
   static site at all.

   Every value below is empty on purpose. An empty value means the feature is
   off: no script is loaded, no slot is rendered, no request is made. Fill in
   what you have and leave the rest alone.
   ============================================================================ */

window.NT = {

  /* --- the site itself ---------------------------------------------------
     origin has no trailing slash. It is used for canonical URLs, Open Graph
     URLs, the sitemap and the JSON-LD, so getting it right once fixes all of
     them. Until you set it, canonical tags fall back to the address the page
     was actually loaded from, which is correct but does not deduplicate
     www / non-www. */
  origin: '',                       // e.g. 'https://novatools.app'
  name: 'NovaTools',
  tagline: 'Free browser tools that never upload your files',
  owner: '',                        // the person or company operating the site
  jurisdiction: '',                 // e.g. 'England and Wales' — used in the legal pages
  email: '',                        // the address on the contact and legal pages
  founded: '2026',

  /* --- Google AdSense ----------------------------------------------------
     client is your ca-pub-XXXXXXXXXXXXXXXX. While it is empty:
       - the AdSense script is never loaded
       - no ad slot renders anything
       - no ad cookie is set, so the consent banner stays hidden

     Add ?adpreview=1 to any URL to see where the slots are without enabling
     ads. That is a layout check, not a live ad.

     slots maps a placement name to the ad unit ID you create in AdSense.
     A placement with no slot ID renders nothing, so you can switch them on one
     at a time and watch what each does to your numbers.

     Read this before you enable anything: AdSense will not approve a site for
     the slots being there. It approves for content. The blog and the legal
     pages in this project exist for that reason. */
  adsense: {
    client: '',                     // 'ca-pub-0000000000000000'
    slots: {
      belowHero: '',
      inDirectory: '',
      betweenSections: '',
      aboveFooter: '',
      sidebar: '',
      inArticle: ''
    },
    /* Auto ads let Google place units wherever it likes, including over a tool
       someone is using. Leave this off. The named slots above are placed where
       they cannot interrupt anything. */
    autoAds: false
  },

  /* --- measurement -------------------------------------------------------
     Each is independent and each is off until it has an ID. Nothing here
     loads before the page has, so none of it costs you Largest Contentful
     Paint. */
  analytics: {
    ga4: '',                        // 'G-XXXXXXXXXX'
    clarity: '',                    // Microsoft Clarity project ID
    plausible: '',                  // your domain, e.g. 'novatools.app'
    plausibleHost: 'https://plausible.io',
    metaPixel: '',                  // optional, and the heaviest of the four
    searchConsole: ''               // the google-site-verification token
  },

  /* --- newsletter --------------------------------------------------------
     endpoint should accept a POST with an `email` field and CORS from your
     domain — Buttondown, ConvertKit, Mailchimp, Formspree and Listmonk all do.
     With no endpoint the form opens the visitor's mail client instead of
     pretending to have subscribed them. */
  newsletter: {
    endpoint: '',
    fieldName: 'email'
  },

  /* --- contact form ------------------------------------------------------
     Same shape. With no endpoint the form composes a mail instead. */
  contact: {
    endpoint: ''
  },

  /* --- social ------------------------------------------------------------
     Only accounts that exist. An empty value removes the icon rather than
     linking somewhere broken. */
  social: {
    x: '',
    github: '',
    youtube: '',
    linkedin: '',
    mastodon: ''
  }
};

/* ----------------------------------------------------------------------------
   The AdSense loader, emitted here rather than in nt.js.

   This file is in the <head> and is parser-blocking, so the tag below lands in
   the head before the body is parsed. That matters for one reason: when you
   add a site, AdSense fetches it and looks for its snippet, and a tag appended
   by a deferred script after DOMContentLoaded is the usual reason it reports
   "we couldn't find the code on your site". This is the same tag AdSense gives
   you to paste, built from the client ID above.

   With no client ID nothing is emitted: no request, no cookie, no consent
   banner. nt.js checks the flag and does not add a second copy.
   ---------------------------------------------------------------------------- */
(function () {
  var client = window.NT && window.NT.adsense && window.NT.adsense.client;
  if (!client) return;
  var s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
          encodeURIComponent(client);
  document.head.appendChild(s);
  window.__ntAdsLoader = true;
})();
