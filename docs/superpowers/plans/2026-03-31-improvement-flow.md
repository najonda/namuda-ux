# Improvement Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 6-step lean-inspired improvement flow that turns canvas findings into structured improvement plans with root cause analysis, countermeasures, and task assignment.

**Architecture:** New `ImprovementView` component rendered when `phase === "improvement"`. State lifted from CanvasView to App for `storedFindings`. Reuses existing ChoiceWidget, RefineDialogue, Blob, BlobSpeech, DotBackground. Left panel (ImprovementPlanPanel) builds a document live. Right panel (EvidencePanel) shows contextual visuals. Chat modal at bottom drives all interaction.

**Tech Stack:** React (single-file JSX), inline styles, SVG charts, existing component library in namuda-flow-v8.jsx

**Spec:** `docs/superpowers/specs/2026-03-31-improvement-flow-design.md`

---

## File Structure

All changes are in a single file: `namuda-flow-v8.jsx`

| Location | Responsibility |
|----------|---------------|
| Lines ~2660-2677 (CANVAS_FINDINGS) | Extend with why-tree data, evidence visuals, countermeasure data |
| Lines ~2687-3626 (CanvasView) | Wire "Start improvement flow" button, lift storedFindings to props |
| Lines ~3962-3996 (App state) | Add storedFindings state, improvement phase state, pass props |
| Lines ~4791 (App render) | Add ImprovementView rendering for phase === "improvement" |
| New: after CanvasView (~line 3627) | ImprovementView component, ImprovementPlanPanel, EvidencePanel |

---

## Task 1: Lift storedFindings State from CanvasView to App

The improvement flow needs access to stored findings. Currently they're local to CanvasView (line 2698). Lift them to App and pass down as props.

**Files:**
- Modify: `namuda-flow-v8.jsx:2687-2700` (CanvasView signature + state)
- Modify: `namuda-flow-v8.jsx:3962-3996` (App state)
- Modify: `namuda-flow-v8.jsx:4791` (CanvasView rendering)

- [ ] **Step 1: Add storedFindings state to App**

In App component (line ~3996, after `mappedFields`), add:

```javascript
const [storedFindings, setStoredFindings] = useState([]); // finding IDs stored from canvas
```

- [ ] **Step 2: Pass storedFindings as props to CanvasView**

Change line 4791 from:
```javascript
{phase === "canvas" && <CanvasView />}
```
to:
```javascript
{phase === "canvas" && <CanvasView storedFindings={storedFindings} setStoredFindings={setStoredFindings} onStartImprovement={() => setPhase("improvement")} />}
```

- [ ] **Step 3: Update CanvasView to accept props instead of local state**

Change line 2687 from:
```javascript
function CanvasView() {
```
to:
```javascript
function CanvasView({ storedFindings, setStoredFindings, onStartImprovement }) {
```

Remove the local storedFindings state declaration (line 2698):
```javascript
// DELETE: const [storedFindings, setStoredFindings] = useState([]);
```

- [ ] **Step 4: Wire the "Start improvement flow" button**

At line ~3415, change the button from having no onClick to:
```javascript
<button onClick={onStartImprovement} style={{
  padding: "6px 16px", fontSize: 11, fontWeight: 600,
  background: T.accent.blue, color: T.text.inverse,
  border: "none", borderRadius: T.radius.sm, cursor: "pointer",
  fontFamily: T.font,
}}>Start improvement flow</button>
```

- [ ] **Step 5: Build and verify no regressions**

Run: `npx vite build`
Expected: Build succeeds. Canvas view works identically — findings still store under goals, button now triggers phase change.

- [ ] **Step 6: Commit**

```bash
git add namuda-flow-v8.jsx
git commit -m "Lift storedFindings state to App, wire improvement flow entry"
```

---

## Task 2: Add Pre-built Data for Improvement Flow

All the scripted AI content — why trees, evidence visuals, countermeasures, problem statements — keyed to the demo findings.

**Files:**
- Modify: `namuda-flow-v8.jsx` — add data constants after CANVAS_FINDINGS (after line ~2677)

- [ ] **Step 1: Add WHY_TREE_DATA constant**

Insert after the CANVAS_FINDINGS array (after line 2677):

