# Plan: Canvas → Findings → Improvement Flow

## The Big Picture

The canvas is where analysis happens. The improvement flow is where action happens. The bridge between them is **Findings** — data-backed insights discovered during canvas exploration. When enough Findings are collected and refined, Namuda guides the user into creating their first **Improvement** — a structured action plan.

```
CANVAS EXPLORATION
    │
    ├── Explore process map (nodes, edges, segments)
    ├── Chat with Namuda about patterns
    ├── Discover Findings (AI-triggered or user-triggered)
    ├── Refine and store Findings
    │
    ▼ (enough Findings collected)

IMPROVEMENT FLOW (new)
    │
    ├── 1. Select Finding to act on
    ├── 2. Problem Statement — Namuda drafts, user refines
    ├── 3. 5 Whys Root Cause Analysis — guided conversation
    ├── 4. Counter Measures — Namuda proposes, user selects
    ├── 5. Task Assignment — assign to people, set deadlines
    ├── 6. Save Improvement
    │
    ▼

BACK TO CANVAS (or next improvement)
```

## Current State (what exists)

### Canvas has:
- Process map with 6 nodes, 12 edges
- Click popups with throughput distributions, rework rates
- Shift-click segment analysis
- AI chat (pattern matching, 6 response patterns)
- Finding trigger (after 3 messages or "improve" keyword)
- ONE finding: "Confirmation print bottleneck with rework amplification"
- Store finding button → local state only, no callback to App

### Canvas is missing:
- **Goals visibility** — user can't see their goals while exploring
- **Guided first interaction** — user lands cold, no guidance
- **Multiple findings** — only one finding, triggered once
- **Finding collection** — no way to accumulate and review findings
- **Transition to improvement** — "improvement flow when you're ready" but no implementation

## The Plan

### Phase 1: Goals Panel in Canvas

Add a collapsible goals panel to the canvas view. Shows the tree map (mission + goals) in a floating side panel that the user can toggle.

**Implementation:**
- Add a "Goals" toggle button in the top-right of canvas (near the KPI bar)
- When expanded: shows a compact version of GoalsTreeMap as a floating panel
- Default: collapsed after first 5 seconds (auto-collapse)
- Goals relevant to current findings get highlighted

### Phase 2: Guided First Canvas Interaction

When user enters canvas for the first time, Namuda guides them:

```
[Blob orb pulses]
"I've highlighted the biggest bottleneck in your process.
 Click on 'Last Confirmation Print' to explore it."
    ↓
[User clicks node]
    ↓
"This node adds 5.7 days on average. See the distribution
 on the left? Most cases take 4-7 days here."
    ↓
"Now try asking me: 'Why is this a bottleneck?'"
    ↓
[User types question]
    ↓
[AI responds + triggers first Finding]
```

**Implementation:**
- Add `canvasGuideStep` state (0=initial, 1=highlighted, 2=clicked, 3=asked, 4=done)
- Highlight "Last Confirmation Print" node with pulsing border
- Mutter bubble points to the node instead of generic messages
- After first finding is stored, guide step = done

### Phase 3: Finding Collection System

Replace the single-finding system with a collection that accumulates:

```javascript
const CANVAS_FINDINGS = [
  { id: "bottleneck-lcp", title: "Confirmation print bottleneck", severity: "High", ... },
  { id: "rework-approved", title: "Approval rework loop", severity: "High", ... },
  { id: "blocked-volume", title: "Excessive blocking rate", severity: "Medium", ... },
  { id: "site-variance", title: "Cross-site performance gap", severity: "Medium", ... },
];
```

**Implementation:**
- `storedFindings` state array (instead of boolean)
- Different findings triggered by different chat topics
- Findings panel in chat shows count badge: "3 Findings stored"
- Each finding can be expanded/collapsed
- User can manually trigger "I think I see a pattern" to create custom finding

### Phase 4: Improvement Prompt

After 2+ findings are stored, Namuda prompts:

```
"You've collected 3 Findings. That's a strong evidence base.
 Want to create your first Improvement? I'll guide you through
 building an action plan."

[Start improvement flow] / [Keep exploring]
```

**Implementation:**
- Trigger when `storedFindings.length >= 2`
- Show prompt as a special chat message with CTA
- "Start improvement flow" transitions to improvement phase

### Phase 5: Improvement Flow (New Phase)

This is a new phase (`phase: "improvement"`) that replaces the canvas view with a structured flow. The blob guides through each step.

#### Step 1: Select Finding
```
┌─────────────────────────────────────────┐
│  Which Finding should we act on?         │
│                                           │
│  ┌─ Finding Card ──────────────────────┐ │
│  │ 🔴 Confirmation print bottleneck    │ │
│  │    5.7d avg, affects all cases      │ │
│  │    [Select this one]                │ │
│  └─────────────────────────────────────┘ │
│  ┌─ Finding Card ──────────────────────┐ │
│  │ 🔴 Approval rework loop             │ │
│  │    10,009 cases, adds 1.5d each     │ │
│  │    [Select this one]                │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Step 2: Problem Statement
Namuda drafts a problem statement based on the finding. User can refine.

```
Blob: "Let me draft a problem statement from this finding."

┌─ Problem Statement (bottom area) ────────┐
│ "The Last Confirmation Print step adds    │
│  an average of 5.7 days to every case,   │
│  creating the primary bottleneck in the   │
│  procurement process."                    │
│                                           │
│  1  This captures the problem             │
│  ✎  I'd frame it differently             │
└──────────────────────────────────────────┘
```

#### Step 3: 5 Whys Root Cause Analysis
Guided conversation — Namuda asks "Why?" 5 times, each time the user explains or picks from suggestions.

```
Blob: "Now let's find the root cause. I'll ask 'Why?' five times."

