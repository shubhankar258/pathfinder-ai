# Adaptive AI Learning Path Engine — Build Specification

**Version:** 1.0 (merged) · **Status:** Architecture locked · **Supersedes:** the "Final Build Specification" (Spec A) and the "Final Collaborative Implementation Prompt" (Prompt B)

This is the single source of truth. Where the two prior documents disagreed, the resolution is recorded in Section 1 with the reason. Do not re-litigate decisions below; do not consult the superseded documents for anything except historical context.

---

## 0. Product Definition

> An adaptive AI learning companion that converts a learner's natural-language goal into an explainable, prerequisite-aware learning roadmap, and continuously adapts that roadmap based on the learner's confidence, performance, and changing interests.

The differentiator: the product does not answer "what should I learn?" It answers **"what should I learn next, why right now, and how does my path change if I struggle or change my mind?"**

**The governing architectural principle:**

> The LLM is used ONLY for natural language understanding (parsing goals, extracting structured fields) and natural language generation (phrasing explanations, answering questions). The LLM NEVER decides prerequisite ordering, never scores or ranks resources, and never decides skill sequencing. All sequencing, scoring, and gap analysis is deterministic Python operating on a fixed graph. If you find yourself asking an LLM "what order should this go in" or "which course is best," stop — that logic belongs in the DAG engine or the recommender.

Every "AI" decision point in this system is either an LLM API call for a language task, or deterministic Python for a logic task. There is no third category.

---

## 1. Conflict Resolutions (read before implementing)

The two source documents disagreed on nine points. These are settled as follows.

### 1.1 TimeFit — milestone-window based, not weekly-hours based

Spec A's implementation divided resource hours by *weekly* hours and awarded 1.0 only for ratios of 0.1–0.5. For a learner at 8 hrs/week that scored 1.0 only for resources under 4 hours; a 10-hour course scored 0.25 and a 20-hour course hit the 0.2 floor. Since real catalog resources run 5–20 hours, nearly everything landed at or near the floor and TimeFit stopped discriminating between candidates — 20% of the scoring weight doing no work. This also directly contradicted the prose in the same section.

**Resolved:** divide by milestone-window capacity (`weekly_hours × MILESTONE_WINDOW_WEEKS`), per Prompt B §15. See Section 6.4.

### 1.2 Resource → skill mapping — `skills_taught: List[str]`

Spec A used a single `skill_id`. That makes a course like "Python for Data Science" unrepresentable, since it genuinely teaches `python_basics` and `numpy_pandas`.

**Resolved:** `skills_taught: List[str]`. The hard filter becomes `target_skill_id in resource.skills_taught`, which is still a hard binary filter — the Section 6.1 rule is unaffected. Do not introduce a fuzzy "skill relevance percentage." If a graph node is so broad that this is tempting, split the node instead.

### 1.3 Difficulty scale — 1–3 for both learner and resource

Prompt B was internally inconsistent: §11 proposed a 1–5 learner scale while §13 used a 1–3 resource scale with `max_distance=2`. Mixing them means a level-5 learner scores a level-3 resource `1.0 - 2/2 = 0.0`, discarding the best available resource in the catalog.

**Resolved:** Spec A's 1–3 scale, applied identically to `learner_level` and `difficulty_level`, with `max_distance = 2`.

### 1.4 Self-rating → confidence tier — relative advance, not absolute assignment

Prompt B mapped ratings absolutely (3→DEVELOPING, 4→PRACTICED, 5→VERIFIED). This can *demote* a PRACTICED learner to DEVELOPING for rating themselves a 3, and 5→VERIFIED contradicts the rule that VERIFIED requires passing a hand-authored quiz.

**Resolved:** Spec A's relative model. 1–2 → WEAK override. 3 → hold current tier, flag for optional practice. 4–5 → advance one tier, capped below VERIFIED. Only a passed quiz produces VERIFIED. See Section 5.

### 1.5 Duration output — a range, never a single number

Spec A's API returned `estimated_weeks: 24` while its own demo section required "a range/pace, never a fixed calendar date."

**Resolved:** Prompt B's `estimated_duration_range: {min_weeks, max_weeks}`. See Section 7.3.

### 1.6 Explanations — reason codes first, prose second

Spec A carried a free-text `reasoning` string; Prompt B specified deterministic `reason_codes[]` passed to the LLM for phrasing.

**Resolved:** both, in that order. The engine emits `reason_codes: List[ReasonCode]` as the machine-readable ground truth, plus a deterministic `reasoning` string rendered from those codes by a template. The LLM may rephrase the codes conversationally in the assistant drawer, but the `reasoning` string is always renderable without an LLM call, so the UI never blocks on the API.

### 1.7 Refresher resources need a catalog flag

`get_refresher_resource(skill_id)` had nothing to select on — the resource schema had no way to distinguish a refresher from a full module, so the canonical demo beat could not fire.

**Resolved:** `Resource.is_refresher: bool`. At least one short refresher must exist for `statistics_probability`, distinct from whatever the recommender picks for the main module. See Section 4.2 and Section 8.

### 1.8 Multi-skill resources must be deduplicated

With `skills_taught` as a list, one course can be selected for two adjacent roadmap skills. Counting it twice inflates the timeline and makes the 190-hour target unreproducible.

**Resolved:** dedupe by `resource.id` across the whole roadmap. The resource attaches to the **earliest** skill in topological order that selected it; later items referencing the same resource keep the skill node (with its own state and reasoning) but carry `recommended_resource = None`, `covered_by_resource_id = <id>`, and `estimated_hours = 0.0`. Reason code `COVERED_BY_EARLIER_RESOURCE`.

### 1.9 Naming and key collisions

| Thing | Spec A | Prompt B | Canonical |
|---|---|---|---|
| Statistics node id | `stats_prob` | `statistics_probability` | `statistics_probability` |
| Parse response key | `extracted_profile` | `profile` | `profile` |
| Learner level field | `experience_numeric` | `learner_level` | `learner_level` |
| Resource difficulty field | `difficulty_numeric` | `difficulty_level` | `difficulty_level` |

Skill id convention: lowercase `snake_case`, full words, except for universally standard abbreviations (`ml`, `nlp`, `cv`, `oop`, `api`). Canonical ids for demo-critical nodes: `python_basics`, `python_oop`, `numpy_pandas`, `statistics_probability`, `ml_fundamentals`, `model_evaluation`, `nlp_specialization`, `cv_specialization`, `portfolio_project`, `capstone`.

