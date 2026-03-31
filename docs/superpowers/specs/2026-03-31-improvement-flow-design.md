# Improvement Flow — Design Spec

## Overview

The improvement flow is the action phase of Namuda. Users enter from the canvas after collecting findings linked to goals. They work through a structured lean-inspired process — selecting a goal, defining the problem, performing root cause analysis (5 Whys), proposing countermeasures, assigning tasks, and reviewing the complete improvement plan.

The flow follows the existing Namuda UI pattern: floating panels on a canvas background, orb guidance, and inline chat with choice widgets for all interaction.

## Entry Points

- "Start improvement flow" button in the Goals panel (canvas view, appears when 2+ findings stored)
- Future: direct entry from a goal detail view or finding card

## Layout

```
Canvas background (dots, no process map)

LEFT PANEL (absolute, ~480px)         CENTER              RIGHT PANEL (absolute, ~320px)
┌─────────────────────────┐                                ┌─────────────────────────┐
│ Improvement Plan        │           ORB                  │ Supporting Evidence     │
│ (document, builds live) │          blob                  │                         │
│                         │         guides                 │ Contextual visual tied  │
│ § Goal & Findings       │                                │ to current step         │
│ § Problem Statement     │                                │                         │
│ § Root Cause Tree       │                                │ Header: "Evidence for:  │
│ § Countermeasures       │                                │  [current hypothesis]"  │
│ § Tasks                 │                                │                         │
│                         │                                │ [Add to plan] button    │
└─────────────────────────┘                                └─────────────────────────┘

BOTTOM (floating modal, centered, ~540px)
┌──────────────────────────────────────────┐
│ Chat: choice widgets, dialogue, input    │
└──────────────────────────────────────────┘
```

### Panel Behavior

- **Left panel**: Follows the DocPanel pattern (absolute positioned, scrollable, white background with blur). Sections appear one at a time as each step completes. Each section has a subtle "completed" state once confirmed. During review step, entire document is scrollable and editable.
- **Right panel**: Follows the Goals panel pattern (absolute positioned, floating). Content updates contextually based on current step and hypothesis. Shows charts, data comparisons, distributions. Each visual has an "Add to plan" button that embeds it as an evidence card in the left document.
- **Chat modal**: Same floating modal pattern from canvas view. Houses choice widgets, propose/refine dialogue, and text input.
- **Orb**: Center, guides through each step with narration text. Uses thinking/waiting states as in other phases.

## Step Flow

### Step 0 — Select Goal

**Trigger**: User clicks "Start improvement flow" from canvas.

**Orb says**: "Let's turn your findings into action. Which goal do you want to improve?"

**Chat**: Choice widget listing goals that have stored findings:
```
Which goal should we work on?

  1  Reduce throughput time (18.8d → 14d)
     2 findings linked

  2  Lower rework rate (52% → 35%)
     2 findings linked
```

**On select**: Goal is set. Left panel appears with goal header (name, baseline, target). Proceed to step 1.

### Step 1 — Group Findings

**Orb says**: "You have [N] findings for this goal. Let me see how they relate."

**AI logic**: Namuda examines the findings linked to the selected goal and proposes grouping:
- If findings share a causal relationship → suggest combining into one improvement
- If findings are independent → suggest separate improvements

**Chat**: Choice widget with AI's recommendation:
```
These findings look related — blocking often triggers
re-approval. I'd suggest one improvement covering both.

  1  Yes, combine into one improvement
  2  No, treat them separately
  ✎  Something else
```

OR:

```
These findings point to different root causes. I'd
recommend separate improvements, starting with the
bottleneck.

  1  Yes, separate improvements — start with bottleneck
  2  No, I think they're connected
  ✎  Something else
```

**On select**: Findings for this improvement are set. Left panel updates: findings listed under goal header with severity dots and summaries. Proceed to step 2.

### Step 2 — Problem Statement

**Orb says**: "Let me draft a problem statement from these findings."

**Chat**: Propose/refine dialogue (existing RefineDialogue pattern):
- Namuda drafts problem statement synthesizing the selected findings
- Displayed as a proposal card in chat
- User: "Accept" or "I'd frame it differently" → back-and-forth refinement

**Example proposal**:
```
"The Last Confirmation Print step adds an average of 5.7
days to every case, creating the primary bottleneck in
the procurement process and accounting for over 40% of
total throughput time."

  1  This captures the problem
  ✎  I'd frame it differently
```

**Right panel**: Shows a throughput breakdown chart highlighting the bottleneck step.

**On accept**: Problem statement added to left panel document. Proceed to step 3.

### Step 3 — Root Cause Analysis (Why Tree)

This is the core analytical step. Namuda acts as lean coach AND data analyst.

**Orb says**: "Now let's find the root cause. I'll suggest hypotheses — some backed by data, some more speculative. Steer me in the right direction."

