---
description: 'Use when updating pricing tables in docs/pricing.md or README.md. Enforces sort order by cost per intelligence ascending.'
applyTo: 'docs/pricing.md,README.md'
---

# Pricing Table Sort Order

When updating the pricing tables in `docs/pricing.md` or `README.md`, sort rows by **Cost per intelligence** ascending (lowest first). The "Cost per intelligence" column shows the estimated session cost divided by the Intelligence Index score — a lower value means better value per unit of intelligence.

## Sort rules

1. **Primary sort key:** `Cost per intelligence` column — ascending (smallest → largest).
2. **Secondary sort (tiebreaker):** When two models have the same (or missing/null) Cost per intelligence, sort by **Estimated session cost** ascending.
3. **Models without Cost per intelligence** (cell shows `—`): place after all models that have a numeric value, sorted by estimated session cost ascending among themselves.

## What to watch for

- Every time a model is added, removed, or has its pricing changed, re-sort the entire table.
- The sort applies to **both** `docs/pricing.md` (full table with all columns) and `README.md` (snapshot table).
- Footnotes (superscript numbers like `¹`, `²`) should stay attached to their model name during reordering.
- The `docs/pricing.md` table has 7 columns; the `README.md` table has 6 columns. The sort key (`Cost per intelligence`) exists in both tables.

## Example

If adding a new model with `Cost per intelligence = ~$0.015` and `Intelligence Score = 45`:

- It would go between `MiniMax M3 Priority` (~$0.0092) and `Kimi K2.6` (~$0.021).
- The correct column values must be filled in consistently across both files.
