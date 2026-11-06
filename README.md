# Holographic Books

Engineering standards as interactive 3D books (three.js). One repo, one site, many books, one shared engine.

```
npm install
npm run dev        # http://localhost:5173/ → library;  /irc-2-1968/ → a book
npm run build      # static site in dist/ (all books)
```

## Layout

```
engine/                 shared runtime: run.js (runBook: stage, pages, navigation, input, tours, quality, loop),
                        book, page, holo, guide, anim, ui, sound, stage, util, book.css
books/index.html        the library page (one card per book)
books/<slug>/           one book: index.html (enter screen), main.js, content/lessons.js, spreads/, anything else it needs
books/_template/        a minimal working book to copy
public/<slug>/          static files for that book (e.g. public/irc-2-1968/models/surveyor.glb)
```

Every `books/<slug>/index.html` is built automatically and served at `/<slug>/`. Inside a book, import the engine as
`@engine/...` (e.g. `import { makeGuide } from '@engine/guide.js'`).

## Adding a book

1. Copy `books/_template` to `books/<slug>` (e.g. `books/irc-67-2022`).
2. Edit `content/lessons.js` (titles, cover text, one `LESSONS` entry per spread) and the enter screen in `index.html`.
3. Write the spreads in `spreads/` and list them in `spreads/index.js`, in the same order as `LESSONS`.
4. Add a card for it in `books/index.html`.
5. `npm run build`, then push to `main`. It goes live at `https://aiteamict.github.io/Holographic-Books/<slug>/`.

Book-specific helpers (like the Route Marker's `sign/`, `props.js`, `hero.js`) live in that book's folder. Pass them to
spreads through `runBook({ ctx: { ... } })`, or import them directly. When two books need the same helper, move it into `engine/`.

**Changing the engine changes every book.** Run `npm run build` and open each book before you push.

## Books

| Book | Folder | Notes |
|---|---|---|
| The Route Marker · IRC : 2-1968 | `books/irc-2-1968` | see its README |
| The Design Vehicle · IRC : 3-1983 | `books/irc-3-1983` | spread 6 live; spreads 1–5 and 7 have page text, holograms next |

## Deploying

`.github/workflows/pages.yml` builds and deploys `dist/` on every push to `main` (Pages source: GitHub Actions).
Query flags work on every book: `?tier=high|medium|low`, `?fx=glass`.