### 1.10 One decision neither document made: WEAK recovery

Neither source defined how a skill leaves WEAK, which the demo needs the moment Demo User finishes her refresher.

**Decided here:** WEAK → DEVELOPING on completion of a refresher resource *plus* a self-rating of 3 or higher. A self-rating of 1–2 keeps it WEAK (and the refresher can be re-offered). WEAK never jumps straight to PRACTICED or VERIFIED.

---

## 2. Explicit Scope Boundary

### MUST BUILD

- Natural-language goal input with LLM-based structured extraction
- Hybrid onboarding: free text first, interactive cards ONLY for fields the LLM could not extract
- A curated skill dependency graph (30–50 nodes) as an in-memory NetworkX `DiGraph`
- A curated resource catalog (~60 items) as a JSON file, with populated `topics` and `skills_taught`
- Skill-gap analysis via graph ancestor traversal plus topological sort
- Discrete-state skill confidence tracking (a state machine, not a weighted formula)
- Two-stage resource recommendation: hard filter, then weighted score
- Roadmap generation with phases, resources, and milestone checkpoints
- Adaptive path mutation on three triggers: checkpoint failure, difficulty feedback, interest change
- A persistent dashboard: roadmap visualization, progress, "Next Best Action" card, explanations
- An AI assistant chat drawer answering questions from current roadmap state
- The canonical demo persona "Demo User" seeded and working end to end

### EXPLICITLY DO NOT BUILD

Each of these was proposed and deliberately rejected. Do not add them "for completeness."

- **Neo4j or any graph database.** NetworkX in-memory is sufficient at 30–50 nodes and removes deployment and connection risk from a live demo.
- **Vector database, embeddings, or RAG** (Pinecone, ChromaDB). The catalog is small and every resource carries structured metadata; semantic search solves a data-messiness problem a curated catalog does not have. Do expose resource selection behind a single function `get_best_resource(skill_id, profile) -> Optional[Resource]` so a vector implementation could swap in later — but do not build it.
- **LangChain or any agent-orchestration framework.** Direct API calls with structured JSON output and Pydantic validation are more debuggable and have fewer failure modes.
- **Runtime graph mutation** — no dynamic nodes, no LLM-inserted nodes, no temporary leaf nodes, no runtime edge changes. See Section 7.4.
- **LLM-generated quiz questions.** Quiz content is hand-authored static data.
- **A general quiz or assessment platform.**
- **Course-catalog scraping or third-party course APIs** (Coursera, Udemy). Curated JSON only — no rate limits, broken URLs, or schema drift during a demo.
- **User authentication.**
- **Social features, gamification, leaderboards.**
- **Any trained machine-learning model** — no training, no embedding similarity, no clustering.
- Production payments, multi-user collaboration, real-time collaborative editing, large-scale analytics, LMS integration.

---

## 3. System Architecture

```
USER
  │
  ▼
[Discovery Screen] — free-text goal input
  │
  ▼
[LLM Goal Parser] — extracts structured fields, flags missing ones (NLU ONLY)
  │
  ▼
[Normalization Layer] — free text → deterministic values (learner_level, format enum)
  │
  ▼
[Profile Completion Cards] — ONLY for fields the parser could not extract
  │
  ▼
[Structured Learner Profile] (Pydantic, Section 4)
  │
  ▼
[Skill Confidence State Machine] — resolves current tier per skill (Section 5)
  │
  ▼
[NetworkX Skill DAG] — ancestor traversal from target, minus VERIFIED skills
  │
  ▼
[Topological Sort] — deterministic ordered skill list
  │
  ▼
[Resource Recommender] — per skill: hard filter, then weighted score (Section 6)
  │
  ▼
[Roadmap Generator] — phases, dedupe, reason codes, timeline range (Section 7)
  │
  ▼
[Persistent Dashboard] — roadmap, progress, Next Best Action, explanations, assistant
  │
  ▼
[Adaptive Manager] — checkpoint failure / difficulty feedback / interest change
  │         patches ONLY the unfinished portion (Section 8)
  │
  └──────────────────────────► back to Dashboard (updated)
```

**Critical rule:** completed progress is immutable. Adaptation events only ever modify the remaining, not-yet-completed portion of the roadmap. Never regenerate the whole roadmap on an adaptation event.

---

## 4. Data Schemas

Use these exact shapes. `backend/app/schemas/`, split across `learner.py`, `resource.py`, `roadmap.py`, `events.py`.

### 4.1 Enums

```python
from enum import Enum


class ConfidenceTier(str, Enum):
    UNKNOWN = "UNKNOWN"        # no evidence at all
    FAMILIAR = "FAMILIAR"      # self-reported only, no evidence
    DEVELOPING = "DEVELOPING"  # completed a learning resource for this skill
    PRACTICED = "PRACTICED"    # self-rated 4-5/5 at a checkpoint
    VERIFIED = "VERIFIED"      # passed a hand-authored quiz for this skill
    WEAK = "WEAK"              # hard-override failure state


class LearningMode(str, Enum):
    FULL_MODULE = "FULL_MODULE"
    REFRESHER = "REFRESHER"
    PRACTICE = "PRACTICE"
    SKIP = "SKIP"


class RoadmapNodeState(str, Enum):
    LOCKED = "LOCKED"
    AVAILABLE = "AVAILABLE"
    IN_PROGRESS = "IN_PROGRESS"
    WEAK = "WEAK"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"


class LearningFormat(str, Enum):
    VIDEO = "video"
    READING = "reading"
    HANDS_ON = "hands_on"
    INTERACTIVE = "interactive"


class ReasonCode(str, Enum):
    TARGET_SKILL = "TARGET_SKILL"
    PREREQUISITE_OF_TARGET = "PREREQUISITE_OF_TARGET"
    SELF_REPORTED_UNVERIFIED = "SELF_REPORTED_UNVERIFIED"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    CHECKPOINT_FAILURE = "CHECKPOINT_FAILURE"
    DIFFICULTY_MATCH = "DIFFICULTY_MATCH"
    FORMAT_MATCH = "FORMAT_MATCH"
    INTEREST_ALIGNMENT = "INTEREST_ALIGNMENT"
    SPECIALIZATION_BRANCH = "SPECIALIZATION_BRANCH"
    COVERED_BY_EARLIER_RESOURCE = "COVERED_BY_EARLIER_RESOURCE"
    NO_RESOURCE_AVAILABLE = "NO_RESOURCE_AVAILABLE"
    EXPLORATORY_UNSUPPORTED = "EXPLORATORY_UNSUPPORTED"


class AdaptationEventType(str, Enum):
    CHECKPOINT_FAILED = "CHECKPOINT_FAILED"
    DIFFICULTY_FEEDBACK = "DIFFICULTY_FEEDBACK"
    INTEREST_CHANGED = "INTEREST_CHANGED"
```