Why 1: "Why does Last Confirmation Print take 5.7 days?"
  → [Manual verification required] / [Waiting for vendor response] / [Tell me]

Why 2: "Why is manual verification required?"
  → [No automated validation rules] / [Complex product specs] / [Tell me]

Why 3: "Why are there no automated validation rules?"
  → [Legacy system limitations] / [Never been prioritized] / [Tell me]

Why 4: "Why has automation never been prioritized?"
  → [Lack of visibility into the impact] / [Budget constraints] / [Tell me]

Why 5: "Why was there lack of visibility?"
  → [No process mining before Namuda] / [Data not connected] / [Tell me]

Root cause identified: "Lack of process visibility prevented
prioritization of confirmation automation."
```

Each "Why" level is a choice widget in the bottom area. A visual "5 Whys" stack builds in the scroll lane showing the chain.

#### Step 4: Counter Measures
Namuda proposes 2-3 counter measures based on the root cause.

```
Blob: "Based on the root cause, here are counter measures I'd recommend."

┌─ Counter Measures ──────────────────────┐
│ ☑ 1  Implement automated validation     │
│      rules for standard product specs    │
│      Impact: High  Effort: Medium        │
│                                           │
│ ☑ 2  Create fast-track path for          │
│      repeat orders (skip full confirm)   │
│      Impact: Medium  Effort: Low         │
│                                           │
│ ☐ 3  Add real-time bottleneck dashboard  │
│      for operations team                 │
│      Impact: Medium  Effort: High        │
│                                           │
│  [Accept selected] [Skip]                │
└──────────────────────────────────────────┘
```

#### Step 5: Task Assignment
For each selected counter measure, create tasks and assign to people.

```
┌─ Task Assignment (bottom area) ─────────┐
│ Counter measure: "Implement automated    │
│ validation rules"                        │
│                                           │
│ Task: "Define validation rule specs"     │
│ Assign to: [_____________]               │
│ Due date:  [_____________]               │
│                                           │
│ Task: "Configure rules in ERP"           │
│ Assign to: [_____________]               │
│ Due date:  [_____________]               │
│                                           │
│  1  Save and continue                    │
│  ✎  Add another task                     │
└──────────────────────────────────────────┘
```

#### Step 6: Save Improvement
Summary card showing the full improvement, then save.

```
┌─ Improvement Summary (scroll lane) ─────┐
│ IMPROVEMENT #1                           │
│ ──────────────────────────────────────── │
│ Finding: Confirmation print bottleneck   │
│ Problem: "The LCP step adds 5.7d..."    │
│ Root cause: "Lack of process visibility" │
│                                           │
│ Counter measures:                        │
│ ✓ Automated validation rules             │
│   → Task: Define specs (John, Apr 15)    │
│   → Task: Configure ERP (Sara, May 1)    │
│ ✓ Fast-track for repeat orders           │
│   → Task: Design workflow (John, Apr 20) │
│                                           │
│ Goal: Reduce throughput time (18.8→14d)  │
│ Expected impact: -2.3 days               │
│ ──────────────────────────────────────── │
│  1  Save improvement                     │
│  ✎  Make changes                         │
└──────────────────────────────────────────┘
```

After saving → return to canvas for more exploration, or start another improvement.

## Implementation Order

1. **Extend finding data** — add 3 more findings, keyed to different chat topics
2. **Finding collection** — `storedFindings` array state, badge in chat
3. **Goals panel toggle** in canvas top bar
4. **Guided first interaction** — highlight bottleneck, mutter points to it
5. **Improvement prompt** — after 2+ findings, show CTA in chat
6. **Improvement flow** — new phase with 6 steps:
   - Step 1: Finding selection (choice widget)
   - Step 2: Problem statement (propose/refine)
   - Step 3: 5 Whys (sequential choice widgets with visual stack)
   - Step 4: Counter measures (multi-select)
   - Step 5: Task assignment (form-like input)
   - Step 6: Summary + save (document card)
7. **Return to canvas** after save

## UX Patterns Used

| Step | Pattern | Reasoning |
|------|---------|-----------|
| Finding selection | Choice widget | Simple selection from accumulated list |
| Problem statement | Propose/refine | Namuda drafts, user validates — consistent pattern |
| 5 Whys | Sequential choices | Each "Why" is a question with suggested answers + custom |
| Counter measures | Multi-select card | Like GoalsPanel — pre-selected, can deselect |
| Task assignment | Form inputs | First use of form inputs — appropriate for structured data |
| Summary | Document card | Like review phase — scrollable, accept/refine |

## State Management

New state variables needed:
```javascript
const [storedFindings, setStoredFindings] = useState([]); // collected findings
const [improvementStep, setImprovementStep] = useState(0); // 0-6
const [currentImprovement, setCurrentImprovement] = useState(null); // building improvement
const [whyChain, setWhyChain] = useState([]); // 5 whys answers
const [selectedCounterMeasures, setSelectedCounterMeasures] = useState([]);
const [tasks, setTasks] = useState([]); // assigned tasks
```

## Timeline Estimate

This is a large feature. Suggested breakdown:
- **v8.1**: Finding collection + goals panel in canvas (foundation)
- **v8.2**: Guided first interaction + improvement prompt
- **v8.3**: Improvement flow steps 1-3 (finding → problem → 5 whys)
- **v8.4**: Improvement flow steps 4-6 (measures → tasks → save)
- **v8.5**: Return to canvas + polish
