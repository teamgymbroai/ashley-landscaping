# Phase 1: Reference analysis

Measured 2026-09-07 in-browser. Numbers are from `performance.getEntriesByType`
and computed styles on the live sites, not estimates.

---

## 1. kinrosshouse.com

**Stack:** ProcessWire + jQuery + LocomotiveScroll + AOS.
**Type:** Adobe Caslon Pro (headings, 400, sentence case) / Brandon Grotesque
(body 400, buttons 700 uppercase). Two families, strictly separated by role.
**Colour:** `#2F3F3F` pine-slate (primary), `#3D2E2E` warm brown (quote band only),
white ground, muted gold accent on button rules.
**Spacing:** named scale baked into class names (`pt150 pb120`, `pt120`, `pt90 pb90`).
Fluid: 150 becomes 53.6px at 375px, 90 becomes 41.3px. Roughly a 1/3 collapse.
**Divider motif:** `decor.svg`, 543x245 viewBox, ONE path, an interlaced calligraphic
flourish. Three variants: dark, `decor-2-white`, `decor-3-white`. Plus tall edge
ornaments (`decoration1.png`, `decoration7.svg`) parallaxed via Locomotive
(`translateY(-380px)` observed).

### Good
- Two-family discipline held across the whole site. No third face anywhere.
- The flourish is one flat SVG glyph reused at three scales and two colourways. It
  is a *motif*, not decoration: it appears at the end of the welcome statement, at
  section seams, and as tall edge ornaments. This is the thing to steal.
- Palette is three colours and white. The brown quote band is the only deviation
  and it earns it: it is the only band on the page, so the pull-quote gets weight
  without a size increase.
- Aerial hero crop. The estate reads as a plan, not a photograph. Formal parterres,
  hedge lines, mown stripes. It sells scale in one frame.
- Sentence-case serif headings. No uppercase heroics.

### Bad
- **The hero is a 107-second 1080p Vimeo MP4, `autoplay loop muted preload="auto"`,
  with no `poster`, served identically into a 375x487 box on mobile.** A 107s 1080p
  rendition is tens of megabytes. Nothing paints in the hero until the first frame
  decodes.
- The video is hotlinked from `player.vimeo.com/progressive_redirect/...?signature=`.
  Signed URLs expire. When it does, the hero is a blank box with no fallback image.
- **Zero `loading="lazy"`.** All 26 images eager.
- At 375px the h1 and h2 both compute to 30.69px. No size hierarchy at mobile at all,
  only colour and position.
- h1 line-height 31.6px against 30.69px font: 1.03 leading on a serif at three lines.
  The hero headline wraps to three lines on mobile.
- A permanent 70px bottom bar (ESTATE HIRE / SPA BOOKINGS) eats 8.6% of an 812px
  viewport forever, and the cookie badge sits on top of it.
- Observed mid-scroll: the white logo and hamburger sitting directly on dark serif
  body copy with no scrim while the header background class toggles in.
- The nav is hamburger-only at every breakpoint. Desktop has room for 6 items and
  uses none of it. 23 links live behind one click.

---

## 2. rosebanklandscaping.co.uk

**Stack:** same agency, ProcessWire + jQuery.
**Type:** Halcom, ONE family, weight 300, entire site. No serif.
Desktop body 12px/18px. Mobile body ~18px/26px.
**Colour:** white ground, black text, warm bronze logo mark. No third colour.
Photography carries 100% of the chroma.
**Motion:** vertical wheel translates panels horizontally. Hero: 2.5s delay then
2s `fadeUpShow`.

### Good
- One typeface, one weight, one accent. This is the restraint worth copying. The
  gardens are loud so the interface is silent.
- Full-bleed image panel against a white text panel, alternating. The image never
  gets a caption, a border, or a label. It is allowed to be the whole panel.
- The menu overlay is genuinely nice: right-aligned, generous leading, and the
  Town / Country address blocks set in a paler ink as a secondary tier.
- Photography selection is ruthless. Every image is a single strong composition,
  golden hour or overcast. No mid-job shots, no vans, no people.

### Bad
- **The homepage does not scroll.** `document.documentElement.scrollHeight === innerHeight`
  at both 1280px and 390px. It is one fixed screen: a slideshow, a logo, a hamburger.
  No headline, no phone number, no services, no address, no CTA.
- **26.3 MB across 65 requests, `loadEventEnd` 9,924ms on desktop broadband.**
  At 390px: 3.9 MB, 4,964ms. On real 4G that is 15s+ for one photograph.
- One JPEG is **3.8 MB**, and the same file is requested a second time at 1.9 MB.
  5.7 MB for a single slide.