### 4.2 Models

```python
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class LearnerProfile(BaseModel):
    user_id: str
    goal_raw: str                               # original free text, always stored verbatim
    target_role: Optional[str] = None           # e.g. "Machine Learning Engineer"
    target_skill: Optional[str] = None          # resolved DAG node id
    timeline_weeks: int = 24
    weekly_hours: float = 8.0
    experience_level: Optional[str] = None      # free text, e.g. "Basic Python" — display only
    learner_level: int = 1                      # 1=beginner, 2=intermediate, 3=advanced
    learning_format: LearningFormat = LearningFormat.HANDS_ON
    interest_domain: Optional[str] = None       # e.g. "NLP" — specialization + interest scoring
    skill_confidence: Dict[str, ConfidenceTier] = Field(default_factory=dict)


class Resource(BaseModel):
    id: str
    title: str
    skills_taught: List[str]                    # one or more DAG node ids
    topics: List[str] = Field(default_factory=list)  # structured tags for interest matching
    format: LearningFormat
    difficulty: str                             # display label: "beginner"/"intermediate"/"advanced"
    difficulty_level: int                       # 1/2/3 — the only field used in scoring
    estimated_hours: float
    quality_score: float                        # 0.0-1.0, curated
    is_refresher: bool = False                  # short consolidation resource, not a full module
    url: Optional[str] = None
    provider: Optional[str] = None


class ScoreBreakdown(BaseModel):
    difficulty_fit: float
    format_fit: float
    time_fit: float
    interest_alignment: float
    quality: float
    final_score: float


class RoadmapItem(BaseModel):
    skill_id: str
    skill_name: str
    phase: int
    state: RoadmapNodeState
    confidence_tier: ConfidenceTier
    learning_mode: LearningMode
    recommended_resource: Optional[Resource] = None
    score_breakdown: Optional[ScoreBreakdown] = None
    covered_by_resource_id: Optional[str] = None   # set when deduped (Section 1.8)
    reason_codes: List[ReasonCode] = Field(default_factory=list)
    reasoning: str = ""                            # rendered from reason_codes, no LLM required
    estimated_hours: float = 0.0
    is_refresher: bool = False
    is_exploratory: bool = False


class ExploratoryTopic(BaseModel):
    label: str
    note: str = "This area is outside our validated curriculum graph."


class AdaptationEvent(BaseModel):
    event_type: AdaptationEventType
    skill_id: Optional[str] = None
    score: Optional[float] = None              # 0.0-1.0, for CHECKPOINT_FAILED
    self_rating: Optional[int] = None          # 1-5
    feedback: Optional[str] = None             # "TOO_HARD" | "TOO_EASY"
    new_interest_domain: Optional[str] = None
```

**On numeric levels:** `learner_level` and `difficulty_level` are always small integers, NEVER compared via string matching or substring checks. An earlier draft compared `"beginner" in "basic python"`, which silently returns `False` almost always and breaks the entire difficulty-fit calculation. Never reintroduce string-based difficulty comparison.

**Normalization is the backend's job.** The parser may return `"Basic Python"`; a normalization layer converts it to `learner_level = 1` before anything touches the scoring code. Free text stays in `experience_level` for display only.

---

## 5. Confidence Model — Discrete State Machine

**Why not a weighted formula.** An earlier design used `confidence = 0.4·self_report + 0.3·completion + 0.3·checkpoint`. A learner who self-reports high and completes the module clears a 0.6 "mastered" threshold even after scoring 0 on the checkpoint (0.4 + 0.3 + 0 = 0.7). A checkpoint failure must override everything else, which an additive sum cannot express. This design is rejected — do not reintroduce it in any form.

### Transitions

```
UNKNOWN
   │  learner self-reports knowing this skill (no evidence)
   ▼
FAMILIAR
   │  learner completes a learning resource tagged with this skill
   ▼
DEVELOPING
   │  learner self-rates 4-5/5 at a checkpoint
   ▼
PRACTICED
   │  learner passes a hand-authored quiz (>= 50%), where one exists
   ▼
VERIFIED

FROM ANY STATE:
   self-rating 1-2/5  OR  quiz score < 50%   →   WEAK   (HARD OVERRIDE)

FROM WEAK:
   completes a refresher AND self-rates >= 3  →  DEVELOPING
   completes a refresher AND self-rates 1-2   →  stays WEAK
```

Rules that follow from this:

- The failure signal is a hard override, never averaged with positive evidence. `VERIFIED + failed checkpoint = WEAK`.
- Self-rating 4–5 advances **one** tier from wherever the skill currently is. It never skips a tier and never reaches VERIFIED.
- VERIFIED is reachable only by passing a quiz. Since quizzes exist for one skill in the MVP, VERIFIED will be rare — that is correct and intended.
- Self-rating 3 holds the current tier and sets a `needs_practice` flag; it never demotes.

### `learning_mode` derivation

| ConfidenceTier | learning_mode | Meaning |
|---|---|---|
| UNKNOWN | FULL_MODULE | Teach from scratch |
| FAMILIAR | REFRESHER | Light review — self-reported but unverified |
| DEVELOPING | PRACTICE | Hands-on exercise, not more theory |
| PRACTICED | PRACTICE (optional checkpoint) | Light validation, skippable if time-constrained |
| VERIFIED | SKIP | Excluded from the roadmap entirely |
| WEAK | REFRESHER (mandatory, before dependents) | Inserted by the adaptive manager |

### Assessment mechanism — final, build nothing more elaborate

- **System-wide default:** a 1–5 confidence slider after each module ("How confident do you feel with this skill?"). 1–2 → WEAK. 3 → hold + flag. 4–5 → advance one tier.
- **Demo-only:** a hand-authored 3-question multiple-choice quiz for `statistics_probability` only. Static data. Do not build a quiz bank for all 30–50 skills. Do not generate questions with an LLM, live or otherwise.
- Assume no assessment engine exists beyond this.

---

