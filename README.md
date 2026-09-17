# Registration & Recruitment Workspace — Working Prototype

**SQE Case Study, Task 7 (bonus working prototype).**
A running, interactive front-end of the product defined across Tasks 1–6, with the **reviewer
screening workspace** as the required screen.

```
npm install
npm run dev      # → http://localhost:5173
```

Also available:

```
npm run build    # typecheck + production bundle into dist/
npm run preview  # serve the built bundle
npm test         # 21 unit tests over the filtering, duplicate and decision logic
```

Views are addressable: `#/screening`, `#/comparison`, `#/traceability`.

---

## What this is, and what it deliberately is not

This is a **front-end demonstration of product and UX decisions**, not a systems prototype.
There is no backend, no database, no authentication, no roles, and no external API calls. The
seeded pool is a snapshot of 9 September (Week 4 of 8 per the case context); anything you record
is stamped with the real current time, because that is what actually happened.

Five gaps from the case interviews are what the prototype exists to close, and each one is
answered by a specific element rather than a claim:

| Case pain point | Where the prototype answers it |
| --- | --- |
| **No decision capture** — reviewers work from a spreadsheet built off a nightly CSV export | Screen A → decision panel records Shortlist / Hold / Reject with reviewer, timestamp, reversibility and finalization, and shows the audit trail on the record |
| **No comparison tooling** — the director rebuilds side-by-side decks in PowerPoint, "takes days" | Screen B → side-by-side candidate cards with scores, notes and decisions; export is a labelled placeholder |
| **Duplicates go undetected** until interview stage | Screen A → `⚠ Dup` in the queue's Signals column and a banner on the detail panel that links to the paired record |
| **Assessment handling is manual** — IT pulls results and retypes them | Screen A → assessment block states that the score arrived by automated import (Requirement #7) |
| **One-size-fits-all form** — irrelevant fields are simply ignored | Screen A → answer list tags fields that do not apply to the programme ("not relevant") |

The Requirements log coverage is also rendered **inside the app** under "What this covers", so
the product thinking travels with the demo instead of living only in this file.

---

## How to demo it

### Screen A — Reviewer Screening Workspace (required screen)

Three panes: filterable queue · applicant detail · decisions & signals.

1. **Signals up front.** The queue shows name, programme, country, applied date, status,
   assessment score and the duplicate flag without opening anything. This is the point: duplicate
   checking and assessment lookup are today's two most manual, most error-prone steps.
2. **Open a duplicate pair.** Search `ahmad` — two records. Open either one and the banner reads
   *"Possible duplicate — also applied to the Institute programme on 14 Aug 2026 — currently New"*,
   with a button that jumps straight to the paired record.
3. **Record a decision.** Shortlist / Hold / Reject. The queue row updates immediately with no
   reload, the audit trail gains "Decision recorded: … · Dian · <timestamp>", and the decision is
   **reversible until finalized** — "Finalize decision" locks it, after which the decision buttons
   are disabled. That is the whole answer to "there is no place to record a screening decision".
4. **Shortlisting populates the comparison set** (badge in the nav), because shortlisting is what
   puts a candidate in front of the director.
5. **Reviewer notes** save with the record and appear on Screen B, replacing "notes in a
   spreadsheet nobody else can see".
6. **Calibration mode** pauses the working filters and shows the whole current pool with its status
   distribution — rolling intake and pool snapshot are the same records, framed differently. This
   is the UI reconciliation of the batch-vs-rolling tension, and it is flagged as a proposal, not a
   confirmed decision.
7. **Filters** cover country, programme, status, duplicates-only and a score range; sort by date,
   score or status. Rows are keyboard-focusable (Tab, then Enter).

### Screen B — Candidate Comparison Dashboard

Reach it from the nav, from "Add to comparison set", or directly at `#/comparison`.

- Cards sit **side by side** with programme, key answers, score bar, status, and the reviewer's
  notes and decision — deliberately reading as an upgrade of the deck Arief already builds.
- Sort by score, remove a candidate, and "Add all shortlisted" recovers anyone shortlisted but not
  yet in the set.
- **Export is a non-functional placeholder**, labelled as such. It represents the
  PowerPoint-replacement outcome without pretending an export pipeline exists.
- Removing someone from the comparison set does **not** undo their screening decision — the
  prototype this rebuilds from reset removed candidates to "In Review", which silently destroyed
  the decision. There is a regression test for it.

---

## Why these two screens and nothing else

The Prototype PRD scopes exactly these two, and the non-goals are as deliberate as the goals:

| Not built | Why |
| --- | --- |
| Applicant intake form | Intake already exists; it is not the demonstrated gap |
| Interview scheduling, onboarding handoff | Downstream screens, not part of the screening gap |
| Country-admin form builder (Req #1 / #13) | Configuration surface, separate from the reviewer workspace |
| Roles, permissions, real auth | An architecture decision, not a UI one |
| Coding-assessment engine | **Task 3 keeps HackerRank next cycle** and automates score import instead. Assessment sits outside the core product boundary; the platform consumes its scores, it does not own them |
| Data residency / multi-region infrastructure | Architecture, not prototype |

Assessment scores are seeded for the same reason: the prototype demonstrates the *state* that
Requirement #7 produces (a score that arrived without anyone retyping it), not the vendor call.

---

## How it is built

Vite + React 19 + TypeScript, no UI framework, plain CSS, in-memory state mirrored to
`sessionStorage` so an accidental refresh mid-demo does not wipe recorded decisions.

```
src/
  types.ts                    Domain model (Applicant, Status, Decision, QueueFilters …)
  data/seed.ts                20 seeded applicants, weighted to Indonesia; 3 duplicate pairs
  lib/selectors.ts            Filtering, sorting, duplicate pairing, calibration snapshot (pure)
  lib/reducer.ts              All mutations: decisions, reversals, finalization, notes, sets
  lib/*.test.ts               21 unit tests over the above
  screens/ScreeningWorkspace.tsx   Screen A
  screens/ComparisonDashboard.tsx  Screen B
  components/                 QueueTable, FilterBar, ApplicantDetail, DecisionPanel,
                              DuplicateBanner, AssessmentBlock, ComparisonCard,
                              TraceabilityTable, Signals
```

Two structural choices worth naming:

- **State model** is `New → In Review → {Shortlisted | On Hold | Rejected}` with an explicit
  "who decided, when" trail, plus a finalized flag that makes a decision irreversible. Reversal
  adds a history entry rather than erasing one.
- **Decisions live in a reducer, not in the views.** The queue, the detail panel, the comparison
  dashboard and the audit trail all read the same records, which is why a decision shows up
  everywhere at once. That is the property the spreadsheet-plus-nightly-export cannot have.

20 seeded applicants, every status and assessment state represented, and three academy/institute
duplicate pairs — including one already rejected on one side, because that is the awkward case a
reviewer will actually hit.

### Visual language — brutalist, on purpose

The interface is deliberately raw: heavy black rules, hard offset shadows, no rounded corners, no
gradients, no decoration. Flat colour blocks carry meaning — yellow for selection and calibration
mode, red for duplicates and rejections, green for shortlisted and passed — so signals are legible
before they are pretty. Labels and metadata are uppercase monospace, while names, answers and notes
stay in a plain grotesque, because uppercase mono is good for scanning a queue and bad for reading
a motivation statement.

That is the same argument as the rest of the prototype: a reviewer working 25,000+ applications a
cycle needs the structure and the signals visible, not softened. Because the palette is flat and
the contrast is high, nothing depends on a subtle shade to be understood — and there is nothing to
strip out later when this meets real accessibility and density constraints in the build.

### Verified behaviour

`npm test` covers filtering (including that a deliberate score range excludes unscored records),
sorting (score descending with unscored last), duplicate pairing in both directions, calibration
counts, decision capture, reversibility, finalization locking, note-saving, and the
comparison-removal regression above. The UI walkthrough in "How to demo it" was run against the
running app.

Layout is desktop-first — this is a high-volume reviewer's tool, and the queue keeps all seven
required columns side by side down to a 1440px monitor. Below that the queue scrolls inside its
own pane rather than dragging the page wide; narrow viewports stack the panes.

---

## Assumptions and open questions carried into the build

- **Calibration mode is a proposal, not an agreed requirement.** It reconciles batch vs. rolling in
  the UI pending a confirmation with Arief.
- **Comparison fields are illustrative**, pending the director scoping conversation.
- **Score thresholds are display-only banding.** Real pass marks are per-country and
  per-programme and are not settled, so nothing in the prototype depends on them.
- **Assessment data is entirely seeded**; no vendor integration exists in this build.
- The seeded pool is a 9 September snapshot; your own actions are timestamped with the current time.

## What I would do next

1. Confirm calibration mode with Arief and either keep it or drop it — do not ship both models.
2. Replace the export placeholder with a real shortlist export, since that is the specific outcome
   he asked for.
3. Instrument the workspace for the manual steps it removes (time-to-decision, duplicate catch
   rate at screening vs. interview) so the benefit is measurable, not asserted.
4. Then, and only then, the interview scheduling screen after screening.