```javascript
/* ═══ IMPROVEMENT FLOW DATA ═══ */

const WHY_TREE_DATA = {
  "bottleneck-lcp": [
    {
      question: "Why does the confirmation print take 5.7 days?",
      options: [
        { key: "manual", label: "Manual verification is required for each order", tag: "data", evidence: "path-breakdown", desc: "92% of cases go through manual path" },
        { key: "vendor", label: "Waiting for vendor response before confirmation", tag: "data", evidence: "vendor-wait", desc: "Avg 3.2d wait when vendor is involved" },
        { key: "staff", label: "Understaffing in confirmation department", tag: "hypothesis" },
      ],
      next: {
        "manual": {
          question: "Why is manual verification required?",
          options: [
            { key: "no-rules", label: "No automated validation rules exist", tag: "data", evidence: "site-comparison", desc: "Sites with partial automation: 1.2d vs 5.7d" },
            { key: "complex", label: "Product specifications too complex for automation", tag: "hypothesis" },
            { key: "compliance", label: "Regulatory compliance requires human sign-off", tag: "hypothesis" },
          ],
          next: {
            "no-rules": {
              question: "Why are there no automated validation rules?",
              options: [
                { key: "legacy", label: "Legacy ERP doesn't support rule-based confirmation", tag: "hypothesis" },
                { key: "priority", label: "Automation was never prioritized — impact wasn't visible", tag: "hypothesis" },
                { key: "specs", label: "Product specs too varied for a rule set", tag: "hypothesis" },
              ],
              next: {
                "legacy": {
                  question: "Why hasn't the ERP been updated?",
                  options: [
                    { key: "cost", label: "Upgrade costs deemed too high relative to perceived benefit", tag: "hypothesis" },
                    { key: "risk", label: "Fear of disrupting a working system", tag: "hypothesis" },
                  ],
                  rootCause: "Legacy ERP limitations combined with lack of visibility into the bottleneck's true cost prevented automation investment.",
                },
                "priority": {
                  question: "Why wasn't the impact visible?",
                  options: [
                    { key: "no-pm", label: "No process mining — impact was invisible", tag: "data", evidence: "throughput-trend", desc: "Problem growing 12% year-over-year" },
                    { key: "silos", label: "Teams measured in silos — no end-to-end view", tag: "hypothesis" },
                  ],
                  rootCause: "Lack of end-to-end process visibility prevented prioritization of confirmation automation, leaving a manual bottleneck that adds 5.7d to every case.",
                },
                "specs": {
                  question: "Why are product specs so varied?",
                  options: [
                    { key: "custom", label: "High proportion of custom orders", tag: "data", evidence: "order-type-breakdown", desc: "62% custom vs 38% standard" },
                    { key: "legacy-cat", label: "Legacy product catalog never consolidated", tag: "hypothesis" },
                  ],
                  rootCause: "High product customization rate (62%) combined with no standardized validation framework makes automation infeasible without catalog consolidation.",
                },
              },
            },
            "complex": {
              question: "Why are specs too complex for automation?",
              options: [
                { key: "custom", label: "High custom order rate with unique requirements", tag: "data", evidence: "order-type-breakdown", desc: "62% custom orders" },
                { key: "docs", label: "Specifications not machine-readable", tag: "hypothesis" },
              ],
              rootCause: "Product specifications lack machine-readable structure, preventing rule-based validation of the 62% custom orders.",
            },
            "compliance": {
              question: "Why does compliance require human sign-off?",
              options: [
                { key: "regulation", label: "Industry regulation mandates manual approval", tag: "hypothesis" },
                { key: "internal", label: "Internal policy — never re-evaluated", tag: "hypothesis" },
              ],
              rootCause: "Outdated internal compliance policy requires human sign-off without evidence that regulation mandates it.",
            },
          },
        },
        "vendor": {
          question: "Why does vendor response take 3.2 days on average?",
          options: [
            { key: "no-portal", label: "No self-service portal — all communication via email", tag: "data", evidence: "vendor-channels", desc: "94% of vendor interactions are email" },
            { key: "batching", label: "Vendors batch responses weekly", tag: "hypothesis" },
          ],
          rootCause: "Vendor communication relies on manual email (94% of interactions) with no automated tracking or escalation, creating a 3.2d information bottleneck.",
        },
        "staff": {
          question: "Why is the department understaffed?",
          options: [
            { key: "turnover", label: "High turnover due to repetitive manual work", tag: "hypothesis" },
            { key: "budget", label: "Headcount frozen as cost-cutting measure", tag: "hypothesis" },
          ],
          rootCause: "Headcount constraints combined with repetitive manual work drive turnover, creating a staffing bottleneck in the confirmation department.",
        },
      },
    },
  ],
  "rework-approved": [
    {
      question: "Why do 10,009 cases cycle back through approval?",
      options: [
        { key: "spec-change", label: "Specification changes after initial approval", tag: "data", evidence: "rework-trigger", desc: "73% of rework triggered by spec changes" },
        { key: "vendor-mod", label: "Vendor modifications require re-approval", tag: "data", evidence: "vendor-rework", desc: "2,800 cases from vendor-initiated changes" },
        { key: "error", label: "Data entry errors caught after approval", tag: "hypothesis" },
      ],
      next: {
        "spec-change": {
          question: "Why do specifications change after approval?",
          options: [
            { key: "late-req", label: "Customer requirements arrive late in process", tag: "data", evidence: "req-timing", desc: "41% of changes within 48h of approval" },
            { key: "incomplete", label: "Initial spec capture is incomplete", tag: "hypothesis" },
            { key: "design-change", label: "Design team iterates post-approval", tag: "hypothesis" },
          ],
          next: {
            "late-req": {
              question: "Why do customer requirements arrive late?",
              options: [
                { key: "no-gate", label: "No hard gate — orders accepted without complete specs", tag: "data", evidence: "completeness-check", desc: "Only 28% of orders have complete specs at approval" },
                { key: "sales", label: "Sales promises delivery before specs are finalized", tag: "hypothesis" },
              ],
              rootCause: "No completeness gate at order entry — only 28% of orders have complete specifications at approval, causing predictable rework when missing details surface.",
            },
            "incomplete": {
              question: "Why is initial spec capture incomplete?",
              options: [
                { key: "form", label: "Order form doesn't enforce required fields", tag: "hypothesis" },
                { key: "training", label: "Sales team not trained on technical requirements", tag: "hypothesis" },
              ],
              rootCause: "Order entry process lacks mandatory field validation, allowing incomplete specifications to enter the workflow and trigger rework at approval.",
            },
            "design-change": {
              question: "Why does design iterate post-approval?",
              options: [
                { key: "parallel", label: "Design and procurement run in parallel, not sequence", tag: "hypothesis" },
                { key: "feedback", label: "Approval feedback triggers design improvements", tag: "hypothesis" },
              ],
              rootCause: "Parallel design-procurement workflow means design changes naturally arrive after procurement approval, requiring re-approval cycles.",
            },
          },
        },
        "vendor-mod": {
          question: "Why do vendors modify orders post-approval?",
          options: [
            { key: "availability", label: "Material availability changes after order", tag: "data", evidence: "vendor-changes", desc: "58% of vendor changes are substitutions" },
            { key: "pricing", label: "Price renegotiation triggers spec adjustments", tag: "hypothesis" },
          ],
          rootCause: "Material substitutions (58% of vendor changes) are not pre-approved, forcing each substitution through the full re-approval cycle.",
        },
        "error": {
          question: "Why are data entry errors caught post-approval?",
          options: [
            { key: "no-validation", label: "No real-time validation at data entry", tag: "hypothesis" },
            { key: "manual", label: "Manual data entry from paper/email sources", tag: "hypothesis" },
          ],
          rootCause: "Lack of real-time validation at data entry allows errors to propagate to approval stage before detection.",
        },
      },
    },
  ],
  "blocked-volume": [
    {
      question: "Why do 68% of cases pass through Blocked status?",
      options: [
        { key: "missing-info", label: "Missing information triggers automatic blocking", tag: "data", evidence: "block-reasons", desc: "45% blocked for missing documents" },
        { key: "credit", label: "Credit hold on vendor or customer", tag: "data", evidence: "credit-blocks", desc: "28% blocked for credit reasons" },
        { key: "inventory", label: "Stock unavailability triggers block", tag: "hypothesis" },
      ],
      next: {
        "missing-info": {
          question: "Why is information missing at the blocking point?",
          options: [
            { key: "upstream", label: "Upstream steps don't collect required documents", tag: "data", evidence: "doc-completeness", desc: "Only 35% document-complete at approval" },
            { key: "timing", label: "Documents not available until later in process", tag: "hypothesis" },
          ],
          rootCause: "Document collection is not enforced upstream — only 35% of cases are document-complete at approval, guaranteeing most cases hit a blocking step.",
        },
        "credit": {
          question: "Why do credit holds block so many cases?",
          options: [
            { key: "threshold", label: "Credit check thresholds too aggressive", tag: "hypothesis" },
            { key: "stale", label: "Credit ratings not updated regularly", tag: "hypothesis" },
          ],
          rootCause: "Credit evaluation process uses stale data and aggressive thresholds, blocking cases that would pass with current information.",
        },
        "inventory": {
          question: "Why does stock unavailability trigger blocks?",
          options: [
            { key: "forecast", label: "Poor demand forecasting", tag: "hypothesis" },
            { key: "lead-time", label: "Long supplier lead times not accounted for", tag: "hypothesis" },
          ],
          rootCause: "Stock checks at order creation don't account for supplier lead times, causing orders to block when inventory isn't available at fulfillment time.",
        },
      },
    },
  ],
  "site-variance": [
    {
      question: "Why is there a 4.4x throughput gap between best and worst sites?",
      options: [
        { key: "process", label: "Different sites use different process variants", tag: "data", evidence: "site-variants", desc: "PM1 uses 3 variants, PN1 uses 47 variants" },
        { key: "volume", label: "Volume differences affect efficiency", tag: "data", evidence: "site-volume", desc: "PM1: 8,200 cases vs PN1: 420 cases" },
        { key: "staffing", label: "Staffing levels differ significantly", tag: "hypothesis" },
      ],
      next: {
        "process": {
          question: "Why do sites use different process variants?",
          options: [
            { key: "no-standard", label: "No standardized process across sites", tag: "data", evidence: "variant-overlap", desc: "Only 12% variant overlap between sites" },
            { key: "local", label: "Local adaptations accumulated over years", tag: "hypothesis" },
          ],
          rootCause: "No process standardization governance — sites independently evolved their workflows, creating 47 variants at worst-performing sites vs 3 at best.",
        },
        "volume": {
          question: "Why does lower volume correlate with slower throughput?",
          options: [
            { key: "batch", label: "Low-volume sites batch work instead of continuous flow", tag: "hypothesis" },
            { key: "expertise", label: "Less practice means less expertise", tag: "hypothesis" },
          ],
          rootCause: "Low-volume sites batch process work into weekly cycles rather than continuous flow, adding wait time that doesn't exist at high-volume sites.",
        },
        "staffing": {
          question: "Why do staffing levels differ?",
          options: [
            { key: "allocation", label: "Staff allocated by headcount, not workload", tag: "hypothesis" },
            { key: "retention", label: "Remote sites have higher turnover", tag: "hypothesis" },
          ],
          rootCause: "Staff allocation follows historical headcount rather than actual workload, leaving under-resourced sites with longer queue times.",
        },
      },
    },
  ],
};

const PROBLEM_STATEMENTS = {
  "bottleneck-lcp": "The Last Confirmation Print step adds an average of 5.7 days to every case, creating the primary bottleneck in the procurement process and accounting for over 40% of total throughput time.",
  "rework-approved": "The approval rework loop forces 10,009 cases through re-approval at 1.5 days per cycle, adding an average of 3.2 days to throughput and inflating the 52% rework rate.",
  "blocked-volume": "68% of all cases pass through a Blocked status with a self-loop averaging 7.0 hours per cycle, creating a systemic chokepoint driven by incomplete upstream information.",
  "site-variance": "A 4.4x throughput gap between the best-performing site (PM1 at 7.7d) and worst-performing site (PN1 at 34d) indicates significant process standardization opportunities.",
};

const EVIDENCE_VISUALS = {
  "path-breakdown": {
    title: "Confirmation path breakdown",
    contextLabel: "Manual verification is required",
    type: "bar",
    data: [{ label: "Manual", value: 92, color: "#d4685a" }, { label: "Automated", value: 8, color: "#7bc67e" }],
    unit: "%",
  },
  "vendor-wait": {
    title: "Vendor response time",
    contextLabel: "Waiting for vendor response",
    type: "histogram",
    data: [2, 5, 12, 22, 35, 28, 15, 8, 4, 2],
    labels: ["0d", "1d", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d+"],
    unit: "cases",
  },
  "site-comparison": {
    title: "Throughput: automated vs manual sites",
    contextLabel: "No automated validation rules exist",
    type: "bar",
    data: [{ label: "With automation", value: 1.2, color: "#7bc67e" }, { label: "Without", value: 5.7, color: "#d4685a" }],
    unit: "days",
  },
  "throughput-trend": {
    title: "Confirmation time trend (3 years)",
    contextLabel: "Impact was invisible",
    type: "line",
    data: [4.2, 4.5, 4.8, 5.0, 5.2, 5.4, 5.5, 5.7],
    labels: ["Q1'24", "Q2'24", "Q3'24", "Q4'24", "Q1'25", "Q2'25", "Q3'25", "Q4'25"],
    unit: "days",
  },
  "order-type-breakdown": {
    title: "Order type distribution",
    contextLabel: "High custom order rate",
    type: "bar",
    data: [{ label: "Custom", value: 62, color: "#e8a040" }, { label: "Standard", value: 38, color: "#7bc67e" }],
    unit: "%",
  },
  "vendor-channels": {
    title: "Vendor communication channels",
    contextLabel: "All communication via email",
    type: "bar",
    data: [{ label: "Email", value: 94, color: "#d4685a" }, { label: "Portal", value: 4, color: "#7bc67e" }, { label: "Phone", value: 2, color: "#b4bcc8" }],
    unit: "%",
  },
  "rework-trigger": {
    title: "Rework triggers",
    contextLabel: "Specification changes after approval",
    type: "bar",
    data: [{ label: "Spec change", value: 73, color: "#d4685a" }, { label: "Vendor mod", value: 19, color: "#e8a040" }, { label: "Error", value: 8, color: "#b4bcc8" }],
    unit: "%",
  },
  "vendor-rework": {
    title: "Vendor-initiated rework",
    contextLabel: "Vendor modifications require re-approval",
    type: "bar",
    data: [{ label: "Substitution", value: 58, color: "#e8a040" }, { label: "Price change", value: 27, color: "#b4bcc8" }, { label: "Delay", value: 15, color: "#b4bcc8" }],
    unit: "%",
  },
  "req-timing": {
    title: "Requirement change timing",
    contextLabel: "Customer requirements arrive late",
    type: "histogram",
    data: [41, 22, 15, 10, 7, 3, 2],
    labels: ["<48h", "2-5d", "5-10d", "10-15d", "15-20d", "20-25d", "25d+"],
    unit: "% of changes",
  },
  "completeness-check": {
    title: "Spec completeness at approval",
    contextLabel: "No hard gate for complete specs",
    type: "bar",
    data: [{ label: "Complete", value: 28, color: "#7bc67e" }, { label: "Incomplete", value: 72, color: "#d4685a" }],
    unit: "%",
  },
  "block-reasons": {
    title: "Blocking reasons",
    contextLabel: "Missing information triggers blocking",
    type: "bar",
    data: [{ label: "Missing docs", value: 45, color: "#d4685a" }, { label: "Credit hold", value: 28, color: "#e8a040" }, { label: "Stock", value: 18, color: "#b4bcc8" }, { label: "Other", value: 9, color: "#b4bcc8" }],
    unit: "%",
  },
  "credit-blocks": {
    title: "Credit block resolution time",
    contextLabel: "Credit hold on vendor or customer",
    type: "histogram",
    data: [15, 25, 32, 18, 8, 2],
    labels: ["<1h", "1-4h", "4-12h", "12-24h", "1-3d", "3d+"],
    unit: "cases",
  },
  "doc-completeness": {
    title: "Document completeness at approval",
    contextLabel: "Upstream steps don't collect documents",
    type: "bar",
    data: [{ label: "Complete", value: 35, color: "#7bc67e" }, { label: "Partial", value: 42, color: "#e8a040" }, { label: "Missing", value: 23, color: "#d4685a" }],
    unit: "%",
  },
  "site-variants": {
    title: "Process variants by site",
    contextLabel: "Different process variants per site",
    type: "bar",
    data: [{ label: "PM1", value: 3, color: "#7bc67e" }, { label: "PM2", value: 8, color: "#e8a040" }, { label: "PN1", value: 47, color: "#d4685a" }, { label: "PN2", value: 22, color: "#e8a040" }],
    unit: "variants",
  },
  "site-volume": {
    title: "Case volume by site",
    contextLabel: "Volume differences affect efficiency",
    type: "bar",
    data: [{ label: "PM1", value: 8200, color: "#7bc67e" }, { label: "PM2", value: 4100, color: "#e8a040" }, { label: "PN1", value: 420, color: "#d4685a" }, { label: "PN2", value: 1800, color: "#b4bcc8" }],
    unit: "cases",
  },
  "variant-overlap": {
    title: "Variant overlap between sites",
    contextLabel: "No standardized process across sites",
    type: "bar",
    data: [{ label: "Shared", value: 12, color: "#7bc67e" }, { label: "Site-specific", value: 88, color: "#d4685a" }],
    unit: "%",
  },
  "vendor-changes": {
    title: "Vendor change types",
    contextLabel: "Material availability changes",
    type: "bar",
    data: [{ label: "Substitution", value: 58, color: "#e8a040" }, { label: "Lead time", value: 25, color: "#b4bcc8" }, { label: "Discontinuation", value: 17, color: "#d4685a" }],
    unit: "%",
  },
};

const COUNTERMEASURE_DATA = {
  "bottleneck-lcp": [
    { id: "cm-auto-validation", desc: "Implement automated validation rules for standard product specs", impact: "High", effort: "Medium", defaultSelected: true,
      tasks: [{ name: "Define validation rule specifications", suggestedOwner: "Process team" }, { name: "Configure rules in ERP system", suggestedOwner: "IT team" }, { name: "Run pilot on PM1 site", suggestedOwner: "Site lead PM1" }] },
    { id: "cm-fast-track", desc: "Create fast-track path for repeat orders (skip full confirmation)", impact: "Medium", effort: "Low", defaultSelected: true,
      tasks: [{ name: "Identify repeat order criteria", suggestedOwner: "Process team" }, { name: "Design fast-track workflow", suggestedOwner: "Process team" }] },
    { id: "cm-dashboard", desc: "Add real-time bottleneck dashboard for operations team", impact: "Medium", effort: "High", defaultSelected: false,
      tasks: [{ name: "Define dashboard KPIs", suggestedOwner: "Operations" }, { name: "Build dashboard in BI tool", suggestedOwner: "IT team" }] },
  ],
  "rework-approved": [
    { id: "cm-completeness-gate", desc: "Add mandatory completeness gate at order entry", impact: "High", effort: "Medium", defaultSelected: true,
      tasks: [{ name: "Define required fields per order type", suggestedOwner: "Process team" }, { name: "Implement validation in order system", suggestedOwner: "IT team" }] },
    { id: "cm-pre-approval", desc: "Pre-approve common vendor substitutions", impact: "Medium", effort: "Low", defaultSelected: true,
      tasks: [{ name: "Catalog common substitutions by vendor", suggestedOwner: "Procurement" }, { name: "Create pre-approved substitution list", suggestedOwner: "Procurement" }] },
    { id: "cm-spec-template", desc: "Standardize specification templates by product category", impact: "Medium", effort: "Medium", defaultSelected: false,
      tasks: [{ name: "Audit existing spec formats", suggestedOwner: "Engineering" }, { name: "Create standardized templates", suggestedOwner: "Engineering" }] },
  ],
  "blocked-volume": [
    { id: "cm-doc-upfront", desc: "Enforce document collection at order entry, not at approval", impact: "High", effort: "Medium", defaultSelected: true,
      tasks: [{ name: "Map required documents per order type", suggestedOwner: "Process team" }, { name: "Add upload gates to order entry form", suggestedOwner: "IT team" }] },
    { id: "cm-credit-refresh", desc: "Automate credit rating refresh to reduce false blocks", impact: "Medium", effort: "Low", defaultSelected: true,
      tasks: [{ name: "Integrate credit API for live checks", suggestedOwner: "IT team" }, { name: "Adjust threshold based on historical false-positive rate", suggestedOwner: "Finance" }] },
  ],
  "site-variance": [
    { id: "cm-standardize", desc: "Standardize process to PM1's 3-variant model across all sites", impact: "High", effort: "High", defaultSelected: true,
      tasks: [{ name: "Document PM1 process in detail", suggestedOwner: "Site lead PM1" }, { name: "Gap analysis for each site", suggestedOwner: "Process team" }, { name: "Rollout plan with site-by-site timeline", suggestedOwner: "Program manager" }] },
    { id: "cm-continuous-flow", desc: "Move low-volume sites from batch processing to continuous flow", impact: "Medium", effort: "Medium", defaultSelected: true,
      tasks: [{ name: "Identify batch-processing sites", suggestedOwner: "Process team" }, { name: "Design continuous flow workflow", suggestedOwner: "Process team" }] },
  ],
};

const FINDING_GROUPING = {
  "Reduce throughput time": { combined: false, reason: "These findings point to different root causes — the confirmation bottleneck is an internal process issue, while the site variance is an organizational standardization issue. I'd recommend separate improvements, starting with the bottleneck." },
  "Lower rework rate": { combined: true, reason: "These findings look related — excessive blocking often triggers the re-approval loop. Addressing them together will have a compound effect on the rework rate." },
};

const GOAL_IMPACT = {
  "bottleneck-lcp": { metric: "throughput time", reduction: "2.3 days", from: "18.8d", to: "16.5d" },
  "rework-approved": { metric: "rework rate", reduction: "15%", from: "52%", to: "37%" },
  "blocked-volume": { metric: "rework rate", reduction: "8%", from: "52%", to: "44%" },
  "site-variance": { metric: "throughput time", reduction: "3.1 days", from: "18.8d", to: "15.7d" },
};
```