## 6. Recommendation Engine — Hard Filter, Then Weighted Score

A two-stage pipeline. **Do not merge the stages.** A resource that fails the filter must never receive a score, regardless of how well it would score on other dimensions. Skill relevance is not a weighted term:

```python
# WRONG — a resource that teaches nothing relevant can still win on format and quality
score = 0.4 * skill_match + 0.3 * difficulty + ...
```

### 6.1 Stage A — Hard filter

```python
eligible = [r for r in catalog if target_skill_id in r.skills_taught]
if not eligible:
    return None
```

If a resource does not teach the required skill it is not in the running. Full stop. When nothing is eligible, return `None` and let the roadmap item carry `reason_codes=[NO_RESOURCE_AVAILABLE]` — never substitute an unrelated resource.

For refresher lookups the filter additionally requires `r.is_refresher is True`.

### 6.2 Stage B — Weighted score

```
S(r) = 0.35 × DifficultyFit
     + 0.25 × FormatFit
     + 0.20 × TimeFit
     + 0.10 × InterestAlignment
     + 0.10 × QualityScore
```

Weights are named constants defined once, never magic numbers scattered through the code.

### 6.3 DifficultyFit — distance-based

```python
def compute_difficulty_fit(resource_level: int, learner_level: int, max_distance: int = 2) -> float:
    return max(0.0, 1.0 - abs(resource_level - learner_level) / max_distance)
```

Level 2 learner: level-2 resource → 1.0, level-1 or level-3 → 0.5. Gradual degradation, not all-or-nothing. Never binary, never substring.

### 6.4 TimeFit — milestone pacing

TimeFit measures whether a resource fits the learner's *milestone window*, not a single week. A 10-hour resource is a fine fit for someone with 8 hrs/week — it spans about a week and a half. Do not implement `resource_hours <= weekly_hours`, and do not reward resources merely for being short.

```python
MILESTONE_WINDOW_WEEKS = 2

def compute_time_fit(resource_hours: float, weekly_hours: float,
                     window_weeks: int = MILESTONE_WINDOW_WEEKS) -> float:
    capacity = max(weekly_hours * window_weeks, 1.0)
    ratio = resource_hours / capacity
    if 0.25 <= ratio <= 1.0:
        return 1.0                       # fills the milestone window well
    if ratio < 0.25:
        return 0.7                       # very short — fine, but thin for a milestone
    return max(0.2, 1.0 - (ratio - 1.0))  # long — gently penalized, never hard-cut
```

Sanity check at 8 hrs/week (capacity 16h): a 4h resource → 1.0, a 10h resource → 1.0, a 16h resource → 1.0, a 20h resource → 0.75, a 2h resource → 0.7. This is the intended behavior.

### 6.5 FormatFit — exact, compatible, or mismatched

```python
COMPATIBLE_FORMATS = {
    LearningFormat.HANDS_ON:    {LearningFormat.INTERACTIVE},
    LearningFormat.INTERACTIVE: {LearningFormat.HANDS_ON},
    LearningFormat.VIDEO:       {LearningFormat.INTERACTIVE},
    LearningFormat.READING:     {LearningFormat.VIDEO},
}

def compute_format_fit(resource_format: LearningFormat, preferred: LearningFormat) -> float:
    if resource_format == preferred:
        return 1.0
    if resource_format in COMPATIBLE_FORMATS.get(preferred, set()):
        return 0.7
    return 0.4
```

Keep the mapping this simple. Do not overengineer it.

### 6.6 InterestAlignment — structured tags only

```python
def compute_interest_alignment(resource_topics: List[str], interest_domain: Optional[str]) -> float:
    if not interest_domain:
        return 0.5                                  # neutral when no stated interest
    topics = {t.lower() for t in resource_topics}
    return 1.0 if interest_domain.lower() in topics else 0.3
```

Never `interest_domain.lower() in resource.title.lower()`. A course titled "Deep Learning for Vision" does not substring-match an interest of "Computer Vision", and the failure is silent. Every resource in `catalog.json` must have a populated `topics` list — do not skip this when authoring the catalog.

### 6.7 QualityScore

```python
quality = min(max(resource.quality_score, 0.0), 1.0)
```

Clamp defensively even though the catalog is curated.

### 6.8 Reference implementation

```python
from typing import List, Optional

SCORING_WEIGHTS = {
    "difficulty": 0.35,
    "format": 0.25,
    "time": 0.20,
    "interest": 0.10,
    "quality": 0.10,
}


def rank_resources_for_skill(target_skill_id: str,
                             catalog: List[Resource],
                             profile: LearnerProfile,
                             refresher_only: bool = False) -> List[dict]:
    # STAGE A — hard filter
    eligible = [r for r in catalog if target_skill_id in r.skills_taught]
    if refresher_only:
        eligible = [r for r in eligible if r.is_refresher]
    if not eligible:
        return []

    # STAGE B — score only the eligible
    scored = []
    for r in eligible:
        diff = compute_difficulty_fit(r.difficulty_level, profile.learner_level)
        fmt = compute_format_fit(r.format, profile.learning_format)
        time = compute_time_fit(r.estimated_hours, profile.weekly_hours)
        interest = compute_interest_alignment(r.topics, profile.interest_domain)
        quality = min(max(r.quality_score, 0.0), 1.0)

        total = (
            SCORING_WEIGHTS["difficulty"] * diff
            + SCORING_WEIGHTS["format"] * fmt
            + SCORING_WEIGHTS["time"] * time
            + SCORING_WEIGHTS["interest"] * interest
            + SCORING_WEIGHTS["quality"] * quality
        )
        scored.append({
            "resource": r,
            "breakdown": ScoreBreakdown(
                difficulty_fit=round(diff, 2),
                format_fit=round(fmt, 2),
                time_fit=round(time, 2),
                interest_alignment=round(interest, 2),
                quality=round(quality, 2),
                final_score=round(total, 4),
            ),
        })

    # Deterministic tie-break: score desc, then resource id asc
    scored.sort(key=lambda x: (-x["breakdown"].final_score, x["resource"].id))
    return scored


def get_best_resource(skill_id: str, catalog: List[Resource],
                      profile: LearnerProfile,
                      refresher_only: bool = False) -> Optional[dict]:
    """Single seam for resource selection. A future vector-based implementation
    swaps in here without touching the rest of the system."""
    ranked = rank_resources_for_skill(skill_id, catalog, profile, refresher_only)
    return ranked[0] if ranked else None
```

