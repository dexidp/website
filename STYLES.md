# Dex Website — Styles & Development

Internal guide for working on the `dexidp/website` repo. Covers how our
custom styling is layered on top of Docsy, the design tokens, how to add new
pages and components without making a mess, and the gotchas that will save
you an hour of confused debugging.

Read this before touching anything in `assets/scss/` or adding a new landing
page. It's deliberately short.

---

## 1. The stack in one paragraph

The site is built with [Hugo](https://gohugo.io/) and the
[Docsy](https://www.docsy.dev/) theme (vendored as a git submodule under
`themes/docsy/`). Docsy gives us the docs layout, navigation, search, and a
pile of Bootstrap 5 components. We add a thin layer of custom SCSS on top to
handle branding, the home-page composition, dark-theme support, and a large
set of targeted Docsy overrides. Our layer is compiled by Hugo from
`assets/sass/dex-custom.sass`, which imports a handful of topical partials
in `assets/scss/`.

---

## 2. Project layout

```
assets/
  sass/
    dex-custom.sass        ← entry point, imports every SCSS partial
  scss/
    _breakpoints.scss      ← $bp-xs … $bp-lg + `-down` variants
    _tokens.scss           ← CSS custom properties (light + dark)
    _typography.scss       ← body, headings, code, inline link treatment
    _components.scss       ← navbar, search, theme-toggle, cards, heading
                              anchor, footer, doc-cards, popover
    _docsy-docs.scss       ← .td-content, sidebars, tables, alerts, code
                              blocks, CNCF swap, kill Docsy hacks
    _home.scss             ← hero, bands, features, providers, use-cases,
                              step cards, CNCF section
    _styles_project.scss   ← 10-line entry, don't put rules here
    _variables_project.scss← Docsy/Bootstrap SCSS variable overrides
                              (compiled by Docsy's pipeline, NOT ours)

layouts/
  index.html                       ← home page layout
  _default/_markup/
    render-heading.html             ← emits <h{N}> with .heading-anchor inline
  partials/
    head.html                       ← theme pre-paint, font preconnect, meta
    navbar.html                     ← custom navbar with theme toggle
    search-input.html               ← local override, offlineSearch only

static/
  js/
    theme.js               ← theme module (getTheme/setTheme/toggleTheme)
    anchors.js              ← click-to-copy + smooth scroll for .heading-anchor

STYLES.md                  ← this file
```

**Important distinction:** `_variables_project.scss` is compiled by Docsy's
own SCSS pipeline (it's a Docsy convention — Docsy imports that file from
its internal `assets/scss/`). Our `dex-custom.sass` runs a *separate*
pipeline on top. So:

- To override **Docsy SCSS variables** (e.g. `$primary`, `$dark`): edit
  `_variables_project.scss`.
- To add **our own rules**: edit one of the partials imported by
  `dex-custom.sass`. The two pipelines don't share SCSS variables; our
  partials get their shared values from `_breakpoints.scss` and `_tokens.scss`.

---

## 3. Design tokens

Everything visual lives in `_tokens.scss` as CSS custom properties. **Never
hardcode a colour, size, shadow, or radius in other partials.** If it isn't
in `_tokens.scss` yet, add it there first.

The token families are:

| Family              | Vars                                                 | When to use                                   |
|---------------------|------------------------------------------------------|-----------------------------------------------|
| Brand               | `--dex-blue`, `--dex-blue-300..700`, `--dex-red`, `--dex-red-300..600` | Direct brand colour |
| Tints               | `--blue-tint-1..4`, `--red-tint-1..4`               | Subtle overlays, hover backgrounds            |
| Semantic alerts     | `--color-info`, `--color-success`, `--color-warning` (+ `-text`, `-text-dk`, `-bg`) | Alert / callout variants |
| Neutrals            | `--bg-page`, `--bg-muted`, `--bg-card`, `--bg-code`, `--border-subtle`, `--border-strong` | Surfaces |
| Text                | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-dark` | Prose |
| Link                | `--link`, `--link-hover`                             | Inline links (prose only)                      |
| Hero                | `--hero-bg`, `--hero-bg-accent`, `--hero-text`, `--hero-text-muted` | Always-dark hero section |
| Type scale          | `--text-2xs` … `--text-4xl`, `--text-hero`          | Font sizes                                     |
| Tracking            | `--tracking-tighter` … `--tracking-widest`          | Letter spacing                                 |
| Fonts               | `--font-sans`, `--font-mono`                         | `font-family`                                  |
| Shape               | `--radius-sm/md/lg/xl`                               | Border radius                                  |
| Shadows             | `--shadow-sm/md/lg`                                  | Elevation                                      |

The same tokens resolve to different values in light and dark themes —
switching is just `:root[data-theme="dark"] { ... }` with overrides. Hero
tokens deliberately stay dark in both themes.

### When to add a new token

- Used in **more than one place**? → add a token.
- Used **once** but conceptually part of a system (e.g. a new semantic
  colour)? → add a token.
- **One-off decoration** (a single `rgba()` inside one rule)? → leave
  inline, with a comment explaining the magic number if non-obvious.

---

## 4. Breakpoints

Five unified stops, matching Bootstrap/Docsy conventions, defined in
`_breakpoints.scss`:

```scss
$bp-xs:  576px;   // phones
$bp-sm:  768px;   // phones landscape, small tablets
$bp-md:  992px;   // tablets, narrow desktops
$bp-lg:  1200px;  // desktops
$bp-xl:  1400px;  // wide desktops
```

For `max-width` queries, use the `-down` variants (Bootstrap's –0.02px trick
so `(max-width: $bp-md-down)` ends exactly where `(min-width: $bp-md)` begins):

```scss
@media (max-width: $bp-md-down) { /* phones + tablets */ }
@media (min-width: $bp-lg)      { /* desktops */ }
```

**Don't introduce a new magic-number breakpoint.** If you need something
between two existing stops, pick the closer stop and redesign around it.
Six breakpoints is already two more than most design systems carry.

---

## 5. Dark theme

Dark theme is driven by `[data-theme="dark"]` on `<html>`, set by the
pre-paint script in `head.html` (flash-free) and flipped by the button in
`navbar.html` wired via `static/js/theme.js`.

To make a new component work in both themes:

1. Reference tokens (`var(--bg-card)`, `var(--text-primary)`, …) — don't
   hardcode hex.
2. If the component has a Bootstrap ancestor that uses its own CSS custom
   properties (e.g. `.card` uses `--bs-card-bg`), override those Bootstrap
   variables as well — Bootstrap's cascade wins otherwise. See
   `_components.scss` section on `.card` / `.td-card` for the pattern.
3. If the component needs a different treatment in the dark theme (not just
   a token swap), add a scoped rule: `:root[data-theme="dark"] .my-thing { ... }`.
4. Code blocks and the hero are exceptions — they stay dark in both themes.
   Don't wire them to `--bg-page`.

### Theme toggle contract

Any button with `data-theme-toggle` becomes a toggle automatically. The
module is listening with a delegated `click` handler, so you can add
additional toggle buttons anywhere without wiring anything.

---

## 6. Adding a new SCSS rule

Decision tree:

- **Home-page section?** → `_home.scss`.
- **Bootstrap / Docsy component override** (`.alert`, `.td-table`,
  `.td-toc`, `.td-content ...`)? → `_docsy-docs.scss`.
- **Our own component** (navbar tweak, card, button variant, a new popover)
  → `_components.scss`.
- **Body-level typography** (default `<p>`, headings, inline code, running
  links) → `_typography.scss`.
- **New design token** → `_tokens.scss`.
- **New breakpoint stop** → you probably don't need one; if you're sure,
  `_breakpoints.scss`.

**Don't put rules in `_styles_project.scss`.** It's a stub kept to satisfy
Docsy's expectation that the file exists; rules there are easy to lose.

### Selector rules of thumb

- Prefer tokens over magic values — always.
- Use `:is(...)` to DRY up repeated selectors, but mind its specificity:
  `:is(.a, #b)` has specificity of `#b`, not `.a`.
- Avoid `!important`. If you think you need it, first try a more specific
  selector. Two places we accept it: (a) beating Chroma's inline
  `style="..."` on code blocks, (b) beating Bootstrap utility classes that
  ship with `!important` themselves (e.g. `.me-4`).
- Docsy rules are loaded **before** our `dex-custom.css`, so in a specificity
  tie, we win. If you're mysteriously losing a tie, first check the
  specificity of the Docsy selector — `#main_navbar li i` is `(1,0,2)`,
  not what you might guess.

---

## 7. Adding a new page

### Content page under `/docs/`

Standard Docsy flow — drop a `.md` file in `content/docs/...` with the
right front matter. It gets the default docs layout automatically. You
don't need to touch any SCSS.

### Landing page with a custom layout

1. Markdown: `content/<slug>.md` with `type: "simple"` (or a custom type)
   in front matter.
2. Layout: `layouts/<type>/single.html` or `layouts/_default/single.html`.
   Look at `layouts/index.html` for the home-page shape.
3. Styles: add a new partial if the page is complex, or append a scoped
   block to `_home.scss` / `_components.scss` depending on what fits.
4. Wrap sections in `<section class="band band--light|muted">` + `<div class="container">` if you want the alternating full-bleed rhythm. See
   `content/_index.md` for the pattern.
5. Include `{{ partial "scripts.html" . }}` before `</body>` if you're
   writing a custom layout — Docsy's offline search, theme toggle, and the
   anchor copy-link all live there. The home page forgets this at your peril
   (we hit this bug once).

---

## 8. Accessibility conventions

- **Decorative icons** (Font Awesome `<i>`, visual separators like `·`,
  badge dots) must have `aria-hidden="true"` so screen readers don't read
  them as garbage.
- **Mono section labels** (`§ 01 · capability`) wrap the decorative part in
  `<span aria-hidden="true">` leaving only the meaningful word exposed.
- **Icon-only buttons** need an `aria-label`. The theme toggle gets a
  dynamic one from `theme.js` (`"Switch to dark theme"` / `"Switch to light theme"`)
  and updates `aria-pressed`.
- **Logo-only links** use a `.visually-hidden` span (Bootstrap utility)
  with the link text, so the `<a>` has an accessible name without
  visually duplicating the wordmark.
- **Motion**: `anchors.js` respects `prefers-reduced-motion: reduce` and
  jumps instead of smooth-scrolling. Any new animation you add should do
  the same.
- **Contrast**: `--text-muted` on `--bg-muted` sits at ≈5.7:1. Don't drop
  below 4.5:1 for body text, even for "subtle" labels.

---

## 9. Docsy gotchas (read this before debugging)

- **`_variables_project.scss` vs. `_tokens.scss`** — two separate SCSS
  pipelines, see §2. Changing a Docsy SCSS variable (e.g. `$primary`) goes
  in the former; adding a CSS custom property goes in the latter.
- **`#main_navbar li i { padding-right: 0.5em }`** — Docsy's nav rule
  applies to any `<i>` inside a nav item. It was biting the theme-toggle
  icon. Already fixed in `_components.scss`, just know it's there.
- **`h{N}[id]::before { display: block; height: 5rem; margin-top: -5rem }`**
  — Docsy's legacy scroll-offset hack. Extends heading hit-box ~80px
  upward and steals clicks from paragraphs above. We kill it in
  `_docsy-docs.scss` and rely on `scroll-margin-top: 90px` instead. If
  Docsy changes the hack we'll need to refresh our override.
- **`.td-navbar-nav-scroll` on mobile** — Docsy sets `height: 2.5rem;
  overflow: hidden` and hides the horizontal scrollbar via
  `padding-bottom: 2rem`. That pushed our 36px theme-toggle off-centre; our
  override uses `scrollbar-width: none` + `::-webkit-scrollbar` instead, and
  the container is `display: flex; align-items: center` so items stay
  centred. Don't restore the padding hack.
- **Bootstrap 5 components with CSS custom properties** — `.card`,
  `.alert`, `.table`, `.popover` all expose `--bs-*-bg`, `--bs-*-color`
  etc. as the source of truth. Setting native `background-color` alone
  will lose to the Bootstrap cascade. Override the variables.
- **Chroma code blocks** — fenced code without a language tag renders as
  plain `<pre><code>`, with a language it renders as
  `<div class="highlight" style="background-color: ..."><pre>...`. The
  inline `style` beats external CSS unless you use `!important`. One of
  the few places we do.
- **Docsy `td-render-heading.html`** is a template, **not** a render hook.
  Our `layouts/_default/_markup/render-heading.html` is the actual render
  hook and Hugo picks ours up automatically.
- **`search-input.html` override** currently only implements the
  `offlineSearch` branch. If the project ever switches to Algolia or GCS
  search, copy the corresponding branch from `themes/docsy/layouts/partials/search-input.html`.
- **Disqus template overrides** (`layouts/docs/list.html`,
  `layouts/swagger/list.html`, `layouts/partials/disqus-comment.html`) —
  Docsy still references the removed `.Site.DisqusShortname`. Hugo 0.125+
  requires `.Site.Config.Services.Disqus.Shortname`. We keep patched copies
  at project level so the submodule stays pristine. Delete these overrides
  once Docsy upstream ships the fix.
- **`table:not(.td-initial)` selectors** — Docsy v0.11+ introduced
  `.td-initial` as an opt-out class for plain tables and scoped its base
  table rules with `table:not(.td-initial)`. That bumps their specificity
  from `(0,1,1)` to `(0,1,2)`. Our table overrides must carry the same
  `:not(.td-initial)` guard or they lose the cascade and fall back to
  white Bootstrap defaults. If you ever add new `.td-content table` rules,
  copy the pattern.
- **Docsy npm postinstall hook** — the `themes/docsy` `package.json`
  has `"postinstall": "npm run _mkdir:hugo-mod"` which creates
  `themes/github.com/FortAwesome/Font-Awesome/` and `.../twbs/bootstrap/`
  placeholder dirs. Hugo's `[module].replacements` in our `hugo.toml`
  then redirects the module imports to those local paths. If you wipe
  `themes/` or pull a fresh Docsy submodule, `make docsy` (or manual
  `cd themes/docsy && npm install`) must run or Hugo will try to fetch
  FortAwesome over the network and fail.

---

## 10. Build & dev

All commands go through the `Makefile` so dependency setup (Docsy submodule,
npm install) is wired in automatically. Don't call `hugo` directly — use
the targets:

```bash
make dependencies       # npm install dev deps
make docsy              # init/update themes/docsy submodule + its npm deps
make serve              # hugo server with --buildDrafts --buildFuture
                        # --disableFastRender (runs `make docsy` first)
make production-build   # hugo --minify, same flags Netlify uses
make preview-build      # hugo --minify with Netlify $DEPLOY_PRIME_URL baseURL
make check-links        # markdown-link-check across content/
make open               # opens the public Netlify preview in a browser
```

The Netlify deploy runs `make production-build` (see `netlify.toml`). There
is no Node build step on our side — Hugo handles SCSS compilation natively
via its own Dart Sass.

**Hugo + Docsy version pinning** — three places have to agree:

- `netlify.toml` — `HUGO_VERSION` (currently `0.134.2`).
- Your local Hugo — `hugo version`.
- `themes/docsy` submodule — currently pinned at **`v0.11.0`**.

Docsy `v0.11.0` is the last release whose `theme.toml` declares a
`min_version` compatible with Hugo 0.134. From `v0.12.0` onward Docsy
requires Hugo ≥ 0.146, so bumping Docsy beyond `v0.11.0` also requires
bumping Hugo locally and on Netlify. If you upgrade one piece, upgrade all
three in the same PR.

**First-time setup**: `make docsy` pulls the theme submodule and its deps.
Re-run it after a fresh clone or when the Docsy submodule pointer moves.

**Cache busting** — if you edit SCSS and don't see changes, hard-refresh
(`Cmd+Shift+R`). Hugo's dev server rebuilds, but browsers aggressively
cache the compiled CSS.

**Before shipping**: run `make check-links` — it walks every markdown file
under `content/` and flags broken external links.

**Never edit files under `themes/docsy/`**. That's a git submodule and any
local edits are lost on the next `make docsy`. If you need to change a
Docsy template, create a copy at the same path under project `layouts/`
(Hugo prefers project layouts over theme layouts). See §9 for the current
project-level overrides.

---

## 11. What not to do

- Don't introduce a new breakpoint. Six is already too many.
- Don't hardcode a hex colour in a partial. Use or add a token.
- Don't write `font-weight: 650`. Inter only has 400/500/600/700; 650 is
  silently rounded to 700 by the browser.
- Don't use `transition: all`. List the specific properties you're
  animating.
- Don't add inline `onclick`. Use `data-*` attributes and a delegated
  listener (see `theme.js`).
- Don't put layout markup in markdown. Raw `<div>` / `<section>` are
  sometimes unavoidable (the home page still has them) but every instance
  is a small debt. Prefer shortcodes.
- Don't hardcode Font Awesome classes in markdown if you can avoid it.
  Every `<i class="fab fa-github">` in content/ is a coupling to the
  icon library that will hurt if we ever switch.

---

## 12. Open debts (as of this file's last edit)

Things we know are off-spec but haven't fixed yet, roughly in priority
order:

- **`<section class="band">` in `content/_index.md`** — layout classes in
  content. Should become a shortcode.
- **Font Awesome icons in `content/_index.md`** — should become a shortcode
  `{{< icon "github" >}}` that emits the right markup.
- **Hero compositing** — 3 pseudo-elements + `backdrop-filter` on
  `.btn-hero-ghost` = 4 GPU layers on the hero. Low-end devices jank.
- **`history.pushState` in `anchors.js`** — updates URL hash without
  dispatching a `hashchange` event. If a third-party script relies on
  `hashchange` it won't fire.
- **Docsy heading-hack kill** — brittle. Forking the upstream
  `_main-container.scss` would be cleaner.
- **Empty `{{- /**/ -}}` Go template comments** in `navbar.html` (Docsy
  upstream artefact).
- **`navbar-dark`** legacy Bootstrap 4 class still on `.td-navbar`.

Pick one off the top of the list when you have a spare half hour.
