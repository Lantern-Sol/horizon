---
name: onboard-client-store
description: Onboard a client Shopify store onto LS Horizon and its SEO baseline. Use this whenever the user gives a store URL or handle (admin.shopify.com/store/<handle>, <handle>.myshopify.com, or a bare handle) and wants to set up, onboard, connect, launch, or prepare a client store — including "verify this store", "check/create the SEO metafields or metaobjects", "set up FAQs for this store", "fork the theme for <client>", or "make the client guide". Even a short prompt like "onboard acme-supplies" or "get this store ready for Horizon" should use this skill. It verifies the store via Shopify CLI, audits and creates the SEO metaobject/metafield definitions, forks the theme repo for the client, and generates a personalized client-facing guide.
---

# Onboard a client store onto LS Horizon

You are onboarding a client Shopify store onto the LS Horizon theme and its SEO
baseline (see `SEO_SETUP.md` at the repo root — it is the source of truth for
what the theme expects from a store). The outcome of a full onboarding is:

1. Verified access to the store, with a status summary
2. All SEO metaobject/metafield definitions present (created if missing)
3. A client-named fork of this repo, ready to connect via Shopify's GitHub integration
4. A personalized client guide delivered as a document (never committed to the repo)

The user may ask for only part of this (e.g. just the audit). Do what they asked;
offer the remaining steps at the end. Ask before anything that mutates the store
or creates a repo — definitions and repos are org-visible, and clients see them.

## Step 1 — Normalize the store handle

Accept any of these forms and reduce to `<handle>.myshopify.com`:

