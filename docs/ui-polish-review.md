# Discovery Lens: usability polish

31 October 2026 · `feature/woven-theme`

This pass addresses the screens rated below 8 in the design review. The aim is a clearer, more comfortable product, not a self-certified numerical score. Actual usability still needs testing with people on their phones.

## What changed

| Screen         | Before                                                                                      | Now                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Setup          | Map styling came before destination choice; unfinished selections were local to the screen. | Town, interests and transport are three short steps. Map appearance is optional. Selections use the existing persisted preferences immediately; restarting begins at the first step with those choices retained.                                    |
| Map appearance | Two small interactive previews with competing zoom controls.                                | Genuine previews without zoom controls; narrow screens or enlarged text stack the choices. Attribution remains available.                                                                                                                           |
| Discover       | Desktop stretched the mobile column; controls consumed several rows.                        | A 400-unit results pane beside the map on expanded layouts; compact town/header row on phones. Contribution remains immediately after the map.                                                                                                      |
| Filters        | No local reset or result preview.                                                           | Reset preserves town and search; the apply action shows the actual combined result count. Discovery shows the active filter-group count.                                                                                                            |
| Details        | Repeated notices and an oversized image pushed useful actions down.                         | Shorter image, grouped visit facts and one concise uncertainty statement. Sources and access details remain available.                                                                                                                              |
| My plan        | Transport opened unrelated discovery filters; removing a stop was immediate.                | Focused town/transport/time settings and undo for the most recently removed stop. The empty state prioritises finding a first stop.                                                                                                                 |
| Contribution   | Three steps, numeric location confirmation, submission hidden inside an accordion.          | Location, photos, story and review. Real map pin preview, visible input labels, current coordinate values when reopening manual entry, contextual photo rights and final consent, and a visible submission action with a missing-details checklist. |
| Review status  | Mostly a status label and generic action.                                                   | Draft cards show the next missing requirement or readiness, reviewer feedback and explicit pending/publication wording. Sent contributions have a readable summary.                                                                                 |
| AI interface   | A single answer replaced the previous exchange; composer scrolled with the form.            | Session conversation, contextual header, source disclosures, follow-up examples and a composer outside the scrolling history. Example-answer labels stay explicit.                                                                                  |

The blue palette, Manrope, authentic destination photos and original M mark stay consistent. Decorative illustration remains on welcome; no photo is pixelated or stylised. Compact page padding is 16, expanded form padding is 32, with shared spacing tokens inside components. Buttons retain 48-unit minimum targets and text can wrap.

## Principles applied

- **Progressive disclosure:** hide optional access notes and map styling, keep task completion visible. [Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
- **Clear input guidance:** persistent coordinate, photo-caption and sign-in labels, plus description length guidance. [W3C labels and instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- **Touch accuracy:** retain generous controls and spacing rather than making actions tiny to fit a screen. The app's 48-unit target is a project standard, not the WCAG AA 24-CSS-pixel minimum. [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **User control:** reversible planner removal, back steps and explicit optional choices.
- **Honest AI expectations:** the interface demonstrates conversations; it does not imply verified current conditions or a connected model. [Google PAIR mental models](https://pair.withgoogle.com/guidebook-v2/chapter/mental-models/)

These principles guide decisions; they do not prove task success without user testing.

## Code organisation

- `src/features/places/DiscoverScreen.tsx` composes the responsive screen. Its route is a single re-export. `DiscoveryActions`, `PlaceResult` and `DiscoveryMap` have individual responsibilities.
- `src/features/assistant/AssistantMessage.tsx` renders one exchange; `QuestionComposer.tsx` owns the input UI. Answers still come from the pure example model. History is held for the current screen session, not uploaded or saved as a chat account.
- `src/features/contributions/ContributeScreen.tsx` composes the four steps. `DraftReview` presents the submission summary; `LocationPreview` displays the private pin. Storage, capture, submission and publication rules remain in their existing services.
- `src/features/planning/PlanSettings.tsx` updates only town, transport and budget. `restoreStop` is a pure reducer action that preserves order and prevents duplicates.
- The web map updates its style only when the resolved style URL changes. Selection styling no longer resends all destination data. Map/list switching retains the compact map instance; crossing the desktop breakpoint may recreate it.
- No new dependency, hosted database change, AI key or publication rule was introduced. Existing reviewed-publication policy tests continue to run.

## Acceptance and remaining work

See [UI validation](ui-validation.md) for executed checks and visual evidence. Run instructions remain in [running.md](running.md).

Before release, test Android keyboard/composer behavior, step navigation, font scaling, map gestures, GPS permission denial, photo capture, interrupted submissions and restart recovery. Repeat on iPhone before claiming iOS validation. Real AI, multi-day planning and offline map/route downloads remain later milestones.

The separate `design-exploration/` gallery preserves earlier comparisons. This pass updates the actual application in `src`; old gallery screenshots should not be presented as captures of the new implementation.