**Flow (repeating)**:

1. Namuda asks: "Why does [current cause/problem] happen?"
2. Suggests 2-4 hypotheses as choice widget options:
   - First 1-2 are **data-backed**: labeled with "(data)" tag, right panel shows evidence visual with header "Evidence for: [hypothesis text]"
   - Next 1-2 are **speculative**: labeled with "(hypothesis)" tag
   - "Tell me something else" for user's own theory
3. User picks one, refines, or provides their own
4. Selected answer becomes the next level's subject
5. Repeat until root cause emerges

**Example — Level 1**:
```
Why does the confirmation print take 5.7 days?

  1  Manual verification is required for each order (data)
     92% of cases go through manual path

  2  Waiting for vendor response before confirmation (data)
     Avg 3.2d wait when vendor involved

  3  Understaffing in confirmation department (hypothesis)

  ✎  Tell me something else
```

Right panel shows: pie chart "Confirmation path breakdown: 92% manual / 8% automated" with "Add to plan" button.

**Example — Level 3 (getting speculative)**:
```
Why are there no automated validation rules?

  1  Legacy ERP doesn't support rule-based confirmation (hypothesis)

  2  Automation was never prioritized — impact wasn't visible (hypothesis)

  3  Product specs too complex for rule-based validation (hypothesis)

  ✎  Tell me something else
```

Right panel: may show a comparison chart "Sites with partial automation vs without" if data exists, or be empty for purely speculative levels.

**Root cause proposal**: When Namuda judges sufficient depth (typically 3-5 levels), it proposes a root cause:

```
Based on the analysis chain, the root cause appears to be:

"Lack of process visibility prevented prioritization of
confirmation automation, leaving a manual bottleneck
that adds 5.7d to every case."

  1  That captures it
  ✎  I'd refine the root cause statement
```

**Left panel (live)**: The why tree builds as a hierarchy:
```
Root Cause Analysis
├─ 5.7d confirmation bottleneck
│  └─ Manual verification required (92% manual — data)
│     └─ No automated validation rules
│        └─ Automation never prioritized
│           └─ ROOT CAUSE: No process visibility
```

Each node shows its label + evidence tag if data-backed. Evidence visuals that were "added to plan" appear inline next to their node.

**On root cause confirmed**: Full tree locked into plan document. Proceed to step 4.

### Step 4 — Countermeasures

**Orb says**: "Based on the root cause, here are countermeasures I'd recommend."

**Chat**: Multi-select card (similar to GoalsPanel toggle pattern):
```
Select countermeasures to include:

  ☑ 1  Implement automated validation rules
       for standard product specs
       Impact: High  |  Effort: Medium

  ☑ 2  Create fast-track path for repeat
       orders (skip full confirmation)
       Impact: Medium  |  Effort: Low

  ☐ 3  Add real-time bottleneck dashboard
       for operations team
       Impact: Medium  |  Effort: High

  ✎  Add your own countermeasure

  [Accept selected]
```

Pre-selected based on impact/effort ratio. User can toggle and add custom ones.

**Right panel**: Shows impact projection — "Expected impact on throughput time: -2.3 days (18.8d → 16.5d)" with a before/after bar chart.

**On accept**: Selected countermeasures added to plan. Proceed to step 5.

### Step 5 — Task Assignment

**Orb says**: "Let's break these into actionable tasks."

For each selected countermeasure, Namuda suggests a task breakdown:

**Chat**: Inline form-like interaction per countermeasure:
```
Countermeasure: "Implement automated validation rules"

Suggested tasks:

  Task 1: Define validation rule specifications
  Assign to: [_______________]
  Due date:  [_______________]

  Task 2: Configure rules in ERP system
  Assign to: [_______________]
  Due date:  [_______________]

  [+ Add another task]
  [Save and continue]
```

This is the first use of form-style inputs in the flow — appropriate for structured data entry. Each task is a simple name + owner + date.

**On save**: Tasks added under their countermeasure in the plan document. Repeat for each countermeasure, then proceed to step 6.

### Step 6 — Review & Save

**Orb says**: "Here's your complete improvement plan. Scroll through it, and let me know if anything needs changing."

**Left panel**: Full document is now scrollable with all sections:
- Goal header (name, baseline → target)
- Findings (with severity)
- Problem statement
- Root cause tree (with evidence)
- Countermeasures (with impact/effort)
- Tasks (with owners and dates)
- Expected impact summary

**Chat**:
```
Your improvement plan is ready.

  1  Save improvement
  ✎  Make changes
```

"Make changes" → user can click any section in the left panel to edit, or type what they want to change in chat. Namuda helps refine.

"Save improvement" → plan is saved, orb celebrates briefly, then:
```
Improvement saved! What's next?

  1  Back to canvas — keep exploring
  2  Start another improvement
```

## Right Panel — Supporting Evidence Detail