Always return `breakdown` in the API response — it powers the "why this resource" explanation without an LLM call.

---

## 7. Skill DAG, Gap Analysis, and Roadmap Generation

### 7.1 Graph structure

- `networkx.DiGraph()`, in-memory, built once at startup from a static `skill_dag.json` in node-link format. 30–50 nodes.
- Edges point prerequisite → dependent (`python_basics → numpy_pandas`).
- Node attributes: `name`, `description`, `domain`, `phase_hint`.

**Validate at startup and fail loudly:**

```python
if not nx.is_directed_acyclic_graph(graph):
    raise RuntimeError("skill_dag.json is not a DAG — refusing to start")
```

Never silently continue with an invalid graph.

Conceptual shape:

```
python_basics
├── python_oop
├── numpy_pandas
│   └── statistics_probability
│       └── ml_fundamentals
│           ├── model_evaluation
│           ├── regularization
│           ├── portfolio_project
│           ├── nlp_specialization
│           └── cv_specialization
└── ...
```

### 7.2 Gap traversal

```python
def get_required_skills(graph, target_skill: str, skill_confidence: dict) -> list:
    if target_skill not in graph:
        return []
    prereqs = nx.ancestors(graph, target_skill)
    prereqs.add(target_skill)
    verified = {s for s, tier in skill_confidence.items() if tier == ConfidenceTier.VERIFIED}
    missing = prereqs - verified
    subgraph = graph.subgraph(missing)
    return list(nx.topological_sort(subgraph))
```

**Only VERIFIED skills are excluded.** FAMILIAR, DEVELOPING, and PRACTICED skills stay in the roadmap with a lighter `learning_mode` — they are never silently dropped. This is the nuance that makes the product defensible: `required - known` is wrong, because a self-reported skill is not a demonstrated one.

If `nx.topological_sort` produces ties, break them deterministically by node id so the roadmap is reproducible run to run.

### 7.3 Roadmap assembly

For each skill in topological order:

1. Resolve `ConfidenceTier` → `LearningMode` (Section 5 table).
2. If `SKIP`, omit the item entirely.
3. Call `get_best_resource(skill_id, catalog, profile, refresher_only=(mode == REFRESHER))`.
4. **Dedupe (Section 1.8):** if the selected resource id already appears earlier in the roadmap, set `recommended_resource = None`, `covered_by_resource_id = <id>`, `estimated_hours = 0.0`, and add `COVERED_BY_EARLIER_RESOURCE`.
5. Emit `reason_codes`, then render `reasoning` from a template.
6. Assign `phase` from the node's `phase_hint`.
7. Set initial `state`: the first item with no unmet prerequisites is `AVAILABLE`; everything downstream is `LOCKED`.

**Timeline estimate:**

```python
total_hours = sum(item.estimated_hours for item in roadmap)
base_weeks = total_hours / max(profile.weekly_hours, 1.0)
min_weeks = round(base_weeks * 0.9)
max_weeks = round(base_weeks * 1.1)
```

Display as a range with its basis: "Estimated 22–26 weeks at ~8 hrs/week." Never a calendar date, never "you will finish on November 13 at 3:42 PM."

**Reasoning templates** (deterministic, no LLM):

| Reason code | Rendered text |
|---|---|
| `PREREQUISITE_OF_TARGET` | "Required before {next_dependent_name}." |
| `SELF_REPORTED_UNVERIFIED` | "You said you know this, so it's a short review rather than a full module." |
| `CHECKPOINT_FAILURE` | "Your recent checkpoint showed gaps here." |
| `COVERED_BY_EARLIER_RESOURCE` | "Covered by {resource_title}, already in your path." |
| `INTEREST_ALIGNMENT` | "Matches your interest in {interest_domain}." |
| `NO_RESOURCE_AVAILABLE` | "No curated resource yet — we'll flag this." |

### 7.4 Out-of-graph goals — no runtime mutation, ever

Two proposals were debated:

- **Rejected — the LLM inserts a new leaf node** attached to its "closest" existing parent. This is *structurally* safe (a leaf with one incoming edge cannot create a cycle) but not *semantically* safe: choosing the closest parent is a pedagogical judgment the LLM can get wrong invisibly, e.g. attaching "Medical Imaging Basics" under `python_basics` instead of under `cv_specialization`. A wrong-but-plausible insertion is worse than an honest "not supported yet," because it undermines the product's core claim of trustworthy sequencing.
- **Adopted** — map the goal to the nearest *supported* domain node already in the graph and generate a normal roadmap for that. Genuinely unsupported specifics go into a separate, clearly labeled **Exploratory / Unverified** panel.

Exploratory items are not NetworkX nodes, have no prerequisite edges, do not affect topological ordering, carry only a soft disclaimer (never a strong "X is required because Y"), and are visually marked as unverified.

```
Goal → Does it map fully inside the supported DAG?
         │
    ┌────┴────┐
   YES         NO
    │           │
    ▼           ▼
Normal path   Map to nearest supported parent domain
              + generate the normal path for that
              + list unsupported specifics in the Exploratory panel
```

Example for "I want to specialize in Quantum Machine Learning":

```
Supported Path                    Exploratory / Unverified
├── Python                        └── Quantum Machine Learning
├── Statistics                        "Not yet part of our validated
├── ML Fundamentals                    curriculum graph."
```

Future versions may add LLM-proposed nodes behind human curator approval. Explicitly out of MVP scope.

---

## 8. Adaptive Manager

Three triggers. Do not invent additional ad hoc adaptation logic. Priority order for implementation: CHECKPOINT_FAILED, then DIFFICULTY_FEEDBACK, then INTEREST_CHANGED.

### Trigger A — CHECKPOINT_FAILED (self-rating 1–2/5, or quiz < 50%)

```python
def adapt_on_checkpoint_failure(roadmap, profile, catalog, graph, skill_id, score):
    set_confidence(profile, skill_id, ConfidenceTier.WEAK)      # hard override
    refresher = get_best_resource(skill_id, catalog, profile, refresher_only=True)
    lock_dependents(roadmap, graph, skill_id)                   # everything downstream → LOCKED
    insert_before_dependents(roadmap, skill_id, refresher,
                             reason_codes=[ReasonCode.CHECKPOINT_FAILURE])
    recompute_next_best_action(roadmap)
    return roadmap
```

The refresher must come from the curated catalog. Never generate one.

