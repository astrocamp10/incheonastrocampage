**Findings**
- No P0/P1/P2 findings remain.

**Open Questions**
- The page intentionally does not pixel-copy concept 1 or concept 3. The selected references were combined and re-prioritized around the user's updated goal: the first viewport should introduce the regular class first, with one-day program as a secondary path.
- Exact tuition, schedule availability, and parking details are not asserted because verified Incheon-specific values were not provided. The prototype routes these to consultation.

**Implementation Checklist**
- Desktop hero: regular class message is visible above the fold with Naver Talk and phone CTAs.
- Desktop comparison: source concept 1 and local cinema implementation were combined in `qa-screenshots/comparison-cinema.png`.
- Desktop comparison: source concept 3 and local brochure implementation were combined in `qa-screenshots/comparison-brochure.png`.
- Mobile: sticky CTA bar is visible and body width does not exceed viewport.
- Interactions: theme switch, mobile menu, and FAQ accordion were verified.
- Build: `pnpm build` passed.

**Follow-up Polish**
- Replace generated prototype photos with approved real Incheon observatory photos when available.
- Update schedule, tuition, parking, and opening-class text after the academy confirms the exact values.
- If one direction is selected after review, remove the public theme switch and ship a single final style.

source visual truth path:
- `C:\Users\Incheon\.codex\generated_images\019f3c0c-e950-70f3-a86e-40aa9e31e72b\ig_045a93b99a702df0016a4cd210a2b88191a791489d148d205f.png`
- `C:\Users\Incheon\.codex\generated_images\019f3c0c-e950-70f3-a86e-40aa9e31e72b\ig_045a93b99a702df0016a4cd2c87dbc81919615f2b99653864f.png`

implementation screenshot path:
- `C:\Users\Incheon\Desktop\project\incheonastro_intropage\site\qa-screenshots\desktop-cinema.png`
- `C:\Users\Incheon\Desktop\project\incheonastro_intropage\site\qa-screenshots\desktop-brochure.png`
- `C:\Users\Incheon\Desktop\project\incheonastro_intropage\site\qa-screenshots\mobile-cinema.png`
- `C:\Users\Incheon\Desktop\project\incheonastro_intropage\site\qa-screenshots\mobile-brochure.png`

viewport:
- Desktop: 1440 x 1024
- Mobile: 390 x 844

state:
- Desktop cinema theme, desktop brochure theme, mobile cinema theme, mobile brochure theme, mobile menu open, FAQ open.

full-view comparison evidence:
- `C:\Users\Incheon\Desktop\project\incheonastro_intropage\site\qa-screenshots\comparison-cinema.png`
- `C:\Users\Incheon\Desktop\project\incheonastro_intropage\site\qa-screenshots\comparison-brochure.png`

focused region comparison evidence:
- Focused region comparison was not needed after full-view review because the main risk was hierarchy, CTA placement, responsive behavior, and readability rather than exact component replication.

patches made since previous QA pass:
- Changed dark-theme day-program, FAQ, and location headings to white for contrast.
- Hid the desktop floating contact panel below 1500px to avoid covering content at the review viewport.
- Cleaned up typography after review feedback: unified on Pretendard Variable, removed brochure serif display styling, reduced hero/section title weight and scale, and shortened the hero headline around the regular class.
- Added CodePen-inspired scroll behavior after review feedback: the header starts as a rounded floating glass bar, morphs into a full-width compact bar on scroll, shows section-active navigation, and adds a subtle scroll progress indicator.

final result: passed
