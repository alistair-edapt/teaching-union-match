# Which Teaching Union — Quiz (standalone export)

A self-contained export of the comparison quiz, extracted from the main WTU site so the question flow can be iterated on in isolation before being re-embedded.

## Run it

Open `quiz.html` directly in a browser. No build step — React + Babel are loaded from unpkg and compile `Quiz.jsx` in-browser.

(If you hit CORS issues opening the file with `file://`, serve the folder over a quick local server: `python3 -m http.server` inside `quiz-export/` then visit `http://localhost:8000/quiz.html`.)

## What's here

```
quiz-export/
├── quiz.html              ← entry point (slim standalone chrome)
├── src/
│   ├── Quiz.jsx           ← the React quiz component (stages, question flow, results UI)
│   ├── quiz-engine.js     ← pure scoring logic: answers → ranked list of orgs
│   ├── data.js            ← questions, answer options, organisations + their trait weights
│   ├── analytics.js       ← no-op stub (the main site replaces this with the real one)
│   └── styles.css         ← full WTU site stylesheet (quiz + all tokens)
└── assets/brand/
    └── wtu-mark.png       ← WTU icon for the header
```

## Where to edit what

| You want to change... | Edit this file |
|---|---|
| The list of questions, order, answer options | `src/data.js` → `QUESTIONS` |
| How a question maps to trait scores | `src/data.js` → each question's `traits` field |
| The organisations being compared + their profiles | `src/data.js` → `ORGS` |
| Scoring / tie-break rules | `src/quiz-engine.js` |
| The quiz UI (layout, stage transitions, results card) | `src/Quiz.jsx` |
| Visual styling (colours, type) | `src/styles.css` (tokens at the top) |

`data.js` is almost certainly where you want to start — it's the structured content of the quiz and has no UI logic.

## Bringing changes back into the main site

When you're ready to re-integrate, the three files to copy back are:

- `src/Quiz.jsx`
- `src/quiz-engine.js`
- `src/data.js`

(Everything else — `analytics.js`, `styles.css`, `quiz.html`, the brand asset — already exists in the main site and shouldn't be overwritten.)

Paste the export URL into the main project's chat and say "merge these quiz changes back in" and I'll diff + apply them.