Surface the reasoning explicitly in the UI:

> "We added a Statistics refresher before Machine Learning Fundamentals because your recent checkpoint showed gaps in probability concepts, which ML Fundamentals depends on."

### Trigger B — DIFFICULTY_FEEDBACK ("too hard" / "too easy")

- **TOO_HARD** → first check whether the learner actually holds the prerequisite skills at a sufficient tier. If not, insert the missing prerequisite before retrying. If prerequisites are fine, re-run the recommender for the same skill with `learner_level` temporarily reduced by one, and swap in the result.
- **TOO_EASY** → re-run with `learner_level` temporarily raised by one and swap in the result.

Either way, patch only the affected item and its unfinished dependents. Preserve completed progress, valid completed nodes, and unaffected branches.

### Trigger C — INTEREST_CHANGED (stretch goal)

```python
def adapt_on_interest_change(roadmap, profile, new_interest_domain):
    profile.interest_domain = new_interest_domain
    # Keep every item already COMPLETED or IN_PROGRESS, untouched.
    kept = [i for i in roadmap if i.state in (RoadmapNodeState.COMPLETED,
                                              RoadmapNodeState.IN_PROGRESS)]
    new_target = resolve_specialization_target(new_interest_domain)
    new_branch = generate_roadmap_segment(new_target, profile)
    return kept + new_branch
```

Re-run deterministic DAG traversal for the new branch. Do not rebuild the whole roadmap. Return an explicit diff so the UI can render it:

```
What stayed          What changed
✓ Python             NLP specialization → Computer Vision specialization
✓ Statistics
✓ ML Fundamentals
```

**Core rule, restated because it matters:** completed progress is immutable. Adaptation only ever touches the unfinished tail.

---

## 9. Canonical Demo Persona — Demo User

Use this name and data everywhere. Earlier drafts used "Alex" for an identical profile; no Alex reference may remain in code, data, comments, or demo materials.

```json
{
  "user_id": "demo_user",
  "goal_raw": "I want to become a Machine Learning Engineer in six months. I know basic Python.",
  "target_role": "Machine Learning Engineer",
  "target_skill": "ml_engineer_target",
  "timeline_weeks": 24,
  "weekly_hours": 8,
  "experience_level": "Basic Python",
  "learner_level": 1,
  "learning_format": "hands_on",
  "interest_domain": "NLP",
  "skill_confidence": { "python_basics": "FAMILIAR" }
}
```

Background: career switcher. Learning budget ~190 hours.

### Timeline target

```
Phase                          Est. Hours
Python Review + Data Tools     25
Statistics & Probability       30
ML Fundamentals                45
Portfolio Project              30
NLP Specialization             35
Capstone + Revision            25
TOTAL                         190 hours

190 / 8 ≈ 24 weeks → displayed range 22-26 weeks  ✓
```

**Author `catalog.json` backward from this table.** The 190 figure is a target, but the number the system actually prints comes from `sum(item.estimated_hours)` after deduplication. Set resource hours so the computed total lands near 190, then verify by running the generator — do not assume it. If it drifts, adjust the catalog, not the display.

### Demo script

**Step 1 — Goal input.** Demo User types the `goal_raw` text on the Discovery screen.

**Step 2 — Extraction and cards.** The parser extracts `target_role`, `timeline_weeks`, and `python_basics: FAMILIAR`. It cannot extract `weekly_hours`, `learning_format`, or `interest_domain`. Those three appear as interactive cards. Demo User selects 8 hrs/week, hands-on, NLP. Fields already extracted are never re-asked.

**Step 3 — Confidence handling.** Demo User said she knows Python. This does **not** skip Python. `python_basics` is FAMILIAR → `REFRESHER`, so a Python review appears in the path. This is the moment that demonstrates tiered confidence — call it out during the demo.

**Step 4 — Roadmap generated.**

```
Phase 1: Python Review (REFRESHER) → Python OOP (FULL_MODULE) → NumPy & Pandas (FULL_MODULE)
Phase 2: Statistics & Probability (FULL_MODULE)
Phase 3: Machine Learning Fundamentals (FULL_MODULE) → Model Evaluation
Phase 4: ML Portfolio Project
Phase 5: NLP Specialization
Phase 6: Capstone
```

Dashboard shows "Estimated 22–26 weeks at ~8 hrs/week." The order comes from NetworkX, not from a hardcoded list.

**Step 5 — The adaptive moment (the core beat).** Demo User reaches Statistics & Probability and takes the hand-authored 3-question quiz. She scores 1/3 (33%). This fires `CHECKPOINT_FAILED`: `statistics_probability` is force-set to WEAK regardless of prior state, `ml_fundamentals` stays LOCKED, and the curated Statistics refresher is inserted before it.

```
Next Best Action (before):  Begin Machine Learning Fundamentals
Next Best Action (after):   Review Statistics Fundamentals
```

Make this visually obvious. It is the single most important moment in the demo.

**Step 6 — Interest change (stretch, only if everything above works).** Demo User says she is now more interested in Computer Vision. `INTEREST_CHANGED` fires: Python, Statistics, and ML Fundamentals are untouched; only the not-yet-started NLP branch is swapped for Computer Vision. The dashboard shows kept vs. swapped nodes.

This one scenario exercises every claim in Section 0 — cold-start handling, tiered confidence, explainable sequencing, performance-based adaptation, and interest-based adaptation — without touching the out-of-graph path, which is deliberately not part of the primary demo.

---

## 10. UI — Four Screens

### Screen 1 — Discovery

One large free-text input: "What do you want to learn or achieve?" One button: "Build My Path." No other fields.

### Screen 2 — Profile Completion

Appears only if extraction left fields unfilled. Show only the missing fields, as tappable cards or chips — not a form, and never re-asking anything already extracted.

```
Weekly Time:     [4 hrs] [6 hrs] [8 hrs] [10+ hrs]
Learning Style:  [Video] [Hands-on] [Interactive] [Reading]
Interest Area:   [NLP] [Computer Vision] [General ML]
```

### Screen 3 — Path Generation Transition

A brief animated checklist of the actual pipeline steps:

```
Understanding your goal ✓
Mapping prerequisite skills ✓
Checking your current knowledge ✓
Finding the best resources ✓
Building your learning path...
```

Purely presentational, but it communicates the deterministic pipeline to a non-technical viewer. Avoid fake claims like "AI is thinking deeply..." — show the real steps.

### Screen 4 — Dashboard

