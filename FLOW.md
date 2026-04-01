# Namuda UX Flow — Complete Map

## Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NAMUDA ONBOARDING                             │
│                                                                         │
│  "Continuous onboarding — improvement never stops"                     │
│                                                                         │
│  ┌──────┐   ┌──────┐   ┌────────┐   ┌────────┐   ┌──────────────┐    │
│  │ARRIVE│──▶│ DATA │──▶│EDUCATE │──▶│CONTEXT │──▶│  SET GOALS   │    │
│  └──────┘   └──────┘   └────────┘   └────────┘   └──────────────┘    │
│     │          │           │             │               │             │
│   Intro     Dataset    Core fields    Process         Strategy        │
│   Choice    Choice     + Fields       type/name       animation       │
│                        + Quality      + Facts         + Goals         │
│                                       + Mission       + Targets       │
│                                       + Review        + Junction      │
│                                                          │             │
│                                                     ┌────┴────┐       │
│                                                     │ EXPLORE │       │
│                                                     └─────────┘       │
│                                                      Tour|Canvas      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Phase Map

### Phase 1 — INTRO (Moonrise)

```
 ┌─────────────────────────────────────────┐
 │              MOONRISE                    │
 │                                          │
 │    4.8s cinematic animation              │
 │    Blob rises, background lightens       │
 │    Typewriter: "Welcome to Namuda..."    │
 │                                          │
 │    ▼ typewriter completes                │
 │                                          │
 │  ┌─ CHOICE (bottom, morphs up) ────────┐│
 │  │ How would you like to start?         ││
 │  │                                      ││
 │  │ 1. Let's get started            ──▶ DATA  │
 │  │ 2. Tell me more about Namuda    ──▶ EXPLAIN ──▶ DATA │
 │  │ ✎ Something else                ──▶ REFINE ──▶ DATA  │
 │  └──────────────────────────────────────┘│
 └──────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Cinematic intro → Choice widget (Claude-style, bottom) |
| **Purpose** | First impression. Set collaborative tone. Let user control pace. |
| **Reasoning** | No input bar shown before first choice. Widget morphs up from where input would be. Avoids the "blank text field" problem. Two options + custom covers all intents without overwhelm. |
| **Sidebar** | Hidden (no progress bar before commitment) |
| **Input bar** | Hidden until after first choice resolves |

---

### Phase 2 — DATA SELECTION

```
 ┌──────────────────────────────────────────┐
 │  Blob: "I need your data"                │
 │                                           │
 │  ┌─ CHOICE (bottom) ───────────────────┐ │
 │  │ Which dataset should we work with?   │ │
 │  │                                      │ │
 │  │ 1. Glamox (91K, 12mo)          ──▶ LOAD │
 │  │ 2. Acme Corp (24K, 6mo)        ──▶ LOAD │
 │  │ 3. TechFlow (15K, 9mo)         ──▶ LOAD │
 │  │ 4. MediCare (8K, 12mo)         ──▶ LOAD │
 │  │ ✎ Upload my own data            ──▶ UPLOAD MODAL │
 │  └──────────────────────────────────────┘ │
 └──────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Choice widget (bottom) + floating upload modal |
| **Purpose** | Get data connected. Demo datasets for instant gratification. |
| **Reasoning** | Inline choices keep the conversational feel. "Upload" opens a proper modal because drag-and-drop needs a dedicated UI. Demo data is the fast path. |
| **Sidebar** | Hidden (still pre-commitment) |
| **After** | 4s thinking animation → Core Fields |

---

### Phase 3 — CORE FIELDS EDUCATION

```
 ┌──────────────────────────────────────────────────────┐
 │  Blob: "Process mining works with just 3 columns"    │
 │                                                       │
 │  ┌─ EDUCATION CARD (center, 5 steps) ──────────────┐ │
 │  │                                                  │ │
 │  │  Step 1: Event log table                         │ │
 │  │          ──▶ "Show me a case"                    │ │
 │  │  Step 2: Follow PO-142 (rows highlight)          │ │
 │  │          ──▶ "See the traces"                    │ │
 │  │  Step 3: Traces visualization                    │ │
 │  │          ──▶ "Build the map"                     │ │
 │  │  Step 4: Process graph emerges                   │ │
 │  │          ──▶ "Got it! Select fields"             │ │
 │  │  Step 5: Auto-mapped columns + confirm           │ │
 │  │          ──▶ "Confirm fields"                    │ │
 │  │                                                  │ │
 │  │  [● ● ● ● ●]  progress dots                     │ │
 │  └──────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Animated educational card (center). Step-by-step with Back/Next buttons. |
| **Purpose** | Teach the fundamentals of process mining. Build understanding before asking questions. |
| **Reasoning** | On-rails education is correct here — the user needs to understand case_id, activity, timestamp before we can ask them to interpret fields. Auto-suggest correct columns in step 5 (Namuda is confident). Show remaining fields with sample data so user sees what else is available. |
| **Sidebar** | Shows progress (step 1: Field mapping → Core fields) |
| **Duration** | User-paced (buttons) |

**After confirm → Process teaser (8.2s auto-sequence)**
```
  acceptCoreFields()
    ├─ 0.8s: Process map appears center
    ├─ 3.2s: "Woa, a lot to unpack!"
    ├─ 5.5s: "But wait — need more context"
    ├─ 7.5s: Process map fades out
    └─ 8.2s: → FIELD MAPPING
