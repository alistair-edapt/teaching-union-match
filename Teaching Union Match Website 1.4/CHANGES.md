# Site update — change log

Drop these files into your repository, keeping the same folder structure
(they sit at the repo root, mirroring where they already live). Each one
**replaces** the existing file of the same name.

## Files in this package

| File | What changed |
|---|---|
| `src/quiz-engine.js` | Rewrote Q6 (strike participation) to 6 options; reworked the political-fund question (new "policy not party" option, de-branded subtitle); added option randomisation flags across 7 questions; legal wording on strike participation. |
| `src/Quiz.jsx` | Seeded per-session option shuffling (bottom-anchor + fixed-index variants); added analytics events: `quiz_complete_full`, `result_expand`, `result_link_click`, `copy_share_link`. |
| `src/data.js` | Fairness pass on organisation copy: neutral caseworker-vs-rep framing; removed NASUWT leadership line; reworded NEU "militant"; Edapt review/cost wording; Community strength. |
| `index.html` | Question count corrected to 13–14 (hero badge + FAQ schema); splash-screen tagline changed to "Find your fit". |
| `faq.html` | Question count corrected; added "Why does the order of answers change?" Q&A (visible + structured data). |
| `how-it-works.html` | Added a note on deliberate answer-order randomisation. |
| `about.html` | Added randomisation note to the fairness section. |
| `organisations/neu.html` | Synced NEU strengths/considerations to the revised, fairer wording. |
| `assets/brand/wtu-logo-horizontal.svg` | Tagline changed to "Find your fit". |

## Not included (update separately only if these live in your repo)

- `Teaching Union Match - Quiz (standalone).html` — the self-contained share file (regenerated).
- `quiz-export/` — the developer handoff package (re-synced).
- `GA4 Codebook.md` — reference doc for analytics; not part of the website.

_Generated June 2026._