```
┌───────────────────────────────────────────────────────────────┐
│ Goal: Machine Learning Engineer            Progress: 12%      │
├───────────────────────────────────────────────────────────────┤
│                 INTERACTIVE LEARNING ROADMAP                  │
│   Python ──► Statistics ──► ML Fundamentals ──► NLP           │
│        │                                                      │
│        └── Refresher (if triggered)                           │
├───────────────────────────────────────────────────────────────┤
│ NEXT BEST ACTION                                              │
│ Review Statistics Fundamentals                                │
│ 2 hours • Interactive • Recommended because...                │
│ [Start Learning]                                              │
└───────────────────────────────────────────────────────────────┘
```

Sections:

- **Top summary:** goal, estimated pace range, overall progress percentage.
- **Interactive roadmap visualization** — completed / current / locked nodes, React Flow (or Cytoscape if already installed).
- **Next Best Action card** — the single most relevant next step with its `reasoning`, estimated effort, and format. The most important element in the product; the learner should never have to ask "what do I do now?"
- **Skill progress breakdown** — per-skill confidence tier, e.g. "4 / 18 skills completed."
- **AI Assistant drawer** — floating chat answering "why am I learning this?", "can I skip Python OOP?", "what if I have less time this week?"

### Assistant boundary

The assistant may read the profile, roadmap, current skill, prerequisite relationships, confidence states, and score breakdowns. It phrases the deterministic reasoning already attached to each `RoadmapItem`. It must never silently modify the DAG, roadmap order, recommendation ranking, or confidence state. All adaptation happens through explicit events and endpoints.

Expected shape of an answer:

> "Statistics comes before Machine Learning because the curated skill graph defines it as a prerequisite for probability, model evaluation, and core ML concepts."

---

## 11. API Contracts

### POST `/api/onboard/parse`

```json
// Request
{ "goal_raw": "I want to become a Machine Learning Engineer in six months. I know basic Python." }

// Response
{
  "profile": {
    "target_role": "Machine Learning Engineer",
    "timeline_weeks": 24,
    "experience_level": "Basic Python",
    "learner_level": 1,
    "skill_confidence": { "python_basics": "FAMILIAR" },
    "weekly_hours": null,
    "learning_format": null,
    "interest_domain": null
  },
  "missing_fields": ["weekly_hours", "learning_format", "interest_domain"]
}
```

### POST `/api/roadmap/generate`

```json
// Request
{ "profile": { /* complete LearnerProfile */ } }

// Response
{
  "roadmap": [ /* RoadmapItem */ ],
  "next_best_action": { /* RoadmapItem */ },
  "estimated_total_hours": 190,
  "estimated_duration_range": { "min_weeks": 22, "max_weeks": 26 },
  "exploratory_topics": []
}
```

### POST `/api/roadmap/adapt`

```json
// Request
{ "event_type": "CHECKPOINT_FAILED", "skill_id": "statistics_probability", "score": 0.33 }

// Response
{
  "adaptation": {
    "action": "REFRESHER_INSERTED",
    "reason_codes": ["CHECKPOINT_FAILURE"],
    "reason": "Your checkpoint score indicates core statistical concepts need reinforcement.",
    "kept": ["python_basics", "python_oop", "numpy_pandas"],
    "changed": ["statistics_probability"]
  },
  "updated_roadmap": [ /* RoadmapItem */ ],
  "next_best_action": { /* RoadmapItem */ }
}
```

### POST `/api/assistant/explain`

```json
// Request
{ "question": "Why am I learning statistics right now?",
  "roadmap_context": [], "profile": {} }

// Response
{ "answer": "<natural language, generated from the reason codes already attached to the relevant RoadmapItem>" }
```

### LLM output boundary

The parser must return only structured fields. Correct:

```json
{ "target_role": "Machine Learning Engineer",
  "known_skills": [{ "skill": "python_basics", "confidence": "FAMILIAR" }],
  "timeline_weeks": 24 }
```

Must be rejected:

```json
{ "roadmap": ["Learn PyTorch", "Then Python", "Then Statistics"] }
```

Validate against Pydantic and retry on failure. If the LLM ever outputs a sequence or ordering, that is a prompt-design bug — tighten the system prompt and the validation. Never accept it.

---

## 12. Project Structure

```
learning-path-engine/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── onboarding.py       # /api/onboard/parse
│   │   │   ├── roadmap.py          # /api/roadmap/generate, /api/roadmap/adapt
│   │   │   └── assistant.py        # /api/assistant/explain
│   │   ├── core/
│   │   │   ├── dag_engine.py       # graph load, validate, ancestors, topo sort
│   │   │   ├── confidence.py       # discrete state machine (Section 5)
│   │   │   ├── recommender.py      # hard filter + weighted scoring (Section 6)
│   │   │   ├── roadmap_builder.py  # assembly, dedupe, phases, timeline (Section 7.3)
│   │   │   ├── reasoning.py        # reason codes → templated prose
│   │   │   └── adaptation.py       # three triggers (Section 8)
│   │   ├── schemas/
│   │   │   ├── learner.py
│   │   │   ├── resource.py
│   │   │   ├── roadmap.py
│   │   │   └── events.py
│   │   ├── data/
│   │   │   ├── skill_dag.json      # 30-50 nodes, node-link format
│   │   │   ├── catalog.json        # ~60 resources, topics + skills_taught populated
│   │   │   └── quiz_bank.json      # 3 hand-authored MCQs, statistics_probability only
│   │   ├── services/
│   │   │   └── llm_service.py      # NLU/NLG only
│   │   └── main.py                 # FastAPI app, startup DAG validation
│   ├── tests/
│   └── requirements.txt
└── frontend/
    └── src/
        ├── views/                  # Discovery, ProfileCards, Generation, Dashboard
        ├── components/             # RoadmapGraph, NextBestAction, AssistantDrawer
        ├── services/               # API client
        └── types/                  # TypeScript mirrors of the Pydantic schemas
```

Stack: Python, FastAPI, Pydantic, NetworkX on the backend; React, TypeScript, Tailwind, React Flow on the frontend.

---

## 13. Build Order

Each step must be independently testable before moving on.

### Sprint 1 — Deterministic core (no LLM, no FastAPI, no React)