- `https://admin.shopify.com/store/acme-supplies` → `acme-supplies.myshopify.com`
- `acme-supplies.myshopify.com` (possibly with https:// or a path) → unchanged
- `acme-supplies` → `acme-supplies.myshopify.com`

A custom domain (e.g. `acmesupplies.com`) does not identify the myshopify handle —
ask the user for the admin URL or handle rather than guessing.

## Step 2 — Authenticate the Shopify CLI against the store

```bash
shopify store auth --store <handle>.myshopify.com --scopes read_themes,read_metaobject_definitions,write_metaobject_definitions,read_metaobjects,write_metaobjects,read_products,write_products,read_online_store_pages,write_online_store_pages,read_content,write_content
```

This opens the browser for a one-time app authorization using the user's
existing Shopify session. If the session is headless or the browser can't open,
show the user the command to run themselves and continue once they confirm.
`write_*` scopes are requested up front so the create step doesn't need a
second auth round-trip; the audit itself only reads. The scope list is exact:
product/collection metafield definitions ride on `write_products`, but PAGE
needs `write_online_store_pages` and ARTICLE needs `write_content` — without
them those two definitions fail with a generic namespace-access error.

## Step 3 — Audit the store (read-only)

All `--query-file` paths below use `<skill-dir>`, meaning this skill's base
directory (shown at the top of this skill when it loads) — the skill may be
installed in the repo (`.claude/skills/onboard-client-store`) or at user level
(`~/.claude/skills/onboard-client-store`); the bundled files travel with it.

```bash
shopify store execute -s <handle>.myshopify.com --query-file "<skill-dir>/graphql/audit.graphql" -j
shopify store execute -s <handle>.myshopify.com --query-file "<skill-dir>/graphql/audit-theme.graphql" -j
```

The theme check is a separate query on purpose: the CLI treats any GraphQL
error as fatal for the whole operation, so a token missing `read_themes` would
otherwise sink the entire audit. If the theme query fails on scope, note the
live theme as "unknown (no read_themes)" and keep going — it's informational.

The queries return shop identity (name, plan, primary domain), the live theme,
and every definition the SEO baseline can use. Summarize as a checklist:

| Item | Expected | Why it matters |
| --- | --- | --- |
| Live theme | Note name/id | Tells you whether LS Horizon is already connected |
| Metaobject `question_answer` | question (single line, required) + answer (rich text), storefront access `PUBLIC_READ` | Powers dynamic FAQs; without storefront access Liquid cannot read entries |
| Collection metafield `custom.faqs` | `list.metaobject_reference` → question_answer | Per-collection FAQs through one template |
| Product metafield `custom.faqs` | same (optional) | Per-product FAQs, same mechanism |
| Metafield `custom.seo_canonical_url` on product / collection / page / article | `single_line_text_field` | Canonical override read by `snippets/ls-meta-tags.liquid` |
| Product metafields `reviews.rating` / `reviews.rating_count` | Written by review apps | Feeds AggregateRating in extended product schema — if absent, note which review app the store uses (informational only, do not create) |

If a definition exists but differs from expected (wrong type, missing
storefront access), report the difference instead of trying to modify it —
changing existing definitions on a client store is a decision for a human.

## Step 4 — Create missing definitions (confirm with the user first)

List exactly what will be created and get a yes before running mutations.

**Metaobject definition** (fixed shape, no variables):

```bash
shopify store execute -s <handle>.myshopify.com --query-file "<skill-dir>/graphql/create-metaobject-definition.graphql" --allow-mutations -j
```

Capture the returned `MetaobjectDefinition` gid — the FAQs metafield
definitions validate against it.

**Metafield definitions** all use the same generic mutation
(`<skill-dir>/graphql/create-metafield-definition.graphql`) with a per-definition variable
file you write at runtime. Collection FAQs example:

```json
{
  "definition": {
    "name": "FAQs",
    "namespace": "custom",
    "key": "faqs",
    "type": "list.metaobject_reference",
    "ownerType": "COLLECTION",
    "validations": [{ "name": "metaobject_definition_id", "value": "<metaobject definition gid>" }]
  }
}
```

Canonical override example (repeat for PRODUCT, COLLECTION, PAGE, ARTICLE):

```json
{
  "definition": {
    "name": "SEO canonical URL",
    "namespace": "custom",
    "key": "seo_canonical_url",
    "type": "single_line_text_field",
    "ownerType": "PRODUCT"
  }
}
```

```bash
shopify store execute -s <handle>.myshopify.com --query-file "<skill-dir>/graphql/create-metafield-definition.graphql" --variable-file <vars.json> --allow-mutations -j
```

Check `userErrors` on every response; "key is in use" means it already exists —
re-audit rather than assuming shape.

Sample `question_answer` entries are useful on development/playground stores so
the merchant sees working FAQs immediately — offer them, but never seed sample
content on a live client store unless asked. Entry creation uses
`<skill-dir>/graphql/create-metaobject-entry.graphql` with a variable file; rich-text answer
values are the JSON document format:
`{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"..."}]}]}`.

## Step 5 — Fork the repo for the client

The client repo must keep this repo's git history so upstream Horizon merges
keep working (see `UPSTREAM_SYNC.md`). Confirm the repo name with the user
(convention: `<client-handle>-horizon`), then:

```bash
gh repo fork Lantern-Sol/horizon --org Lantern-Sol --fork-name <client>-horizon --clone=false
```

GitHub sometimes refuses same-org forks. Fall back to create-and-push, which
preserves history equally well:

```bash
gh repo create Lantern-Sol/<client>-horizon --private
git push https://github.com/Lantern-Sol/<client>-horizon.git main:main
```

Then add the upstream remotes note: the new repo should get `upstream` →
`Shopify/horizon` and a `ls` remote → `Lantern-Sol/horizon` on first clone
(document this in the handoff message, don't clone here unless asked).

**Connecting the store** is a manual admin step (Shopify's GitHub app needs the
user's browser): in the store admin go to **Online Store → Themes → Add theme →
Connect from GitHub**, pick `Lantern-Sol/<client>-horizon`, branch `main`.
Give the user these exact steps — you cannot do this part for them.

## Step 6 — Generate the personalized client guide

Build the guide from `<skill-dir>/assets/client-guide-template.md`. Replace every
`{{PLACEHOLDER}}` with real values from the audit (store name, domains, repo,
what was created, date). Drop sections that don't apply (e.g. the FAQs section
if the user chose not to create the FAQ definitions) — a guide that describes
things the store doesn't have erodes the client's trust in the rest of it.

Render to a polished document — use the docx skill if available (preferred for
client handoffs, they can edit it), otherwise build a PDF. Write the file to a
scratch/temp location and deliver it with the file-delivery tool. Never commit
client guides or client names into this repo.

## Step 7 — Report

End with a summary the user can forward: store verified (name, plan, live
theme), definitions created vs already present, repo URL, the store-connection
steps, and the attached guide. Flag anything skipped or needing a human
(definition mismatches, auth problems, GitHub refusals).

## Gotchas learned the hard way

- Dynamic-source references hand-written into template JSON must end in
  `.value` (`{{ closest.collection.metafields.custom.faqs.value }}`) or the
  template upload is rejected. The editor's dynamic-source picker adds it.
- `shopify store execute` auth (`store auth`) is separate from theme-CLI auth —
  a working `shopify theme dev` does not imply store-execute access.
- Storefront access on the metaobject definition is required for Liquid to read
  entries; without it the FAQs silently render nothing.
- If a Shopify MCP store connector is available in the session, verify which
  store it points at (`get-shop-info`) before using it — it is often connected
  to a different client's store. The CLI targets stores explicitly with `-s`,
  which is why this skill prefers it.