- **Zero `<img>` elements. 78 CSS `background-image` declarations.** No alt text,
  no `srcset`, no native lazy-loading, no `fetchpriority`, and Google Images cannot
  index a single photograph. For a business that sells on portfolio, the entire
  portfolio is invisible to search.
- All JPEG. No WebP, no AVIF. CMS renditions are baked at `.1920x1080.jpg` and served
  to 390px phones.
- Desktop body copy is **12px/18px**. Unreadable, and it is where all the service
  detail lives.
- The horizontal-scroll mechanic guillotines the text panel at the left viewport
  edge as it exits. "What We Do" degrades to "hat We Do" to "t We Do" while still
  being the active heading.
- Duplicate paragraph on /services/: the "Whether you're looking for landscape design,
  expert construction or a complete design and build service" sentence appears twice
  in the same block.
- In the menu overlay, `info@rosebank.co.uk` collides with the "Web Design" credit.
- At 390px there is an empty white rounded rectangle in the header next to the
  Instagram icon.
- Mobile art direction: a 16:9 source cropped to roughly 1:2.16 portrait. The house
  is cropped out entirely; you get sun loungers and hedge.
- 404 page is "404 / Page not found" in 12px, no navigation, no styling, no way back.
- 2.5s delay before the hero animation even starts, on top of a 5 to 10s load.

---

## 3 & 4. idstudio.co.uk case studies

**Type:** Host Grotesk 600. h1 74.67px, line-height 67.2px (0.90 leading),
tracking -1.84px (-0.025em). Pill buttons, 50px radius, saturated blue.
Dotted-grid background. Completely unlike anything they ship to clients.
**Weight:** 1.77 MB, 38 requests, 1,970ms load, 11 of 16 images lazy, 0 WebP.

### Good
- The engineering on their own site is markedly better than on either client site:
  real `<img>` tags, lazy-loading, a tenth of the payload.
- Tight negative tracking on a large grotesk h1 is a confident, current move.
- The Rosebank writeup states the actual objectives clearly:
  "Clean core objective driven design / Showcase focussed experience / Responsive,
  mobile and tablet friendly / Highly flexible modular ProcessWire CMS".
  That is a useful statement of intent to measure the built site against.

### Bad
- **Four spelling errors in four bullet points** on the Kinross case study:
  "Website Overveiw" (twice, once as a button label), "Proccess wire",
  "Intuative", "accomidation". On the flagship portfolio page.
- Each case study is roughly 40 words plus five bullets. No brief, no problem,
  no process, no result, no metric. It is a portfolio stub, not a case study.
- Both dated "Friday, 8 March 2024". Batch-uploaded, so the dates are decorative.
- The sticky nav detaches mid-page into an opaque grey bar floating over the h1.
- Cookie banner: "ID Studio uses (cookie emoji)'s", "ACCEPT ALL" as a solid blue
  button against "DECLINE ALL" as a ghost outline with a skull. Emoji plus a
  weighted choice.
- Repeated screenshot render timeouts on this page under automation: the main
  thread is saturated by scroll-driven work.
- They claim "Responsive, mobile and tablet friendly" above a client homepage that
  ships 3.9 MB and cannot be scrolled on a phone.

---

## Common ground

1. Photography is the design. Interface is a frame, never a competitor.
2. One or two typefaces, strictly role-separated, no third face.
3. Desaturated palette. Green comes only from plants, never from UI.
4. Full-bleed imagery with no borders, captions, or overlay labels.
5. Content is hidden behind a hamburger even where there is room for a nav.
6. Both client sites are heavy, image-eager, and non-responsive in the true sense.
7. Neither client homepage has a single visible phone number or CTA.

## Taking

- **Kinross:** the recurring divider motif as a *system* (one form, three scales,
  two colourways). The two-family serif/sans split. The named fluid spacing scale.
  The aerial-plan hero crop.
- **Rosebank:** one typeface at one weight. White ground, black text, colour only
  from photographs. Full-bleed image against white text panel, alternating.
  Ruthless photo selection.
- **idstudio:** tight negative tracking on a large grotesk heading.
  Real `<img>` tags with lazy-loading.

## Rejecting

- Video heroes. Any hero over ~200 KB.
- CSS background-images for content photography. Everything gets `<img>`,
  `srcset`, `alt`, `loading="lazy"` below the fold, WebP.
- Hamburger-only navigation at desktop.
- A homepage that does not scroll, or one without a phone number above the fold.
- 12px body copy. Nothing below 16px.
- Horizontal scroll hijacking.
- Ken Burns and full-screen slideshows.
- Scroll-reveal that leaves content at `opacity: 0` when the trigger misfires.
- Multi-second entrance delays.
- Serving one image rendition to every breakpoint.
- Emoji in interface copy.
