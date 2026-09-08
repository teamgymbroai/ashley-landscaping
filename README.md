# Ashley Landscaping — spec build

Static, deploy ready. `site/` is the whole deliverable.

```
site/
  index.html      one page, all CSS and JS inline, 114 KB
  favicon.svg
  robots.txt
  sitemap.xml
  i/              65 WebP files, four widths per image
vercel.json       outputDirectory: site, immutable cache on /i/*
```

Deploy: `vercel deploy --prod` from this folder, or drag `site/` into Vercel.
No build step and no dependencies at runtime.

## Measured

| | desktop 1440 | mobile 390 |
| --- | --- | --- |
| transferred, whole page, every image loaded | 1,636 KB | **457 KB** |
| requests | 20 | 17 |
| horizontal overflow | none | none |
| broken images | 0 | 0 (rail cards load on scroll) |

The mobile figure is the entire page. Above the fold it is the HTML plus one
31 KB hero, so first paint is well inside 3s on 4G. The seven service
photographs are `display:none` below 900px and are never downloaded on a phone.

WCAG AA: every text and background pair passes at its size. Reduced motion:
zero animations run and nothing is hidden.

## Decisions worth knowing

**Palette.** Bottle green (#1B2A21) on warm chalk, with brass (#B69662) as the
single accent. Brass rather than silver: it is the country-house register, and
silver reads cold next to timber and stone. Brass appears only where it can
earn it, on rules that draw in, the live index numeral, the star ratings, the
section labels and the After tag. Small brass text on light ground uses a
darker cut (#75592F, and #5E4726 for the live state) so it clears AA. Headings
stay in the grotesk; the pull quote and the two-generations lead are set in
Libre Caslon italic, which is the only place a serif appears.


**The before/after is one pinned horizontal stage.** No pair of Tyler's
photographs shares a camera position, so a drag slider would promise an
alignment that is not there. Instead the whole project is one section: a 520vh
track with a 100dvh stage pinned inside it, holding six panels side by side.
The strip slides left as you scroll, so each stage arrives from the side while
the page itself keeps moving down. Progress is stepped rather than linear, so
roughly two thirds of the scroll is spent parked on a panel and the slides
between are quick; without that you spend the section looking at one panel's
photograph beside the next panel's caption.

**Nothing essential depends on scroll-driven CSS.** The first build used
`animation-timeline: view()`, which only Chrome and Edge support, so in every
other browser the centrepiece silently fell back to a plain vertical list. It
now runs on a 40-line scroll engine: an IntersectionObserver wakes a rAF loop
only while a `[data-scrub]` element is on screen, and publishes `--p` from 0
to 1 for CSS to consume. No scroll listeners, no library, same behaviour
everywhere. `view()` is gone from the file entirely.