The right panel is context-aware and updates based on the current step:

| Step | Right Panel Content |
|------|-------------------|
| Step 0 (Select Goal) | Goal progress overview — baseline vs target |
| Step 1 (Group Findings) | Finding detail cards with key metrics |
| Step 2 (Problem Statement) | Throughput/bottleneck visualization |
| Step 3 (Root Cause) | Evidence visual tied to current hypothesis. Updates as user navigates hypotheses. Header: "Evidence for: [hypothesis text]" |
| Step 4 (Countermeasures) | Impact projection chart |
| Step 5 (Tasks) | Timeline/Gantt preview of assigned tasks |
| Step 6 (Review) | Impact summary dashboard |

Each visual has an **"Add to plan"** button. When clicked:
- Visual is embedded as a compact evidence card in the left panel document
- Button changes to "Added ✓"
- In the plan document, evidence cards appear inline near the relevant section

Evidence visuals are simulated/pre-built charts using SVG (consistent with canvas node popup charts).

## State Management

```javascript
// New state for improvement flow (in App or dedicated component)
const [improvementStep, setImprovementStep] = useState(0);
const [selectedGoal, setSelectedGoal] = useState(null);
const [improvementFindings, setImprovementFindings] = useState([]);
const [problemStatement, setProblemStatement] = useState("");
const [whyTree, setWhyTree] = useState([]);
// Each node: { level, question, answer, evidenceTag, evidenceVisual?, children? }
const [rootCause, setRootCause] = useState("");
const [counterMeasures, setCounterMeasures] = useState([]);
// Each: { id, desc, impact, effort, selected, tasks: [{name, owner, dueDate}] }
const [evidenceCards, setEvidenceCards] = useState([]);
// Each: { id, section, chartType, title, data }
const [improvementPlanSaved, setImprovementPlanSaved] = useState(false);
```

## Pre-built Data

Since this is a prototype, all AI responses, hypotheses, evidence visuals, and countermeasures are pre-scripted data keyed to the demo findings. The structure supports future real AI integration.

### Why Tree Data (per finding)

Each level maps the selected option key to the next level's question and options. This allows branching — different user choices lead to different follow-up questions. For the prototype, we script the "happy path" (first option at each level) fully, with 1-2 alternate branches.

```javascript
const WHY_TREE_DATA = {
  "bottleneck-lcp": [
    {
      question: "Why does the confirmation print take 5.7 days?",
      options: [
        { key: "manual", label: "Manual verification required for each order", tag: "data", evidence: "path-breakdown", desc: "92% of cases go through manual path" },
        { key: "vendor", label: "Waiting for vendor response before confirmation", tag: "data", evidence: "vendor-wait", desc: "Avg 3.2d wait when vendor involved" },
        { key: "staff", label: "Understaffing in confirmation department", tag: "hypothesis" },
      ],
    },
    {
      // Next level keyed to previous selection
      "manual": {
        question: "Why is manual verification required?",
        options: [
          { key: "no-rules", label: "No automated validation rules exist", tag: "data", evidence: "site-comparison", desc: "Sites with automation: 1.2d vs without: 5.7d" },
          { key: "complex-specs", label: "Product specifications too complex for automation", tag: "hypothesis" },
          { key: "compliance", label: "Regulatory compliance requires human sign-off", tag: "hypothesis" },
        ],
      },
      "vendor": { question: "Why does vendor response take so long?", options: [...] },
      "staff": { question: "Why is the department understaffed?", options: [...] },
    },
    // ... deeper levels follow same pattern
  ],
};
```

### Evidence Visuals (pre-built SVG charts)

```javascript
const EVIDENCE_VISUALS = {
  "path-breakdown": { title: "Confirmation path breakdown", type: "pie", data: { manual: 92, automated: 8 } },
  "vendor-wait": { title: "Vendor response time distribution", type: "histogram", data: [...] },
  "site-comparison": { title: "Throughput by site", type: "bar", data: [...] },
  // ...
};
```

## Component Structure

The improvement flow is a new view component (like CanvasView) rendered when phase === "improvement":

```
ImprovementView
  ├─ ImprovementPlanPanel (left) — document building live
  ├─ EvidencePanel (right) — contextual supporting visuals
  ├─ Blob + BlobSpeech (center) — orb guidance
  └─ Chat modal (bottom) — choice widgets, dialogue, input
```

Uses existing components: ChoiceWidget, RefineDialogue, Blob, BlobSpeech, DotBackground.

## Transitions

- **Canvas → Improvement**: phase changes from "canvas" to "improvement". Process map disappears, improvement layout appears with fade animation.
- **Improvement → Canvas**: On save or "back to canvas", phase changes back. Canvas re-renders with process map.
- **Between steps**: Smooth transitions — left panel sections fade in as added, right panel cross-fades between evidence visuals, orb text updates with standard transition.
