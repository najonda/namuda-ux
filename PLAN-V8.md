# V8 Plan — Namuda UX

## Problems to Fix

### 1. Process Context review card is off-screen
The review document card renders in the bottom interaction area with `maxHeight: 55vh` but the accept button is below the fold. The card morphs up from the bottom but there's not enough room.
**Fix**: Make the review document render in the center scroll lane (not the bottom area), as a full-height scrollable card. Keep the accept/refine choices at the bottom of the card, always visible via sticky footer.

### 2. Strategy animation not showing
The `approveDoc()` sets `phase="strategy-animation"` and the StrategyAnimation renders in the scroll lane. But the SVG viewBox transition doesn't animate (SVG viewBox isn't CSS-animatable). The zoom effect needs to use transform instead.
**Fix**: Rewrite StrategyAnimation to use CSS transforms for zoom instead of viewBox changes. Use a fixed viewBox and transform the `<g>` elements. Also verify it's visible by checking rendering conditions.

### 3. Canvas transition is jarring — no continuity
Junction → Canvas loses all context. Goals disappear. User lands in a completely different app.
**Fix**: After junction, instead of jumping to canvas, show a guided first-canvas-experience:
- Keep goals visible in a collapsible side panel during canvas
- Namuda guides: "I've highlighted the biggest bottleneck. Click it to explore."
- First interaction leads to a Finding, closing the loop from goals → evidence

### 4. Choice widget animation feels mechanical
The `morphUp` with `scaleY(0.92)` looks like a CSS tutorial.
**Fix**: Replace with staggered option entrance. Container appears with fast opacity fade, then each option slides up with 40ms delay between them.

### 5. No typographic identity
Everything uses DM Sans at various sizes. No distinction between UI text, data, and ceremonial moments.
**Fix**: Add JetBrains Mono for data/monospace. Use DM Sans italic for quotes/mission. Keep DM Sans for all UI.

### 6. Canvas background color
Currently `#f4f5f8` (cool gray). Too clinical.
**Fix**: Warm it slightly to `#f5f4f2` — a warm linen tone that feels more inviting while keeping the dot canvas working.

### 7. Cards all look the same
Every card uses `T.shadow.md` and `T.radius.lg`. No hierarchy.
**Fix**: Introduce shadow tiers:
- Choice widgets: `T.shadow.sm` + border (lightweight, conversational)
- Data cards (field review, education): `T.shadow.md` (standard)
- Document/review cards: `T.shadow.lg` (heavy, important)
- Strategy animation: No shadow, just border (full bleed feel)

### 8. Deeply nested intro callbacks
6+ levels of nesting make the flow brittle.
**Fix**: Extract `showDataChoice()` helper used by all data selection paths.

### 9. Data quality narrative too long (26s)
**Fix**: Reduce to ~18s. Cut wait times between steps. Add a "Skip to results" link.

### 10. Post-goals flow — guide to first improvement
After targets are set, the junction currently offers 3 paths (tour, canvas, goal dive). This is too open-ended for a first-time user.
**Fix**: Instead of a junction modal, Namuda should guide the user directly:
- "Now let me show you your first improvement opportunity."
- Transition smoothly to canvas with the primary bottleneck highlighted
- The blob (as minimized orb) guides: "This is the Last Confirmation Print bottleneck. Click it."
- First click reveals a Finding card
- Finding has "Create improvement" action → user's first improvement created
- THEN show the junction options for further exploration

## Implementation Order

1. Copy v7 → v8, update main.jsx
2. Extract `showDataChoice()` helper (fix nested callbacks)
3. Add JetBrains Mono font import
4. Update background color to warm linen
5. Fix choice widget animation (staggered options)
6. Differentiate card shadow tiers
7. Fix review document — move to center scroll lane with sticky footer
8. Fix strategy animation — CSS transform zoom
9. Reduce data quality narrative to 18s
10. Redesign post-goals flow — guided first improvement instead of junction
11. Canvas continuity — goals panel + guided first interaction
12. Build and verify
