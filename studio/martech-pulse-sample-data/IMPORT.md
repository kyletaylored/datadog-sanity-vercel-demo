# MarTech Pulse Sample Data — Import Instructions

## What's in this dataset

| Type | Count | Description |
|---|---|---|
| `settings` | 1 | Updated site title ("MarTech Pulse"), description, and `announcementBanner` |
| `person` | 2 | Alex Chen, Jordan Rivera (new authors) |
| `post` | 10 | 2 Product · 3 Tutorial · 2 Case Study · 2 News · 1 Company |

All posts include the new fields added in Phase 3:
- `category` — one of: Product, Tutorial, Case Study, News, Company
- `readTime` — estimated read time in minutes
- `featuredOnHome` — boolean (3 posts are featured)

## Import Command

From the `studio/` directory:

```bash
cd studio
sanity dataset import ../martech-pulse-sample-data/data.ndjson production --replace
```

- Run from the `studio/` directory (where `sanity.config.ts` lives)
- `--replace` updates existing documents by `_id` (e.g. `siteSettings`). Use `--missing` instead to only insert new documents and leave existing ones untouched.
- Change `production` to your dataset name if different (check your `studio/.env`)
- Add `--allow-failing-assets` if the import warns about missing image references

## What Gets Updated vs Created

**Updated (same `_id`):**
- `siteSettings` — title changes to "MarTech Pulse", description updated, `announcementBanner` set

**Created (new `_id`s):**
- `f1a2b3c4-...` — person: Alex Chen
- `f2a3b4c5-...` — person: Jordan Rivera
- `aa1b2c3d-...` through `aaa0b1c2-...` — 10 new posts

**Not touched:**
- Existing posts (Sanity + Next.js template posts keep their IDs)
- Existing person (Sanity CMS robot)
- Pages, page builder content

## Verifying the Import

After importing, visit your Sanity Studio and check:
1. **Site Settings** → title should read "MarTech Pulse"
2. **Posts** → should show 13 total posts (3 original + 10 new)
3. New posts should all have Category, Read Time, and Featured on Home fields populated
