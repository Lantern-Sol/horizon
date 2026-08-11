# {{STORE_NAME}} — Your Store's SEO Guide

Prepared by Lantern Sol · {{DATE}}

Welcome! Your store at **{{PRIMARY_DOMAIN}}** runs on **LS Horizon**, Lantern
Sol's edition of Shopify's Horizon theme with a built-in SEO baseline. This
guide covers what's already working for you automatically and the few things
you manage day to day.

## What your theme already does for you

These run automatically on every page — no action needed:

- **Search-engine-ready metadata**: every page gets a proper title, meta
  description (falling back to your store description), canonical URL, and
  rich social sharing previews (Open Graph + X/Twitter cards).
- **Structured data**: Google receives Organization, WebSite (with a search
  box), Breadcrumb, and Product data (including review star ratings once your
  review app is active) — this is what makes your products eligible for rich
  results like stars and prices directly in search listings.
- **Smart indexing**: filtered collection views and internal search pages are
  kept out of Google's index so your real pages don't compete with duplicates.
- **Breadcrumb navigation** on product, collection, blog, and page templates.

## Things you control

### Page titles & descriptions

Edit each product/collection/page's **Search engine listing** in Shopify admin
(bottom of the edit screen → *Edit website SEO*). The theme uses exactly what
you write there. Pages without a description automatically fall back to your
store description (**Settings → General**), so keep that one strong.

### Social sharing image

**Theme settings → SEO → Default social sharing image** — shown when a page has
no image of its own. Recommended: 1200×630px.

### Your social profiles

**Theme settings → SEO → Social profiles** — add your Facebook, Instagram,
TikTok, etc. URLs once; they feed both your site's social link icons and the
structured data Google uses to connect your brand profiles.

### FAQs per collection {{FAQ_SECTION_NOTE}}

Your store has a reusable **Question - Answer** system:

1. **Create questions**: Admin → **Content → Metaobjects → Question - Answer →
   Add entry**. Write the question and answer once — entries are reusable
   anywhere.
2. **Assign to a collection**: open the collection (Admin → Products →
   Collections), scroll to **Metafields → FAQs**, and pick the entries for that
   collection.
3. That's it — the collection page shows its FAQ accordion automatically, and
   the answers are also sent to Google as FAQ structured data.

The same questions can be assigned to as many collections as you like, and
each collection shows only its own list.

### Hiding a page from Google

Ask us (or your developer) to set the **seo.hidden** metafield on any product,
collection, or page — Shopify then removes it from Google and the sitemap.

## Your theme code

Your theme lives at **{{REPO_URL}}** and is connected to your store through
GitHub. Lantern Sol maintains it — updates and improvements arrive as reviewed
changes, never as blind overwrites. Please don't edit theme code directly in
the Shopify code editor; tell us what you need instead so changes stay safe
and reversible.

## What was set up for you

{{SETUP_SUMMARY}}

## Questions?

Contact Lantern Sol — {{CONTACT}} — and we'll take care of it.