1. Pydantic schemas (Section 4).
2. `skill_dag.json` with 30–50 nodes + `dag_engine.py` (load, DAG validation, ancestors, topological sort with deterministic tie-breaking).
3. `confidence.py` state machine (Section 5).
4. `catalog.json` with ~60 resources — `topics`, `skills_taught`, `difficulty_level`, `estimated_hours`, `quality_score`, `is_refresher` all populated — plus `recommender.py` (both stages).
5. Construct Demo User's profile in a plain script, run generation end to end, print the roadmap, and verify it matches Section 9's phase breakdown and lands near 190 hours. **Do this before writing a single line of FastAPI or React.**
6. Simulate the checkpoint failure against that roadmap and verify the refresher is inserted, dependents stay LOCKED, and Next Best Action changes — still in a script.

### Sprint 2 — Roadmap intelligence

7. Full roadmap generator: phases, dedupe, reason codes, `reasoning` rendering.
8. Timeline estimator producing a range.
9. All three adaptation triggers, tested against Demo User's scenario.

### Sprint 3 — AI layer

10. LLM goal parser with the strict output boundary, Pydantic validation, retry on failure.
11. Normalization layer (free text → `learner_level`, format enum).
12. Missing-field detection driving which cards appear.
13. Assistant explanation generation wrapping existing reason codes — it phrases, it does not invent.

### Sprint 4 — API and frontend

14. Wire the four endpoints around the Sprint 1–3 logic. No business logic in route handlers.
15. Build the four screens in order: Discovery → Profile Cards → Generation → Dashboard. The UI consumes backend-generated state; Demo User may seed demo data, but never hardcode her roadmap into components.
16. Full end-to-end pass of the demo script, including the interest-change step if time allows.

**Do not start Sprint 4 before Sprint 1 is working and manually verified against Demo User's data.** The deterministic core is the actual product; the frontend and LLM integration are presentation around it.

---

## 14. Testing Requirements

### DAG
- Graph loads and passes `is_directed_acyclic_graph`; an invalid graph raises at startup.
- Unknown target skill is handled without crashing.
- Ancestor ordering is correct across multiple prerequisite paths.
- Topological ordering is deterministic across repeated runs.

### Confidence
- `UNKNOWN → FAMILIAR → DEVELOPING → PRACTICED → VERIFIED` each transition on its correct trigger.
- **`VERIFIED` + failed checkpoint = `WEAK`.** This test is mandatory.
- Self-rating 3 holds the tier and never demotes.
- Self-rating 5 on PRACTICED does not reach VERIFIED without a quiz.
- `WEAK` + refresher completion + rating ≥ 3 = `DEVELOPING`.

### Recommender
- A resource not teaching the target skill never enters the eligible pool, regardless of quality or format.
- Empty eligible pool returns `None`, not a substitute.
- Difficulty fit degrades with distance, not binary.
- Interest alignment uses `topics`, never the title.
- **TimeFit: a 10-hour resource at 8 hrs/week scores 1.0.** This test would have caught the original bug.
- Quality clamps at both ends.
- Highest score sorts first; ties break deterministically.
- Refresher lookup returns only `is_refresher` resources.

### Roadmap
- A resource teaching two skills appears once; hours counted once; total is stable.
- VERIFIED skills are excluded; FAMILIAR skills are present with `REFRESHER` mode.
- Demo User's generated total lands within tolerance of 190 hours.
- Duration is returned as a range, never a single week count or a date.

### Adaptation
- Failed checkpoint inserts a refresher before the dependent skill.
- Completed progress is preserved byte-identical across all three triggers.
- Dependent nodes remain correctly ordered and locked.
- Interest change swaps only the specialization branch.

---

## 15. Final Consistency Checklist

Verify each before calling the implementation complete.

- [ ] Canonical persona is **Demo User**. No "Alex" anywhere in code, data, comments, or docs.
- [ ] No runtime graph mutation of any kind.
- [ ] LLM parses and explains. LLM does not sequence, rank, or mutate.
- [ ] Confidence is a state machine. No weighted averaging. Failure is a hard override.
- [ ] Recommendation is hard filter first, score second — never one blended formula.
- [ ] Difficulty is distance-based on 1–3 integers. No substring comparison anywhere.
- [ ] Interest uses structured `topics` overlap. No title matching.
- [ ] TimeFit uses milestone-window capacity, not weekly hours. A 10h resource at 8 hrs/week scores 1.0.
- [ ] `skills_taught` is a list; the hard filter uses membership; results are deduped by resource id.
- [ ] Timeline is a derived range with no fake precision.
- [ ] Every roadmap item carries `reason_codes`; `reasoning` renders without an LLM call.
- [ ] Weights, thresholds, and window sizes are named constants — no magic numbers.
- [ ] Node ids and API keys match Section 1.9 throughout.

---

## 16. Architectural Summary

```
                  USER
                   │
                   ▼
         Natural Language Goal
                   │
                   ▼
           LLM Goal Parser  (NLU ONLY)
                   │
                   ▼
          Normalization Layer
                   │
                   ▼
      Missing Field Completion Cards
                   │
                   ▼
         Final Learner Profile
                   │
                   ▼
           NetworkX Skill DAG
     (deterministic prerequisite logic)
                   │
                   ▼
       Skill Confidence State Machine
                   │
                   ▼
           Skill Gap Analysis
                   │
                   ▼
          Topological Ordering
                   │
                   ▼
     Hard Resource Skill Filtering
                   │
                   ▼
     5-Factor Personalized Scoring
                   │
                   ▼
      Roadmap + Reason Codes
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
 Next Best Action      Interactive DAG
        │
        ▼
  Learner Feedback
        │
        ▼
 Adaptive Event Manager
        │
        ▼
  Patch Remaining Path
```

> The system should feel intelligent because it understands the learner, and remain trustworthy because its curriculum logic and recommendations are deterministic, inspectable, and explainable.

---

## 17. Instruction to the Implementer

Do not propose a different architecture. Do not simplify away the hard parts. Do not replace deterministic logic with LLM calls. Do not reintroduce weighted confidence averaging, binary difficulty matching, title-substring interest matching, or `resource_hours <= weekly_hours` time fitting. Do not mutate the graph.

Start by inspecting the existing repository. Then report what exists, identify gaps against this document, propose the exact implementation sequence, implement incrementally, run tests after each core engine, keep the frontend connected to real backend logic, and validate the complete Demo User flow end to end.

Where a detail is ambiguous, prefer the deterministic and explainable interpretation consistent with this specification rather than inventing new architecture.

**This document is the final source of truth for the MVP.**