```

---

### Phase 4 — FIELD MAPPING (Conversational)

```
 ┌──────────────────────────────────────────────────┐
 │  Blob: "This is my interpretation of             │
 │         receiving_site — is that correct?"        │
 │                                                    │
 │  ┌─ FIELD REVIEW CARD (bottom) ────────────────┐  │
 │  │ receiving_site              17 values  1/5   │  │
 │  │ ┌────────────────────────────────────────┐   │  │
 │  │ │ PM1  PN1  PK3  PL2  PM2  PK1  ...     │   │  │
 │  │ └────────────────────────────────────────┘   │  │
 │  │ ┌─ AI INTERPRETATION ────────────────────┐   │  │
 │  │ │ Goods receipt location — the physical   │   │  │
 │  │ │ site where orders are delivered         │   │  │
 │  │ └────────────────────────────────────────┘   │  │
 │  │                                              │  │
 │  │  1  Correct                             ──▶ NEXT FIELD │
 │  │  ✎  Not quite — let me explain          ──▶ CHAT │
 │  └──────────────────────────────────────────────┘  │
 │                                                    │
 │        ┌─ CHAT (if "Not quite") ──────────┐       │
 │        │ User: "It's the warehouse code"   │       │
 │        │ Namuda: "OK, so you mean it's     │       │
 │        │  more like: 'Warehouse location   │       │
 │        │  code...' Does that capture it?"  │       │
 │        │  [Yes, that's it] [Not quite...]  │       │
 │        └───────────────────────────────────┘       │
 └────────────────────────────────────────────────────┘
```

**Fields in sequence:**

| # | Field | Values | AI Guess | Purpose |
|---|-------|--------|----------|---------|
| 1 | `receiving_site` | 17 | Goods receipt location | Physical site mapping |
| 2 | `purchase_office` | 28 | Purchasing office origin | Org structure |
| 3 | `item_group` | 427 | Product category | Material segmentation |
| 4 | `selection_code` | 7 | Approval routing code (42% null) | Workflow routing |
| 5 | `item_signal` | 8 | Automation signal (95% null) | Deprecated flag |

| Aspect | Detail |
|--------|--------|
| **UX type** | FieldReviewCard in bottom area. Conversational back-and-forth for refinement. |
| **Purpose** | Ensure Namuda understands the data semantics. Each field interpretation improves analysis quality. |
| **Reasoning** | Namuda proposes (confident), user confirms or explains. "Not quite" opens a real chat — Namuda restates understanding and asks for confirmation. Multiple rounds allowed. This is collaborative, not a form. |
| **Sidebar** | Shows each field with checkmarks as confirmed |
| **After all 5** | "Continue to data quality" choice → 4s think → Data Quality |

---

### Phase 5 — DATA QUALITY (Educational, on rails)

```
 ┌────────────────────────────────────────────────────────┐
 │  ┌─ DATA PROFILE PANEL (left) ──┐  Blob (center)      │
 │  │                              │                      │
 │  │  Score Ring: 72/100          │  Timed narrative:     │
 │  │  ┌─ Pass ─┐                 │                      │
 │  │  │ Volume Stats             │  0s: "Data quality    │
 │  │  │ Activity Distribution    │       report..."      │
 │  │  │ Field Quality Bars       │  2s: Score spotlight   │
 │  │  │                          │  3.5s: "It's a pass!" │
 │  │  │ ┌─ FINDINGS ──────────┐  │  5s: Fields reveal    │
 │  │  │ │ ⚠ Dup timestamps   │  │  9s: FINDINGS intro   │
 │  │  │ │ 🔴 item_signal dep  │  │  14s: "3 Findings    │
 │  │  │ │ ⚠ selection_code   │  │        found..."      │
 │  │  │ │                     │  │  18s: First expands   │
 │  │  │ │ Each finding shows: │  │  24s: Collapse back   │
 │  │  │ │  - Severity         │  │  26s: "Click Looks    │
 │  │  │ │  - Why it matters   │  │        good..."       │
 │  │  │ │  - Affected count   │  │                      │
 │  │  │ │  - Recommendation   │  │                      │
 │  │  │ └─────────────────────┘  │                      │
 │  │  │                          │                      │
 │  │  │  [Looks good →]          │                      │
 │  │  └──────────────────────────┘                      │
 └────────────────────────────────────────────────────────┘
```

**Findings detail:**

| Finding | Severity | Affected | Impact | Recommendation |
|---------|----------|----------|--------|----------------|
| Duplicate timestamps | Medium | 23,411 events | Throughput accuracy | Investigate timestamp precision |
| item_signal deprecated | High | 86,620 events | Analysis noise | Deprecate field, remove from pipeline |
| selection_code gaps | Medium | 38,295 events | Segmentation depth | Add as required field, backfill |

| Aspect | Detail |
|--------|--------|
| **UX type** | Side panel (left) + blob narration. Timed reveal sequence (26s total). |
| **Purpose** | Educate user on data quality AND introduce the concept of Findings — the key value maker. |
| **Reasoning** | On-rails is intentional here. Findings are the core value proposition of Namuda. The narrative builds from "here's your score" → "here's what's wrong" → "here's what Findings ARE" → "here's your first one with evidence and action." This is a teaching moment, not a Q&A. |
| **Sidebar** | Shows (step 2: Data quality) |
| **After** | "Looks good" → Process Context |

---

### Phase 6 — PROCESS CONTEXT (Conversational)

```
 ┌──────────────────────────────────────────────────────────────┐
 │  ┌─ DOC PANEL (left) ──────┐  Blob (center)                 │
 │  │                          │                                │
 │  │  Process Context          │  Sequential questions:        │
 │  │  ┌──────────────────┐    │                                │
 │  │  │ Process Name     │    │  1. PROCESS TYPE PROPOSAL      │
 │  │  │ Process Type     │    │     "This is Procurement"      │
 │  │  │ Context Score ▓▓░│    │     [Yes] / [Something else]   │
 │  │  │                  │    │                                │
 │  │  │ Mission ★        │    │  2. PROCESS NAME PROPOSAL      │
 │  │  │ Description      │    │     "Purchase-to-Receive"      │
 │  │  │ KPIs             │    │     [Yes] / [Something else]   │
 │  │  │ Field Context    │    │                                │
 │  │  │ Hypotheses       │    │  3-9. FACT QUESTIONS (choices)  │
 │  │  └──────────────────┘    │     General → Fields → Hypotheses │
 │  │                          │     Each bumps score +8         │
 │  │  (fills in as user       │                                │
 │  │   answers questions)     │  10. MISSION PROPOSAL          │
 │  └──────────────────────────┘     Ceremonial reveal          │
 │                                   [Accept] / [Refine] / [Own]│
 └──────────────────────────────────────────────────────────────┘
```

**Sub-sequence:**

```
acceptProfile()
    │
    ├─ 0s: "Let's build the Process Context"
    ├─ 2.5s: Score bar spotlight ("See this progress bar?")
    ├─ 5.5s: PROPOSE PROCESS TYPE
    │         "This looks like Procurement"
    │         ┌─ Choice: [Yes, procurement] / [✎ Different type]
    │         └─ Resolves → docData.processType set
    │
    ├─ PROPOSE PROCESS NAME
    │         "I'd suggest 'Purchase-to-Receive'"
    │         ┌─ Choice: [Purchase-to-Receive] / [✎ Different name]
    │         └─ Resolves → docData.processName set
    │
    ├─ FACT QUESTIONS (9 remaining, grouped)
    │   │
    │   ├─ GENERAL (3 questions)
    │   │   "Which teams handle these?"
    │   │   "Are steps automated?"
    │   │   "Known pain points?"
    │   │
    │   ├─ transition: "Now some questions about fields..."
    │   │
    │   ├─ FIELD (3 questions)
    │   │   "What is selection_code?"
    │   │   "Is item_signal still used?"
    │   │   "What do site codes mean?"
    │   │
    │   ├─ transition: "Last group — hypotheses..."
    │   │
    │   └─ HYPOTHESIS (3 questions)
    │       "Why 52% rework?"
    │       "Why is PM1 faster?"
    │       "Why did volume drop?"
    │
    └─ MISSION STATEMENT PROPOSAL
          "A mission statement defines the north star..."
          ┌─ Choice:
          │  1. "This captures our direction"     ──▶ ACCEPT
          │  2. "Almost — I'd refine it"          ──▶ REFINE DIALOGUE
          │  ✎  "I have a different vision"        ──▶ REFINE DIALOGUE
          └─ Resolves → finishDraft() (4s think)
                         → REVIEW
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Choice widgets (bottom) + live-updating DocPanel (left). Conversational back-and-forth. |
| **Purpose** | Build the "intelligence layer" — Namuda needs domain context to make good recommendations. |
| **Reasoning** | Namuda proposes first (confident on type/name from data analysis). Questions use multiple-choice with "something else" — guided but flexible. The document fills in live as the user answers, creating a sense of progress. Mission is proposed ceremonially because it's the foundation for everything after. |
| **Sidebar** | Shows (step 3-4: Process context → Review context) |
| **Key insight** | Process type and name are proposed with single confident options. Namuda should be right most of the time. The "something else" path exists but isn't the expected path. |

---

### Phase 7 — REVIEW (Document in scroll lane)

```
 ┌──────────────────────────────────────────────┐
 │  Blob: "Please review the process context"    │
 │                                                │
 │  ┌─ DOCUMENT CARD (center, scrollable) ────┐  │
 │  │ Process Context                          │  │
 │  │ Purchase-to-Receive · Procurement        │  │
 │  │ ─────────────────────────────────────    │  │
 │  │ Context Score: ▓▓▓▓▓░░░░░ 62%           │  │
 │  │                                          │  │
 │  │ KEY INDICATORS                           │  │
 │  │ Avg throughput time       18.8 days      │  │
 │  │ Rework rate               52%            │  │
 │  │ Process variants          1,175          │  │
 │  │ ...                                      │  │
 │  │                                          │  │
 │  │ MISSION STATEMENT                        │  │
 │  │ │ "To have an efficient purchasing..."   │  │
 │  │                                          │  │
 │  │ PROCESS DESCRIPTION                      │  │
 │  │ FIELD CONTEXT                            │  │
 │  │ HYPOTHESES                               │  │
 │  │ ─────────────────────────────────────    │  │
 │  │ Does this look right?                    │  │
 │  │  1  Approve and continue            ──▶ STRATEGY │
 │  │  ✎  I'd like to refine something    ──▶ CHAT  │
 │  └──────────────────────────────────────────┘  │
 └────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Scrollable document card in bottom interaction area (morphs up). Claude-style accept/refine choices. |
| **Purpose** | Proofreading checkpoint. Let user verify the accumulated context before setting goals. |
| **Reasoning** | Document is in the chat area (not a separate page or side panel) because it's part of the conversation. "Does this look right?" with choices keeps the collaborative pattern. Scrollable card handles long content without breaking the layout. |
| **Max height** | 55vh — scrollable within the card |
| **After approve** | → Strategy Animation |

---

### Phase 8 — STRATEGY ANIMATION (Mission → Goals bridge)

```
 ┌──────────────────────────────────────────────────────┐
 │  Blob narrates each step:                             │
 │                                                        │
 │  ┌─ ANIMATED SVG (center) ──────────────────────────┐ │
 │  │                                                    │ │
 │  │  Step 1 (2s): ┌──────────┐                        │ │
 │  │               │ Strategy │                        │ │
 │  │               └──────────┘                        │ │
 │  │                    │                               │ │
 │  │  Step 2 (4.5s):   ├────────────┬──────────┐      │ │
 │  │             ┌─────────────┐ ┌────────┐ ┌────────┐│ │
 │  │             │ Procurement │ │Productn│ │Logistcs││ │
 │  │             │   (blue)    │ │(orange)│ │(green) ││ │
 │  │             └─────────────┘ └────────┘ └────────┘│ │
 │  │                                                    │ │
 │  │  Step 3 (7.5s): ZOOM into Procurement              │ │
 │  │             ┌═══════════════════┐                  │ │
 │  │             ║   PROCUREMENT     ║  (other nodes    │ │
 │  │             ║   ▓▓▓ (glow)      ║   fade to 25%)   │ │
 │  │             ╚═══════════════════╝                  │ │
 │  │             "Your mission: ..."                    │ │
 │  │                                                    │ │
 │  │  Step 4 (10.5s): Goals emerge                      │ │
 │  │             ┌─ 1 ─ Reduce throughput ─────┐       │ │
 │  │             ├─ 2 ─ Lower rework ──────────┤       │ │
 │  │             ├─ 3 ─ Improve data quality ──┤       │ │
 │  │             └─ 4 ─ Increase conformance ──┘       │ │
 │  │                                                    │ │
 │  │  Step 5 (14s): Fade out → Goal selection           │ │
 │  └────────────────────────────────────────────────────┘ │
 └─────────────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Auto-playing SVG animation (center) + blob narration. No user interaction. |
| **Purpose** | Bridge from mission to goals. Show the user their place in the bigger picture. |
| **Reasoning** | This is a key narrative moment. The user just defined their mission — now they see WHY goals matter. The value chain visualization (Strategy → Processes → Goals) creates context: "Your process is one of many. Your mission needs concrete goals. Those goals will drive every Finding and recommendation." Without this bridge, goals feel arbitrary. |
| **Duration** | 14s (auto-paced) |
| **Sidebar** | Hidden (full focus on animation) |
| **After** | Auto-transitions to Goal Selection |

---

### Phase 9 — GOAL SELECTION

```
 ┌──────────────────────────────────────────────────┐
 │  Blob: "Select the goals that matter most"       │
 │                                                    │
 │  ┌─ GOALS PANEL (floating modal) ──────────────┐  │
 │  │ Suggested Goals                              │  │
 │  │                                              │  │
 │  │ ☑ 1  Reduce throughput time                  │  │
 │  │      18.8 days avg → target                  │  │
 │  │      "PM1 achieves 7.7d..."                  │  │
 │  │                                              │  │
 │  │ ☑ 2  Lower rework rate                       │  │
 │  │      52% → target                            │  │
 │  │      "52% hit Confirmed Changed..."          │  │
 │  │                                              │  │
 │  │ ☑ 3  Improve data quality                    │  │
 │  │      50/100 → target                         │  │
 │  │                                              │  │
 │  │ ☑ 4  Increase conformance                    │  │
 │  │      1,175 variants → target                 │  │
 │  │                                              │  │
 │  │  [Skip]          [Accept N goals →]          │  │
 │  └──────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Floating modal with multi-select checkboxes. |
| **Purpose** | Let user choose which improvement areas to focus on. Pre-selected = all 4. |
| **Reasoning** | Floating modal (not bottom chat) because this is a multi-select with rich content per option. Each goal shows current state, why it matters, and evidence. All pre-selected because Namuda recommends all 4, but user can deselect. Skip path exists for users who want to explore first. |
| **Sidebar** | Shows (step 5: Set goals) |
| **After accept** | → Target Setting (one per selected goal) |
| **After skip** | → Junction |

---

### Phase 10 — TARGET SETTING

```
 ┌──────────────────────────────────────────────────┐
 │  ┌─ GOALS DOC (left) ──┐  Blob (center)         │
 │  │  Goals & Targets     │                         │
 │  │  Mission: "..."      │  For each selected goal:│
 │  │                      │                         │
 │  │  ✓ Throughput 18.8→14│  ┌─ TARGET CARD ──────┐│
 │  │  ● Rework (current)  │  │ Rework rate        ││
 │  │  ○ Data quality      │  │                    ││
 │  │  ○ Conformance       │  │ Current    Target  ││
 │  │                      │  │  52%    →   35%    ││
 │  └──────────────────────┘  │                    ││
 │                             │ Why: "Every rework ││
 │                             │  loop doubles..."  ││
 │                             │                    ││
 │                             │ Benchmark: "Best   ││
 │                             │  in class <15%..." ││
 │                             │                    ││
 │                             │ How to get there:  ││
 │                             │  "Investigate..."  ││
 │                             │                    ││
 │                             │ [Skip] [Accept →]  ││
 │                             └────────────────────┘│
 └───────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Floating modal (one card at a time) + GoalsDocPanel (left) updates live |
| **Purpose** | Set concrete, measurable targets for each goal. Each target includes why, benchmark, and how. |
| **Reasoning** | One target at a time prevents overwhelm. Industry benchmarks add credibility. "How to get there" connects target to action. Left panel shows accumulating targets as a living goal document. |
| **Sidebar** | Shows (step 6: Set targets) |
| **After all targets** | → Junction |

---

### Phase 11 — JUNCTION (What's next?)

```
 ┌──────────────────────────────────────────────────┐
 │  Blob: "Here's what I'd suggest next"             │
 │                                                    │
 │  ┌─ JUNCTION PANEL (floating) ─────────────────┐  │
 │  │                                              │  │
 │  │  ┌─────────────────────────────────────────┐ │  │
 │  │  │ 🔍 Take a tour of Namuda               │ │  │
 │  │  │    Guided walkthrough                    │ │  │
 │  │  └─────────────────────────────────────────┘ │  │
 │  │                                              │  │
 │  │  ┌═════════════════════════════════════════┐ │  │
 │  │  ║ 📊 Explore process in canvas           ║ │  │
 │  │  ║    Interactive process mining view      ║ │  │
 │  │  ╚═════════════════════════════════════════╝ │  │
 │  │                                              │  │
 │  │  Start improving:                            │  │
 │  │  🔴 Lower rework rate (Critical)             │  │
 │  │  🟠 Reduce throughput (High)                 │  │
 │  │  🟠 Increase conformance (High)              │  │
 │  │  🟡 Improve data quality (Medium)            │  │
 │  │                                              │  │
 │  └──────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **UX type** | Floating modal with multiple path options |
| **Purpose** | Let user choose their next move. Three paths: learn (tour), explore (canvas), or act (goal dive). |
| **Reasoning** | This is a branching point. Canvas is featured (blue border) because it's the primary experience. Tour is for users who want more guidance. Goal-specific paths let power users jump directly to improvement work. |
| **Sidebar** | Shows (step 7: What's next) |

---

### Phase 12+ — EXPLORE

```
 ┌──────────────────────────────────────────────────────┐
 │                                                        │
 │  TOUR → MissionControlOverlay (full-screen)            │
 │         Guided walkthrough of platform capabilities     │
 │                                                        │
 │  CANVAS → CanvasView (full-screen)                     │
 │           Interactive process mining visualization      │
 │           ├─ Node/edge hover → distributions           │
 │           ├─ Click → detail popups                     │
 │           ├─ Shift-click two nodes → segment analysis  │
 │           ├─ Chat with AI context panel                │
 │           └─ Findings discovery flow                   │
 │                                                        │
 │  GOAL DIVE → Finding generation for selected goal      │
 │              Deep analysis of specific improvement      │
 │                                                        │
 └──────────────────────────────────────────────────────────┘
```

---

## UX Building Blocks Reference

| Block | Where Used | Description |
|-------|-----------|-------------|
| **Choice Widget** | Intro, Data, Process type/name, Fact questions, Mission, Review | Claude-style numbered options + "something else" free text. Morphs up from bottom. |
| **Refine Dialogue** | Any "something else" path | Back-and-forth chat within a card. AI proposes refined version, user accepts or tries again. |
| **FieldReviewCard** | Field mapping | Data context (samples, AI interpretation) + accept/refine conversation. |
| **Educational Card** | Core Fields | Animated step-by-step tutorial with progress bar and navigation. |
| **Side Panel** | Data Quality, Process Context, Goals Doc | Live-updating document panel on the left. Narrated by blob. |
| **Floating Modal** | Goals, Targets, Junction, Upload | Centered card for complex multi-option selections. |
| **Document Card** | Review phase | Scrollable document in bottom area with accept/refine choices. |
| **Strategy Animation** | Mission → Goals bridge | Auto-playing SVG visualization showing value chain decomposition. |
| **Blob + Speech** | Everywhere | AI persona narrating, guiding, reacting. Shrinks from 420px to 140px after first interaction. |
| **StepMap** | After data connected | Right sidebar progress indicator. Hides during intro, data, strategy animation, tour, canvas. |

---

## Design Principles

1. **One place for interaction** — Bottom of screen, like Claude. Choice widgets morph up from where the input bar lives.
2. **Namuda proposes, user validates** — Confident single-choice proposals for things Namuda can detect from data. "Something else" always available.
3. **Conversation, not forms** — Back-and-forth refinement instead of binary accept/reject. Namuda restates understanding and asks for confirmation.
4. **Progressive disclosure** — StepMap hidden until committed. Findings introduced with narrative. Strategy shown before goals.
5. **Educational on-rails when needed** — Core fields tutorial and data quality narrative are auto-paced because the concepts need teaching. Everything else is user-paced.
6. **Living documents** — DocPanel and GoalsDocPanel update in real-time as user answers questions. Creates visible progress.
7. **Ceremonial moments** — Mission statement reveal, strategy animation, findings introduction. Key value points get dramatic treatment.
