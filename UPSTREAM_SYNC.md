# Syncing with upstream Shopify/horizon

This fork tracks [Shopify/horizon](https://github.com/Shopify/horizon) and layers
Lantern Sol customizations on top. Because this repo is a *real* GitHub fork of
Horizon (not a copy), upstream updates merge cleanly via standard git.

## Remote layout

| Remote     | URL                                         | Role                                 |
| ---------- | ------------------------------------------- | ------------------------------------ |
| `origin`   | `dev-lanternsol/horizon`                    | Our fork — push here                 |
| `upstream` | `Shopify/horizon`                           | Shopify's official theme — read-only |

First-time setup on a new clone:

```bash
git clone https://github.com/dev-lanternsol/horizon.git
cd horizon
git remote add upstream https://github.com/Shopify/horizon.git
git fetch upstream
```

## Updating to a new Horizon release

When Shopify ships a new Horizon version (e.g. v3.5.0):

```bash
# 1. Pull the latest upstream
git fetch upstream

# 2. Create a sync branch from main
git checkout main
git pull origin main
git checkout -b sync/horizon-v<version>

# 3. Merge upstream
git merge upstream/main

# 4. Resolve any conflicts
#    - Customizations in shared files may collide with upstream changes
#    - See CUSTOMIZATIONS.md below for what's expected to be ours
#    - Prefer LS customizations, but adopt upstream refactors when the
#      surrounding code has moved on

# 5. Commit and push
git push -u origin sync/horizon-v<version>

# 6. Open a PR against main and merge after review/QA
```

Alternative using GitHub's "Sync fork" button: for upstream releases that don't
touch any files we customize, the GitHub web UI can auto-merge. For anything
else, use the CLI flow above so you get the chance to review conflicts.

## Customizations overview

Files added or modified by Lantern Sol relative to stock Horizon. When a new
upstream release changes any of these, expect a conflict to resolve.

### Added files (LS-owned, won't conflict)

**Sections**
- `sections/animated-slideshow.liquid`
- `sections/circular-arc.liquid`
- `sections/scroll-image-sequence.liquid`

**Blocks**
- `blocks/_arc-feature.liquid`
- `blocks/ai_gen_block_9b1a4f7.liquid`
- `blocks/article-card.liquid`, `article-icon.liquid`, `article-image.liquid`, `article-text.liquid`
- `blocks/hovering-text.liquid`
- `blocks/slideshow.liquid`

**Snippets**
- `snippets/dialog-popup-page.liquid`
- `snippets/spacing-marging.liquid`
- `snippets/ls-meta-tags.liquid` — SEO successor to upstream `meta-tags.liquid`.
  **After every upstream merge**, run
  `git diff <prev-sync>..upstream/main -- snippets/meta-tags.liquid` and port
  relevant changes into `ls-meta-tags.liquid` (the upstream file itself merges
  cleanly but is no longer rendered).
- `snippets/ls-seo.liquid` — SEO orchestrator (robots meta + schema dispatch)
- `snippets/ls-schema-organization.liquid`
- `snippets/ls-schema-website.liquid`
- `snippets/ls-schema-breadcrumbs.liquid` — trail logic mirrored with `sections/breadcrumbs.liquid`; keep in sync
- `snippets/ls-product-schema.liquid`
- `snippets/ls-schema-faq.liquid` — parses `<summary>` / `.details-content` markers from `blocks/_accordion-row.liquid`; those markers are load-bearing

**Templates**
- `templates/robots.txt.liquid` — Shopify-defaults passthrough with a per-store extension point

**Assets**
- `assets/component-parallax.js`
- `assets/icon-slider-arrow.svg`

**Templates**
- `templates/page.about-us.json`

### Shared-file customizations (will conflict on upstream refactor)

| File                                    | LS change                                            |
| --------------------------------------- | ---------------------------------------------------- |
| `config/settings_schema.json`           | Branded as "Horizon: LS Mod"; "SEO" settings group   |
| `assets/base.css`                       | Responsive mobile font-size for primary button       |
| `sections/hero.liquid`                  | `parallax` + `hidden--mobile` modifier classes       |
| `snippets/text.liquid`                  | `mobile_text` support + ® superscript replacement    |
| `snippets/slideshow.liquid`             | Expanded timeline scope, slides-to-scroll, auto-hide |
| `snippets/slideshow-controls.liquid`    | Expanded pagination/scroll-mode/arrow options        |
| `snippets/theme-styles-variables.liquid`| Expanded font-weight variants (thin/extra-light/etc) |
| `blocks/_product-card-gallery.liquid`   | `has_applied_colour_filter` logic                    |
| `templates/product.json`                | LS-specific block layout; breadcrumbs section        |
| `layout/theme.liquid`                   | Renders `ls-meta-tags` + `ls-seo` instead of `meta-tags` |
| `layout/password.liquid`                | Renders `ls-meta-tags` instead of `meta-tags`        |
| `sections/header.liquid`                | Hardcoded Organization JSON-LD **deleted** (moved to `ls-schema-organization`) — if an upstream merge re-adds it, delete it again; homepage hidden `<h1>` gated on `settings.seo_homepage_hidden_h1` |
| `sections/product-information.liquid`   | `structured_data` script replaced by `{% render 'ls-product-schema' %}` |
| `sections/featured-product.liquid`      | Same `ls-product-schema` swap                        |
| `sections/featured-product-information.liquid` | Same `ls-product-schema` swap                 |
| `sections/search-header.liquid`         | Heading tag `<h3>` → `<h1>` (search page had no h1)  |
| `blocks/accordion.liquid`               | Captures rows for opt-in FAQ JSON-LD (`enable_faq_schema`) |
| `blocks/social-links.liquid`            | Falls back to global `settings.social_*_link` (SEO group) |
| `templates/*.json` (product, collection, article, blog, page, search) | `breadcrumbs` section wired first in order |
| `locales/*.json` + `locales/*.schema.json` | LS SEO keys added to all locales (English values pending translation) |

## How this fork came to be

The previous Lantern Sol theme repo was `Lantern-Sol/ls-horizon`, seeded as a
copy of Horizon v3.0.0 (no shared git history with Shopify/horizon). It never
received upstream updates — the "Update from Shopify" bot commits in that repo
are Shopify admin theme-editor autosaves, not Horizon releases.

On 2026-04-20 the repo was retired in favor of this fresh fork at
`dev-lanternsol/horizon`, and customizations were ported forward via a 3-way
merge using Horizon v3.0.0 as the merge base. Formatting noise (leading blank
lines from an earlier auto-formatter pass) was stripped during the port to
minimize drift.

## Why not just copy-fork again next time?

A real GitHub fork lets us:
- Merge upstream Horizon releases with `git merge` (no manual file copying)
- See "N commits behind" indicators in the GitHub UI
- Use the "Sync fork" button for clean releases
- Let Shopify's `shopify[bot]` theme-editor integration push admin changes back

Copy-forks fight every one of these.
