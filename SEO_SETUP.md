# SEO Baseline — LS Horizon

LS Horizon ships an SEO baseline out of the box, implementing the Lantern Sol SEO
Development Standards at the theme level. Everything is driven by theme settings
(**Theme settings → SEO**) — nothing is hardcoded, and every feature can be turned
off individually.

## What ships enabled by default

| Feature | Where | Default |
| --- | --- | --- |
| Localized `<title>` suffixes, meta description fallback | `snippets/ls-meta-tags.liquid` | On |
| Canonical URL (+ per-resource metafield override) | `snippets/ls-meta-tags.liquid` | On |
| Open Graph (image fallback chain, `og:locale`, `og:image:alt`) + Twitter cards | `snippets/ls-meta-tags.liquid` | On |
| `noindex` on search results & filtered collection pages | `snippets/ls-seo.liquid` | On |
| `noindex` on tag-filtered pages | `snippets/ls-seo.liquid` | Off |
| Organization / OnlineStore / LocalBusiness structured data | `snippets/ls-schema-organization.liquid` | On (OnlineStore) |
| WebSite + SearchAction structured data (home page) | `snippets/ls-schema-website.liquid` | On |
| BreadcrumbList structured data (all templates) | `snippets/ls-schema-breadcrumbs.liquid` | On |
| Visual breadcrumbs section | `sections/breadcrumbs.liquid` | On (key templates) |
| Extended Product structured data (ratings, availability, brand) | `snippets/ls-product-schema.liquid` | On (`extended`) |
| FAQ structured data on accordions | `blocks/accordion.liquid` + `snippets/ls-schema-faq.liquid` | Off (opt-in per accordion) |
| robots.txt passthrough template | `templates/robots.txt.liquid` | On (Shopify defaults) |

## Settings reference (Theme settings → SEO)

**Metadata**

| Setting | Default | Effect |
| --- | --- | --- |
| Fall back to store description | On | When a page has no meta description, uses the store description instead of omitting the tag |
| Default social sharing image | — | `og:image`/`twitter:image` fallback when the page has no image (final fallback: theme logo) |
| X (Twitter) username | — | `twitter:site` attribution; falls back to parsing the X profile URL below |

**Search engine indexing**

| Setting | Default | Effect |
| --- | --- | --- |
| Hide search results page from search engines | On | `noindex, follow` on `/search` |
| Hide filtered collection pages from search engines | On | `noindex, follow` on collection pages with active filters |
| Hide tag pages from search engines | Off | `noindex, follow` on tag-filtered collection/blog pages |

**Structured data**

| Setting | Default | Effect |
| --- | --- | --- |
| Organization structured data | On | Organization node on every page (`#organization`) |
| Organization type | Online store | `OnlineStore` / `Organization` / `LocalBusiness` — LocalBusiness reveals address, phone, and hours fields |
| Organization name | — | Overrides the store name in structured data |
| Website structured data | On | `WebSite` + `SearchAction` on the home page (sitelinks search box) |
| Breadcrumb structured data | On | `BreadcrumbList` in the head of every non-home page, independent of the visual section |
| Product breadcrumb source | Auto | Middle crumb for products: auto (category → type → collection), or forced |
| Product structured data | Extended | See "Product structured data modes" below |
| Hidden store-name heading on home page | On | Keeps the visually-hidden `<h1>` in the header on the home page; turn off if the home page hero contains a real `<h1>` |

**Social profiles** — Facebook, Instagram, YouTube, TikTok, X (Twitter),
LinkedIn, Pinterest URLs plus an "Additional profile URLs" textarea (one URL
per line). Used for `sameAs` in Organization structured data, and as global
defaults for every Social links block (block-level URLs override them).

## Per-page SEO controls in the editor

- **Breadcrumbs**: the visual breadcrumbs section ships on the product,
  collection, article, blog, page, and search templates. Hide or restyle it per
  template in the editor — the head JSON-LD stays either way.
- **FAQ**: on any Accordion block, enable "Enable FAQ structured data" to emit
  `FAQPage` JSON-LD built from its rows. Enable it on **one** accordion per page.

## Metafield conventions

The theme reads these metafields defensively — nothing breaks if they don't exist.
Themes cannot create metafield definitions; add them under
**Settings → Custom data** in the Shopify admin when a store needs them.

| Metafield | Type | Resources | Used for |
| --- | --- | --- | --- |
| `seo.hidden` (native Shopify) | integer (`1`) | product, collection, page, article, blog | Shopify itself emits `noindex` and removes the resource from the sitemap. The theme does not duplicate this. |
| `custom.seo_canonical_url` | single line text (URL) | product, collection, page, article | Overrides the canonical URL emitted by `ls-meta-tags.liquid`. |
| `reviews.rating` / `reviews.rating_count` | rating / integer | product | Written by most review apps (Judge.me, Loox, …). Feeds `AggregateRating` in extended Product structured data. |

## Product structured data modes

**Theme settings → SEO → Product structured data:**

- **Extended (with review ratings)** — default. The theme outputs a complete
  `Product` JSON-LD node including `AggregateRating` (from the `reviews.*`
  metafields), offer availability, and brand.
- **Shopify default** — Shopify's built-in `structured_data` output (no ratings).
- **Off (provided by an app)** — the theme outputs nothing. Choose this when a
  review/SEO app injects its own Product JSON-LD, to avoid duplicate Product
  entities failing validation.

Never run two sources of Product JSON-LD at once.

## Future enhancements (documented, not implemented)

- **Multi-location LocalBusiness metaobject** — for clients with several physical
  locations, a `local_business_location` metaobject (address, phone, hours, geo)
  can replace the single-location theme settings. `ls-schema-organization.liquid`
  is the place to branch.