- [ ] **Step 2: Build and verify data is valid JavaScript**

Run: `npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add namuda-flow-v8.jsx
git commit -m "Add pre-built data for improvement flow (why trees, evidence, countermeasures)"
```

---

## Task 3: Build EvidencePanel Component

The right-side panel showing contextual supporting visuals. Renders SVG charts based on EVIDENCE_VISUALS data.

**Files:**
- Modify: `namuda-flow-v8.jsx` — add component after CanvasView (after line ~3627)

- [ ] **Step 1: Create the EvidencePanel component**

Insert after the CanvasView closing `}` (after line ~3627):

```javascript
/* ═══ EVIDENCE PANEL (right side, improvement flow) ═══ */
function EvidencePanel({ evidenceKey, onAddToPlan, addedKeys }) {
  const ev = evidenceKey ? EVIDENCE_VISUALS[evidenceKey] : null;
  if (!ev) return null;
  const isAdded = addedKeys.includes(evidenceKey);

  const renderChart = () => {
    if (ev.type === "bar") {
      const maxVal = Math.max(...ev.data.map(d => d.value));
      return (
        <div style={{ padding: "0 4px" }}>
          {ev.data.map((d, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: T.text.secondary, fontWeight: 500 }}>{d.label}</span>
                <span style={{ fontSize: 10, color: T.text.primary, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{d.value.toLocaleString()}{ev.unit === "%" ? "%" : ""}</span>
              </div>
              <div style={{ height: 8, background: T.bg.light, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(d.value / maxVal) * 100}%`, height: "100%", background: d.color, borderRadius: 4, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: 9, color: T.text.muted, textAlign: "right", marginTop: 2 }}>{ev.unit}</div>
        </div>
      );
    }
    if (ev.type === "histogram") {
      const maxVal = Math.max(...ev.data);
      return (
        <div>
          <svg width="100%" viewBox={`0 0 ${ev.data.length * 32} 60`} style={{ display: "block" }}>
            {ev.data.map((v, i) => (
              <g key={i}>
                <rect x={i * 32 + 2} y={60 - (v / maxVal) * 52} width={28} height={(v / maxVal) * 52} rx={3} fill={T.accent.blue} opacity={0.7 + (v / maxVal) * 0.3} />
                <text x={i * 32 + 16} y={58} textAnchor="middle" fontSize="7" fill={T.text.muted}>{ev.labels?.[i] || ""}</text>
              </g>
            ))}
          </svg>
          <div style={{ fontSize: 9, color: T.text.muted, textAlign: "right" }}>{ev.unit}</div>
        </div>
      );
    }
    if (ev.type === "line") {
      const maxVal = Math.max(...ev.data), minVal = Math.min(...ev.data);
      const range = maxVal - minVal || 1;
      const w = ev.data.length * 40, h = 60;
      const points = ev.data.map((v, i) => `${i * 40 + 20},${h - ((v - minVal) / range) * 48 - 6}`).join(" ");
      return (
        <div>
          <svg width="100%" viewBox={`0 0 ${w} ${h + 12}`} style={{ display: "block" }}>
            <polyline points={points} fill="none" stroke={T.accent.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {ev.data.map((v, i) => (
              <g key={i}>
                <circle cx={i * 40 + 20} cy={h - ((v - minVal) / range) * 48 - 6} r="3" fill={T.accent.blue} />
                <text x={i * 40 + 20} y={h + 10} textAnchor="middle" fontSize="7" fill={T.text.muted}>{ev.labels?.[i] || ""}</text>
              </g>
            ))}
          </svg>
          <div style={{ fontSize: 9, color: T.text.muted, textAlign: "right" }}>{ev.unit}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      position: "absolute", top: 16, right: 16, width: 300, bottom: 80,
      background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
      borderRadius: T.radius.lg, boxShadow: T.shadow.lg,
      border: `1px solid ${T.border.light}`,
      zIndex: 15, overflow: "hidden", display: "flex", flexDirection: "column",
      animation: "chatSlideIn 0.3s ease",
    }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${T.border.light}` }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Supporting evidence</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.text.primary, lineHeight: 1.4 }}>{ev.title}</div>
      </div>
      <div style={{ padding: "14px 16px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, color: T.accent.blue, fontWeight: 500, marginBottom: 12, padding: "4px 8px", background: `${T.accent.blue}08`, borderRadius: 4, borderLeft: `2px solid ${T.accent.blue}` }}>
          Evidence for: {ev.contextLabel}
        </div>
        {renderChart()}
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.border.light}` }}>
        <button onClick={() => !isAdded && onAddToPlan(evidenceKey)} style={{
          width: "100%", padding: "8px 0", fontSize: 11, fontWeight: 600,
          background: isAdded ? T.bg.light : T.accent.blue,
          color: isAdded ? T.accent.blue : T.text.inverse,
          border: isAdded ? `1px solid ${T.border.accent}` : "none",
          borderRadius: T.radius.sm, cursor: isAdded ? "default" : "pointer",
          fontFamily: T.font, transition: "all 0.2s",
        }}>
          {isAdded ? "Added \u2713" : "Add to plan"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add namuda-flow-v8.jsx
git commit -m "Add EvidencePanel component for improvement flow"
```

---

## Task 4: Build ImprovementPlanPanel Component

The left-side document panel that builds up live as each step completes.

**Files:**
- Modify: `namuda-flow-v8.jsx` — add component after EvidencePanel

- [ ] **Step 1: Create the ImprovementPlanPanel component**

Insert after EvidencePanel:

```javascript
/* ═══ IMPROVEMENT PLAN PANEL (left side, builds live) ═══ */
function ImprovementPlanPanel({ goal, findings, problemStatement, whyTree, rootCause, counterMeasures, evidenceCards, step }) {
  return (
    <div style={{
      position: "absolute", top: 16, left: 16, width: 460, bottom: 80,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
      borderRadius: T.radius.lg, boxShadow: T.shadow.lg,
      border: `1px solid ${T.border.light}`,
      zIndex: 15, overflow: "hidden", display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.border.light}` }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Improvement Plan</div>
        {goal && <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>{goal.n}</div>}
        {goal && <div style={{ fontSize: 11, color: T.accent.blue, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{goal.b} → {goal.t}</div>}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {/* Findings section */}
        {findings.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Findings</div>
            {findings.map(fid => {
              const f = CANVAS_FINDINGS.find(cf => cf.id === fid);
              if (!f) return null;
              return (
                <div key={fid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 4, borderRadius: 6, background: `${f.sevColor}06`, border: `1px solid ${f.sevColor}15` }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.sevColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: T.text.primary }}>{f.title}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: `${f.sevColor}12`, color: f.sevColor, marginLeft: "auto" }}>{f.severity}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Problem Statement */}
        {problemStatement && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Problem Statement</div>
            <div style={{ fontSize: 12, color: T.text.secondary, lineHeight: 1.7, padding: "12px 14px", background: T.bg.light, borderRadius: 8, borderLeft: `3px solid ${T.accent.blue}`, fontStyle: "italic" }}>
              "{problemStatement}"
            </div>
          </div>
        )}

        {/* Root Cause Tree */}
        {whyTree.length > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Root Cause Analysis</div>
            {whyTree.map((node, i) => (
              <div key={i} style={{ paddingLeft: i * 16, marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  {i > 0 && <div style={{ width: 12, height: 12, borderLeft: `1.5px solid ${T.border.focus}`, borderBottom: `1.5px solid ${T.border.focus}`, borderRadius: "0 0 0 4px", marginTop: 2, flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: T.text.primary, lineHeight: 1.5 }}>
                      {node.answer}
                    </div>
                    {node.tag === "data" && (
                      <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: `${T.accent.blue}12`, color: T.accent.blue, marginTop: 2, display: "inline-block" }}>data</span>
                    )}
                    {/* Inline evidence card if added */}
                    {node.evidence && evidenceCards.includes(node.evidence) && (
                      <div style={{ marginTop: 6, padding: "6px 8px", borderRadius: 4, background: `${T.accent.blue}06`, border: `1px solid ${T.accent.blue}15`, fontSize: 9, color: T.accent.blue, fontWeight: 500 }}>
                        📊 {EVIDENCE_VISUALS[node.evidence]?.title}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {rootCause && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "linear-gradient(135deg, #fafaff, #f0f2ff)", border: `1.5px solid ${T.border.accent}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.accent.blue, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Root Cause</div>
                <div style={{ fontSize: 11.5, color: T.text.primary, lineHeight: 1.6, fontWeight: 500 }}>{rootCause}</div>
              </div>
            )}
          </div>
        )}

        {/* Countermeasures */}
        {counterMeasures.filter(cm => cm.selected).length > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Countermeasures</div>
            {counterMeasures.filter(cm => cm.selected).map((cm, i) => (
              <div key={cm.id} style={{ padding: "10px 12px", marginBottom: 6, borderRadius: 8, border: `1px solid ${T.border.light}`, background: T.bg.surface }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: T.text.primary, marginBottom: 4 }}>{i + 1}. {cm.desc}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 9, color: T.text.muted }}>
                  <span>Impact: <span style={{ fontWeight: 600, color: cm.impact === "High" ? "#7bc67e" : T.text.secondary }}>{cm.impact}</span></span>
                  <span>Effort: <span style={{ fontWeight: 600, color: cm.effort === "High" ? "#d4685a" : T.text.secondary }}>{cm.effort}</span></span>
                </div>
                {/* Tasks under countermeasure */}
                {cm.tasks && cm.tasks.filter(t => t.owner || t.dueDate).length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border.light}` }}>
                    {cm.tasks.filter(t => t.owner || t.dueDate).map((t, ti) => (
                      <div key={ti} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, fontSize: 10, color: T.text.secondary }}>
                        <span style={{ color: T.accent.blue }}>→</span>
                        <span style={{ flex: 1 }}>{t.name}</span>
                        {t.owner && <span style={{ fontWeight: 500 }}>{t.owner}</span>}
                        {t.dueDate && <span style={{ color: T.text.muted }}>{t.dueDate}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step progress indicator */}
        {step < 6 && (
          <div style={{ display: "flex", gap: 4, justifyContent: "center", paddingTop: 12, borderTop: `1px solid ${T.border.light}` }}>
            {["Goal", "Findings", "Problem", "Root Cause", "Measures", "Tasks", "Review"].map((s, i) => (
              <div key={i} style={{
                fontSize: 8, fontWeight: 600, padding: "3px 8px", borderRadius: 10,
                background: i <= step ? T.accent.blue : T.bg.light,
                color: i <= step ? T.text.inverse : T.text.muted,
                transition: "all 0.3s",
              }}>{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add namuda-flow-v8.jsx
git commit -m "Add ImprovementPlanPanel component (left document panel)"
```

---

## Task 5: Build ImprovementView — Shell + Step 0 (Select Goal)

The main improvement view component with layout, orb, and the first step.

**Files:**
- Modify: `namuda-flow-v8.jsx` — add ImprovementView after ImprovementPlanPanel
- Modify: `namuda-flow-v8.jsx:4791` — render ImprovementView for phase === "improvement"

- [ ] **Step 1: Create the ImprovementView component shell**

Insert after ImprovementPlanPanel:

```javascript
/* ═══ IMPROVEMENT VIEW ═══ */
function ImprovementView({ storedFindings, onBack }) {
  const [impStep, setImpStep] = useState(0); // 0=goal, 1=group, 2=problem, 3=whys, 4=measures, 5=tasks, 6=review
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [impFindings, setImpFindings] = useState([]); // finding IDs for this improvement
  const [problemStatement, setProblemStatement] = useState("");
  const [whyTree, setWhyTree] = useState([]); // [{answer, tag, evidence?}]
  const [rootCause, setRootCause] = useState("");
  const [counterMeasures, setCounterMeasures] = useState([]);
  const [evidenceCards, setEvidenceCards] = useState([]); // evidence keys added to plan
  const [currentEvidence, setCurrentEvidence] = useState(null); // evidence key for right panel
  const [blobText, setBlobText] = useState("");
  const [blob, setBlob] = useState("waiting");
  const [activeChoice, setActiveChoice] = useState(null);
  const [refineState, setRefineState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Why tree navigation state
  const [whyLevel, setWhyLevel] = useState(0);
  const [whyPath, setWhyPath] = useState([]); // keys chosen at each level
  const [currentWhyData, setCurrentWhyData] = useState(null); // current level's question/options

  // Task assignment state
  const [taskInputs, setTaskInputs] = useState({}); // { cmId: [{name, owner, dueDate}] }
  const [currentCmIdx, setCurrentCmIdx] = useState(0);

  const addEvidence = (key) => {
    setEvidenceCards(prev => prev.includes(key) ? prev : [...prev, key]);
  };

  // === STEP 0: Select Goal ===
  useEffect(() => {
    if (impStep !== 0) return;
    setBlobText("Let's turn your findings into action. Which goal do you want to improve?");
    setBlob("waiting");

    // Build goal options from stored findings
    const goalMap = {};
    storedFindings.forEach(fid => {
      const f = CANVAS_FINDINGS.find(cf => cf.id === fid);
      if (f && f.goalLink) {
        if (!goalMap[f.goalLink]) goalMap[f.goalLink] = { findings: [] };
        goalMap[f.goalLink].findings.push(fid);
      }
    });

    const GOAL_META = {
      "Reduce throughput time": { b: "18.8d", t: "14d" },
      "Lower rework rate": { b: "52%", t: "35%" },
      "Improve data quality": { b: "50/100", t: "70+" },
      "Increase conformance": { b: "1,175", t: "<400" },
    };

    const goalOptions = Object.entries(goalMap).map(([name, data]) => ({
      label: `${name} (${GOAL_META[name]?.b} → ${GOAL_META[name]?.t})`,
      desc: `${data.findings.length} finding${data.findings.length > 1 ? "s" : ""} linked`,
      _goalName: name,
      _findings: data.findings,
      _meta: GOAL_META[name],
    }));

    if (goalOptions.length === 0) return;

    setTimeout(() => {
      setActiveChoice({
        question: "Which goal should we work on?",
        options: goalOptions,
        allowCustom: false,
        onSelect: (idx) => {
          const chosen = goalOptions[idx];
          setSelectedGoal({ n: chosen._goalName, b: chosen._meta.b, t: chosen._meta.t, findings: chosen._findings });
          setActiveChoice(null);
          setImpStep(1);
        },
      });
    }, 600);
  }, [impStep, storedFindings]);

  // === STEP 1: Group Findings ===
  useEffect(() => {
    if (impStep !== 1 || !selectedGoal) return;
    setBlob("thinking");
    setBlobText(`You have ${selectedGoal.findings.length} finding${selectedGoal.findings.length > 1 ? "s" : ""} for "${selectedGoal.n}". Let me see how they relate.`);

    const grouping = FINDING_GROUPING[selectedGoal.n];

    setTimeout(() => {
      setBlob("waiting");
      if (selectedGoal.findings.length === 1) {
        // Only one finding — skip grouping
        setImpFindings(selectedGoal.findings);
        setBlobText("One finding to work with. Let's build the improvement plan.");
        setTimeout(() => setImpStep(2), 1200);
        return;
      }

      const findingTitles = selectedGoal.findings.map(fid => CANVAS_FINDINGS.find(cf => cf.id === fid)?.title).filter(Boolean).join(" and ");

      if (grouping?.combined) {
        setActiveChoice({
          question: grouping.reason,
          options: [
            { label: "Yes, combine into one improvement" },
            { label: "No, treat them separately" },
          ],
          allowCustom: true,
          customLabel: "Something else",
          onSelect: (idx) => {
            setActiveChoice(null);
            if (idx === 0) {
              setImpFindings(selectedGoal.findings);
            } else {
              setImpFindings([selectedGoal.findings[0]]);
            }
            setImpStep(2);
          },
        });
      } else {
        setActiveChoice({
          question: grouping?.reason || `These findings for "${selectedGoal.n}" appear to be independent issues. I'd recommend separate improvements, starting with the most impactful.`,
          options: [
            { label: `Yes, separate — start with ${CANVAS_FINDINGS.find(cf => cf.id === selectedGoal.findings[0])?.title}` },
            { label: "No, I think they're connected — combine them" },
          ],
          allowCustom: true,
          customLabel: "Something else",
          onSelect: (idx) => {
            setActiveChoice(null);
            if (idx === 0) {
              setImpFindings([selectedGoal.findings[0]]);
            } else {
              setImpFindings(selectedGoal.findings);
            }
            setImpStep(2);
          },
        });
      }
    }, 1500);
  }, [impStep, selectedGoal]);

  // === STEP 2: Problem Statement ===
  useEffect(() => {
    if (impStep !== 2 || impFindings.length === 0) return;
    setBlob("thinking");
    setBlobText("Let me draft a problem statement from these findings.");

    const primaryFinding = impFindings[0];
    const draft = PROBLEM_STATEMENTS[primaryFinding] || "A significant process issue has been identified that requires systematic improvement.";

    // Show evidence for the primary finding
    const findingData = CANVAS_FINDINGS.find(cf => cf.id === primaryFinding);
    if (findingData?.trigger) {
      const evidenceKey = WHY_TREE_DATA[primaryFinding]?.[0]?.options?.[0]?.evidence;
      if (evidenceKey) setCurrentEvidence(evidenceKey);
    }

    setTimeout(() => {
      setBlob("waiting");
      setRefineState({
        originalQuestion: "Problem statement",
        userSuggestion: "",
        aiProposal: draft,
        onAccept: () => {
          setProblemStatement(draft);
          setRefineState(null);
          setImpStep(3);
        },
        onRefine: (userText) => {
          // Simulate AI refinement
          const refined = userText.length > 20 ? userText : draft;
          setProblemStatement(refined);
          setRefineState(null);
          setImpStep(3);
        },
        onCancel: () => {
          setProblemStatement(draft);
          setRefineState(null);
          setImpStep(3);
        },
      });
    }, 1800);
  }, [impStep, impFindings]);

  // === STEP 3: Root Cause Analysis (Why Tree) ===
  useEffect(() => {
    if (impStep !== 3) return;
    setBlobText("Now let's find the root cause. I'll suggest hypotheses — some backed by data, some more speculative. Steer me in the right direction.");
    setBlob("waiting");

    // Initialize why tree navigation
    const primaryFinding = impFindings[0];
    const treeData = WHY_TREE_DATA[primaryFinding];
    if (!treeData || treeData.length === 0) { setImpStep(4); return; }

    const firstLevel = treeData[0];
    setCurrentWhyData(firstLevel);
    setWhyLevel(0);
    setWhyPath([]);

    // Show first evidence
    const firstDataOption = firstLevel.options.find(o => o.tag === "data");
    if (firstDataOption?.evidence) setCurrentEvidence(firstDataOption.evidence);

    setTimeout(() => {
      showWhyChoice(firstLevel);
    }, 1200);
  }, [impStep]);

  const showWhyChoice = (levelData) => {
    if (!levelData) return;

    setActiveChoice({
      question: levelData.question,
      options: levelData.options.map(o => ({
        label: o.label + (o.tag === "data" ? " (data)" : o.tag === "hypothesis" ? " (hypothesis)" : ""),
        desc: o.desc || undefined,
        _key: o.key,
        _tag: o.tag,
        _evidence: o.evidence,
      })),
      allowCustom: true,
      customLabel: "Tell me something else",
      onSelect: (idx) => {
        const chosen = levelData.options[idx];
        handleWhySelection(chosen, levelData);
      },
    });
  };

  const handleWhySelection = (chosen, levelData) => {
    setActiveChoice(null);

    // Add to why tree
    const newNode = { answer: chosen.label, tag: chosen.tag, evidence: chosen.evidence };
    setWhyTree(prev => [...prev, newNode]);

    // Update evidence panel
    if (chosen.evidence) setCurrentEvidence(chosen.evidence);

    const newPath = [...whyPath, chosen.key];
    setWhyPath(newPath);

    // Check if there's a next level
    const nextLevel = levelData.next?.[chosen.key];

    if (!nextLevel) {
      // No deeper scripted level — propose root cause from last level's rootCause or generic
      const rc = levelData.rootCause || `The analysis suggests the root cause is: ${chosen.label}`;
      proposeRootCause(rc);
      return;
    }

    if (nextLevel.rootCause && !nextLevel.options) {
      // This level has a root cause and no further options
      proposeRootCause(nextLevel.rootCause);
      return;
    }

    // Show the next level
    setWhyLevel(prev => prev + 1);
    setCurrentWhyData(nextLevel);
    setBlob("thinking");
    setBlobText("Digging deeper...");

    // Show evidence for first data option of next level
    const firstDataOpt = nextLevel.options?.find(o => o.tag === "data");
    if (firstDataOpt?.evidence) setCurrentEvidence(firstDataOpt.evidence);

    setTimeout(() => {
      setBlob("waiting");
      showWhyChoice(nextLevel);
    }, 1000);
  };

  const proposeRootCause = (rc) => {
    setBlob("thinking");
    setBlobText("I think we've found the root cause.");

    setTimeout(() => {
      setBlob("waiting");
      setRefineState({
        originalQuestion: "Root cause",
        userSuggestion: "",
        aiProposal: rc,
        onAccept: () => {
          setRootCause(rc);
          setRefineState(null);
          setImpStep(4);
        },
        onRefine: (userText) => {
          setRootCause(userText.length > 10 ? userText : rc);
          setRefineState(null);
          setImpStep(4);
        },
        onCancel: () => {
          setRootCause(rc);
          setRefineState(null);
          setImpStep(4);
        },
      });
    }, 1500);
  };

  // === STEP 4: Countermeasures ===
  useEffect(() => {
    if (impStep !== 4) return;
    setBlob("thinking");
    setBlobText("Based on the root cause, here are countermeasures I'd recommend.");

    const primaryFinding = impFindings[0];
    const cmData = COUNTERMEASURE_DATA[primaryFinding] || [];
    const cms = cmData.map(cm => ({ ...cm, selected: cm.defaultSelected, tasks: cm.tasks.map(t => ({ ...t, owner: "", dueDate: "" })) }));
    setCounterMeasures(cms);

    // Show impact evidence
    const impact = GOAL_IMPACT[primaryFinding];
    if (impact) setCurrentEvidence(null); // Clear — impact shown differently

    setTimeout(() => {
      setBlob("waiting");
      setActiveChoice({
        question: `Select countermeasures to include:`,
        options: cms.map((cm, i) => ({
          label: `${cm.selected ? "☑" : "☐"} ${cm.desc}`,
          desc: `Impact: ${cm.impact}  |  Effort: ${cm.effort}`,
        })),
        allowCustom: true,
        customLabel: "Add your own countermeasure",
        onSelect: (idx) => {
          // Toggle selection
          setCounterMeasures(prev => prev.map((cm, i) => i === idx ? { ...cm, selected: !cm.selected } : cm));
        },
      });
    }, 1500);
  }, [impStep]);

  const acceptCounterMeasures = () => {
    setActiveChoice(null);
    setImpStep(5);
  };

  // === STEP 5: Task Assignment ===
  useEffect(() => {
    if (impStep !== 5) return;
    const selectedCms = counterMeasures.filter(cm => cm.selected);
    if (selectedCms.length === 0) { setImpStep(6); return; }
    setCurrentCmIdx(0);
    setBlobText("Let's break these into actionable tasks.");
    setBlob("waiting");
  }, [impStep]);

  const updateTask = (cmId, taskIdx, field, value) => {
    setCounterMeasures(prev => prev.map(cm => {
      if (cm.id !== cmId) return cm;
      const tasks = [...cm.tasks];
      tasks[taskIdx] = { ...tasks[taskIdx], [field]: value };
      return { ...cm, tasks };
    }));
  };

  const nextCounterMeasure = () => {
    const selectedCms = counterMeasures.filter(cm => cm.selected);
    if (currentCmIdx < selectedCms.length - 1) {
      setCurrentCmIdx(prev => prev + 1);
    } else {
      setImpStep(6);
    }
  };

  // === STEP 6: Review & Save ===
  useEffect(() => {
    if (impStep !== 6) return;
    setBlobText("Here's your complete improvement plan. Scroll through it, and let me know if anything needs changing.");
    setBlob("waiting");
    setCurrentEvidence(null);

    setTimeout(() => {
      setActiveChoice({
        question: "Your improvement plan is ready.",
        options: [
          { label: "Save improvement" },
        ],
        allowCustom: true,
        customLabel: "Make changes",
        onSelect: (idx) => {
          if (idx === 0) {
            // Save
            setActiveChoice(null);
            setBlobText("Improvement saved! Great work. Let's head back to the canvas.");
            setBlob("waiting");
            setTimeout(() => onBack(), 2000);
          }
        },
      });
    }, 800);
  }, [impStep]);

  // Current countermeasure for task assignment step
  const selectedCms = counterMeasures.filter(cm => cm.selected);
  const currentCm = selectedCms[currentCmIdx];

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", animation: "canvasEnter 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
      {/* Canvas background */}
      <div style={{ position: "absolute", inset: 0 }}>
        <DotBackground isDark={false} />
      </div>

      {/* Content layer */}
      <div style={{ position: "relative", flex: 1, zIndex: 1 }}>
        {/* Left: Improvement Plan Document */}
        {impStep >= 1 && (
          <ImprovementPlanPanel
            goal={selectedGoal}
            findings={impFindings}
            problemStatement={problemStatement}
            whyTree={whyTree}
            rootCause={rootCause}
            counterMeasures={counterMeasures}
            evidenceCards={evidenceCards}
            step={impStep}
          />
        )}

        {/* Right: Evidence Panel */}
        {currentEvidence && (
          <EvidencePanel
            evidenceKey={currentEvidence}
            onAddToPlan={addEvidence}
            addedKeys={evidenceCards}
          />
        )}

        {/* Center: Orb */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
          <Blob state={blob} size={180} />
          <div style={{ textAlign: "center", marginTop: 16, maxWidth: 340 }}>
            <BlobSpeech text={blobText} />
          </div>
        </div>

        {/* Bottom: Chat modal */}
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 520, zIndex: 30,
          padding: "0 24px", pointerEvents: "none",
        }}>
          <div style={{
            background: "#fff", borderRadius: T.radius.lg,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            border: `1px solid ${T.border.light}`,
            padding: "16px 18px 14px", pointerEvents: "auto",
            animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {/* Active choice widget */}
            {activeChoice && (
              <ChoiceWidget
                question={activeChoice.question}
                options={activeChoice.options}
                onSelect={(idx) => activeChoice.onSelect(idx)}
                allowCustom={activeChoice.allowCustom}
                customLabel={activeChoice.customLabel}
                onSkip={activeChoice.onSkip}
              />
            )}

            {/* Refine dialogue */}
            {refineState && (
              <RefineDialogue
                originalQuestion={refineState.originalQuestion}
                userSuggestion={refineState.userSuggestion}
                aiProposal={refineState.aiProposal}
                onAccept={refineState.onAccept}
                onRefine={(text) => refineState.onRefine(text)}
                onCancel={refineState.onCancel}
              />
            )}

            {/* Countermeasure accept button (step 4) */}
            {impStep === 4 && activeChoice && (
              <button onClick={acceptCounterMeasures} style={{
                width: "100%", padding: "10px 0", marginTop: 10,
                fontSize: 12, fontWeight: 600,
                background: T.accent.blue, color: T.text.inverse,
                border: "none", borderRadius: T.radius.sm, cursor: "pointer",
                fontFamily: T.font,
              }}>Accept selected</button>
            )}

            {/* Task assignment form (step 5) */}
            {impStep === 5 && currentCm && !activeChoice && !refineState && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text.primary, marginBottom: 10 }}>
                  Countermeasure: "{currentCm.desc}"
                </div>
                {currentCm.tasks.map((task, ti) => (
                  <div key={ti} style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: T.bg.light, border: `1px solid ${T.border.light}` }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: T.text.primary, marginBottom: 8 }}>
                      Task {ti + 1}: {task.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: T.text.muted, fontWeight: 600, marginBottom: 3 }}>Assign to</div>
                        <input
                          value={task.owner}
                          onChange={(e) => updateTask(currentCm.id, ti, "owner", e.target.value)}
                          placeholder={task.suggestedOwner || "Name or team"}
                          style={{ width: "100%", padding: "6px 10px", fontSize: 11, border: `1px solid ${T.border.light}`, borderRadius: 6, outline: "none", fontFamily: T.font, background: "#fff" }}
                          onFocus={e => e.target.style.borderColor = T.border.focus}
                          onBlur={e => e.target.style.borderColor = T.border.light}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: T.text.muted, fontWeight: 600, marginBottom: 3 }}>Due date</div>
                        <input
                          value={task.dueDate}
                          onChange={(e) => updateTask(currentCm.id, ti, "dueDate", e.target.value)}
                          placeholder="e.g. Apr 15"
                          style={{ width: "100%", padding: "6px 10px", fontSize: 11, border: `1px solid ${T.border.light}`, borderRadius: 6, outline: "none", fontFamily: T.font, background: "#fff" }}
                          onFocus={e => e.target.style.borderColor = T.border.focus}
                          onBlur={e => e.target.style.borderColor = T.border.light}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={nextCounterMeasure} style={{
                  width: "100%", padding: "10px 0", fontSize: 12, fontWeight: 600,
                  background: T.accent.blue, color: T.text.inverse,
                  border: "none", borderRadius: T.radius.sm, cursor: "pointer", fontFamily: T.font,
                }}>
                  {currentCmIdx < selectedCms.length - 1 ? "Save and continue" : "Save and review"}
                </button>
              </div>
            )}

            {/* Empty state when no interaction active */}
            {!activeChoice && !refineState && impStep !== 5 && impStep < 6 && (
              <div style={{ textAlign: "center", padding: "8px 0", fontSize: 12, color: T.text.muted }}>
                <span className="dots-anim" style={{ display: "inline-flex", gap: 4 }}><span>·</span><span>·</span><span>·</span></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Render ImprovementView in App**

After line 4791 (`{phase === "canvas" && <CanvasView ... />}`), add:

```javascript
{/* Improvement flow — full screen */}
{phase === "improvement" && <ImprovementView storedFindings={storedFindings} onBack={() => setPhase("canvas")} />}
```

Also add `"improvement"` to the display:none condition on the main body div. Change line 4794 from:
```javascript
...(phase === "tour" || phase === "canvas" ? { display: "none" } : {})
```
to:
```javascript
...(phase === "tour" || phase === "canvas" || phase === "improvement" ? { display: "none" } : {})
```

- [ ] **Step 3: Build and verify**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add namuda-flow-v8.jsx
git commit -m "Add ImprovementView with full 6-step flow"
```

---

## Task 6: Fix ChoiceWidget Integration

The ChoiceWidget's `onSelect` callback passes `(index, label)`. The improvement flow's choice handlers expect just `(index)`. Also need to handle the RefineDialogue integration properly since it expects specific props.

**Files:**
- Modify: `namuda-flow-v8.jsx` — ImprovementView choice/refine handlers

- [ ] **Step 1: Verify ChoiceWidget callback signature**

Read the ChoiceWidget component (line 15) and confirm `onSelect` is called with `(index, label)`. The ImprovementView handlers only use `index`, which is fine — the second argument is simply ignored.

No code change needed if confirmed.

- [ ] **Step 2: Verify RefineDialogue integration**

The existing RefineDialogue (line 237) has props: `originalQuestion, userSuggestion, aiProposal, onAccept, onRefine, onCancel`.

The improvement flow uses `onRefine` expecting a text argument. Check that RefineDialogue calls `onRefine(text)` with the user's refined text. If it doesn't pass text, update the handler.

Read RefineDialogue source to confirm the callback signatures. If `onRefine` is called without arguments, the ImprovementView's `onRefine: (userText) => ...` will receive `undefined`. In that case, update to use the aiProposal as fallback (already handled by the `userText.length > 10 ? userText : draft` pattern).

- [ ] **Step 3: Build and test in browser**

Run: `npx vite build`
Navigate to the app, go through the flow to canvas, store 2+ findings, click "Start improvement flow".

Expected: ImprovementView renders with goal selection choice widget.

- [ ] **Step 4: Commit if any changes were needed**

```bash
git add namuda-flow-v8.jsx
git commit -m "Fix choice/refine integration in improvement flow"
```

---

## Task 7: End-to-End Walkthrough and Polish

Walk through the complete flow and fix any issues.

**Files:**
- Modify: `namuda-flow-v8.jsx` — various fixes

- [ ] **Step 1: Test Step 0 → Step 1 → Step 2 transition**

Navigate to canvas, store at least 2 findings (click bottleneck node to trigger finding, store it, then ask about rework to trigger second finding, store it).

Click "Start improvement flow". Verify:
- Goal selection appears
- After selecting goal, finding grouping choice appears
- After grouping, problem statement refine dialogue appears

- [ ] **Step 2: Test Step 3 (Why Tree)**

Verify:
- Why questions appear with data/hypothesis tags
- Evidence panel on right updates per hypothesis
- "Add to plan" works and shows in left document
- Why tree builds in left panel
- Root cause proposal appears after sufficient depth

- [ ] **Step 3: Test Step 4 → Step 5 → Step 6**

Verify:
- Countermeasure multi-select works
- Task assignment forms render for each selected countermeasure
- Review step shows full plan
- "Save improvement" returns to canvas

- [ ] **Step 4: Fix any issues found during testing**

Address any rendering, state, or transition issues discovered.

- [ ] **Step 5: Final build verification**

Run: `npx vite build`
Expected: Clean build, no warnings.

- [ ] **Step 6: Commit**

```bash
git add namuda-flow-v8.jsx
git commit -m "Polish improvement flow end-to-end"
```
