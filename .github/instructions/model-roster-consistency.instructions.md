---
description: 'Use when adding, removing, renaming, or updating models in docs/pricing.md, docs/benchmarks.md, or README.md. Enforces that every model is listed consistently across all three files.'
applyTo: 'docs/pricing.md,README.md,docs/benchmarks.md'
---

# Model Roster Consistency (pricing / benchmarks / README)

These three files form a single model roster:

- `docs/pricing.md` — full pricing table (all columns, footnotes, notes)
- `docs/benchmarks.md` — benchmark score table (AA Intelligence Index + Arena ranks)
- `README.md` — pricing snapshot (condensed columns)

When a model is added, removed, renamed, re-priced, or re-scored, update **all three files in the same change**. Partial updates (e.g., only benchmarks) are bugs.

## Rules

1. **Same model set.** Every model listed in one file must appear in the other two. If a model is intentionally excluded from a file (e.g., a comparison-only model like Grok 4.6 or Claude Fable 5 that has no pricing row), apply that decision consistently and note it in each file — don't silently drop it from just one.
2. **Same model name.** Use the identical display name in all three tables (e.g., `Claude Fable 5`, `Qwen 3.6 Plus`, `DeepSeek V4 Flash 0731`). Don't abbreviate in one file and spell out in another.
3. **Same facts.** Intelligence Score (AA Intelligence Index), Est. session cost, Cost per intelligence, input/cached/output pricing, context window, and vision capability must match across files. The AA score is a single source of truth — the same number everywhere.
4. **Status notes travel together.** If a model is deprecated, superseded, or comparison-only, say so consistently in all three files. Footnote _numbers_ are per-file and independent, but the underlying note must exist wherever the model is listed.
5. **Re-sort after every change.**
   - `docs/pricing.md` and `README.md`: sort by **Cost per intelligence ascending** — see `pricing-sort.instructions.md`.
   - `docs/benchmarks.md`: sort by **AA Intelligence Index descending** (highest first).
6. **Footnotes stay attached.** Superscripts (¹, ², …) belong to their model name during reordering. When adding a row with a new footnote, assign the next free number in _that file only_ (each file's footnote numbering is independent).
7. **Link, don't duplicate.** Point to the canonical model doc under `docs/models/<provider>-<model>.md` rather than copying large detail blocks into multiple files.

## Checklist before finishing

- [ ] Model appears in **pricing, benchmarks, AND README** — or is intentionally excluded everywhere with a documented reason
- [ ] Model name, AA score, pricing, session cost, context, and vision match across all three files
- [ ] Sort orders re-applied: CPI ascending in `docs/pricing.md` + `README.md`, AA score descending in `docs/benchmarks.md`
- [ ] `Updated:` date bumped in `docs/pricing.md` and `docs/benchmarks.md` (README has no date header)
- [ ] Footnotes renumbered where needed and still attached to the correct rows
