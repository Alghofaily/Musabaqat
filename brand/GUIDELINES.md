# مسابقات — Logo Guidelines

## 1. The logo
- **Idea:** three calligraphy dots, the cluster written over ث and ش. There is one dot per game, in that game's colour:
  - green for سوق المعرفة
  - yellow for ورقة الحظ
  - blue for حصون المعرفة
- **Versions:** horizontal lockup (primary) · stacked lockup · symbol only · wordmark only · tile icon.
- **Reading order:** the lockup reads right to left. The symbol stands on the right and the name follows to its left.
- **Colour schemes** (`masters/*-<scheme>.svg`):

| Scheme | Use on | Dots | Name |
|---|---|---|---|
| `dark` (primary, share card) | ink #0b1220 or other dark backgrounds | #16c784 · #f6c343 · #4f7fd8 | paper #f7f3ea |
| `light` | white or paper backgrounds | #0b8a5a · #b97f06 · #2c56a8 | ink #0b1220 |
| `ink` / `paper` | one-colour uses | all ink / all paper | same |

- **Files:**
  - `social-card.png`: the 1280 × 640 link-preview image. Its source is `card/social-card.html`.
  - `share-tags.html`: the `<head>` tags for the Pages site.
  - `web/`: favicon, web icons and `site.webmanifest`.
  - `symbol/` and `lockups/`: one-colour versions, as SVG and PNG.
  - `board.html` and `slides/`: the presentation.

## 2. Clear space
The unit is **x = half a dot's diagonal**, which is 51 units on the 256 symbol.
- Keep **1x** clear on every side.
- Inside a lockup, the gap between the symbol and the name is fixed at 40 units. Don't change it.

## 3. Minimum size
| Version | Screen | Print |
|---|---|---|
| Horizontal lockup | 40 px tall | 10 mm tall |
| Stacked lockup | 80 px tall | 18 mm tall |
| Symbol | 24 px | 6 mm |
| Small cut or tile (`symbol-small-*`, `symbol-tile.svg`) | 16–23 px | 4–6 mm |

## 4. Colour and contrast (WCAG; graphics need at least 3 : 1)
- **On ink:** green 8.5 · yellow 11.4 · blue 4.8 · paper name 16.9.
- **On white:** deep green 4.4 · gold 3.4 · deep blue 7.0 · ink name 18.7.
- **Never use the bright `dark` dots on white.** The yellow scores only 1.6 there and the green 2.2, so light backgrounds use the `light` scheme.

The dot order is fixed: green on top, yellow below right, blue below left.

## 5. Typography
- **The name** is outlines from **Reem Kufi Bold**, under the SIL OFL 1.1 (see `OFL-ReemKufi.txt`). Never retype it: always use the files.
- **Supporting text,** such as the share card's tagline: IBM Plex Sans Arabic, also OFL (see `card/plex-OFL-LICENSE.txt`).

## 6. Don'ts
- Don't round the diamonds; their sharp points are the calligraphic part.
- Don't reorder or swap the dot colours.
- Don't put the `dark` scheme on white, or the `light` scheme on ink.
- Don't stretch, rotate, outline or add shadows.
- Don't change the spacing between the symbol and the name.
- **A new game** can take a dot's colour in its own materials. Change the logo's dots only by a deliberate decision for the whole family.

## 7. Sharing
- **GitHub:** go to the repo's Settings → General → Social preview, and upload `social-card.png`. GitHub accepts it only through that page.
- **Pages site:** paste `share-tags.html` into the landing page's `<head>`. Each app caches previews, so re-check a link with that app's preview debugger after publishing.

## 8. Masters
`build_kit.py name.json masters` regenerates every master SVG.
