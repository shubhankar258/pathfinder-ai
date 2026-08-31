# Pathfinder — AI-Powered Personalized Learning Path Recommender

## Solution Documentation

---

## 1. Problem Understanding

### 1.1 The Core Problem

Online learning platforms host thousands of courses across diverse domains, yet learners consistently struggle with three critical challenges:

1. **Sequencing Paralysis**: Learners cannot identify the correct *order* of courses needed to reach a career goal. A beginner aiming for "Machine Learning Engineer" doesn't know whether to start with Python, statistics, or linear algebra.
2. **Skill Gap Blindness**: Learners often skip prerequisites they don't realize they're missing, leading to frustration and dropout when advanced material assumes foundational knowledge.
3. **One-Size-Fits-All Curricula**: Existing platforms recommend the same courses regardless of a learner's existing skills, available study time, preferred learning format, or career specialization.

### 1.2 What's Needed

An intelligent system that:
- Understands a learner's **natural-language career goal** (e.g., "I want to become a cybersecurity analyst in 12 months")
- Analyzes the learner's **existing knowledge, preferences, and constraints**
- Identifies **prerequisite skill gaps** automatically
- Generates a **structured, sequenced roadmap** of courses, projects, and assessments tailored to the individual
- **Adapts dynamically** when the learner struggles, changes interests, or provides feedback

---

## 2. Solution Approach

### 2.1 Architectural Philosophy

> **The LLM is strictly confined to Natural Language Understanding (extracting structured intent from goals) and Natural Language Generation (explaining prerequisite decisions to the learner). All skill sequencing, prerequisite gap analysis, resource scoring, milestone capacity estimation, and confidence transitions are 100% deterministic Python running against a curated Directed Acyclic Graph (DAG).**

This design choice ensures:
- **Reproducibility**: The same inputs always produce the same roadmap (no hallucinated course sequences).
- **Explainability**: Every recommendation has a traceable mathematical score and a human-readable reason.
- **Reliability**: No dependency on LLM availability for core curriculum generation — the engine works offline.

### 2.2 Solution Overview

Pathfinder operates as a three-layer intelligent pipeline:

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: Natural Language Understanding (NLU)          │
│  Parses "I want to learn cybersecurity in 12 months"    │
│  → { goal: "cybersecurity", timeline: 12, level: 1 }   │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: Deterministic Curriculum Engine               │
│  DAG traversal → Gap analysis → Topological sort        │
│  → 5-factor resource scoring → Deduplication            │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: Adaptive Learning Loop                        │
│  Quiz checkpoints → Confidence state machine            │
│  → Refresher injection → Track switching                │
└─────────────────────────────────────────────────────────┘
```

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
                    ┌──────────────────┐
                    │   React Frontend │
                    │   (Vite + TS)    │
                    └────────┬─────────┘
                             │  HTTP / REST
                             ▼
                    ┌──────────────────┐
                    │  FastAPI Backend  │
                    │  (Python 3.10+)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌──────────────┐ ┌──────────┐ ┌────────────────┐
     │  DAG Engine  │ │Recommender│ │  Adaptation    │
     │  (NetworkX)  │ │ (5-Factor)│ │  Engine        │
     └──────┬───────┘ └────┬─────┘ └───────┬────────┘
            │              │               │
            ▼              ▼               ▼
     ┌──────────────────────────────────────────────┐
     │        Curated JSON Data Layer               │
     │  skill_dag.json │ catalog.json │ quiz_bank   │
     └──────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Interactive UI with type safety |
| **Animations** | GSAP + OGL (WebGL) | Smooth card transitions and ambient particle waves |
| **Backend** | FastAPI (Python) | Async REST API with auto-generated OpenAPI docs |
| **Graph Engine** | NetworkX | Directed Acyclic Graph operations and topological sorting |
| **Validation** | Pydantic v2 | Strict schema enforcement for all data models |
| **Testing** | pytest + httpx | 32 automated unit and integration tests |
| **Data** | Curated JSON files | 61-node skill DAG, 83-resource catalog, quiz bank |

### 3.3 Project Structure

```
pathfinder-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints: parse, generate, adapt, quiz, dag
│   │   ├── core/            # Deterministic engines (dag, recommender, confidence, adaptation)
│   │   ├── data/            # Curated datasets (skill_dag.json, catalog.json, quiz_bank.json)
│   │   ├── schemas/         # Pydantic models (learner, resource, roadmap, events)
│   │   └── services/        # NLU goal parser & grounded assistant generator
│   └── tests/               # Automated test suite (32 tests, 100% pass rate)
├── frontend/
│   ├── src/
│   │   ├── components/      # CardNav, Threads, NextBestAction, RoadmapGraph, QuizModal
│   │   ├── views/           # DiscoveryView, ProfileCardsView, GenerationView, DashboardView
│   │   └── styles/          # Clean light mode design system
│   └── vite.config.ts       # Dev proxy to backend
├── api/                     # Vercel serverless entrypoint
├── vercel.json              # Vercel deployment configuration
└── start.py                 # Unified local launcher
```

---

## 4. AI/ML Techniques Used

### 4.1 Directed Acyclic Graph (DAG) — Prerequisite Modeling

The foundation of Pathfinder is a **curated 61-node, 67-edge NetworkX DiGraph** that models skill dependencies across three domains:

- **Machine Learning / Data Science** (e.g., Python Basics → Statistics → ML Fundamentals → Deep Learning → NLP/CV)
- **Cybersecurity** (e.g., Networking Fundamentals → Linux Administration → Cryptography → Web App Security → Penetration Testing)
- **Full-Stack Web Development** (e.g., HTML/CSS → JavaScript → React → Node.js → System Design)

**Key Operations:**
- **Acyclicity validation** at startup (`nx.is_directed_acyclic_graph`) — prevents circular prerequisite loops
- **Ancestor closure** (`nx.ancestors`) — finds all transitive prerequisites for any target skill
- **Descendant traversal** (`nx.descendants`) — identifies downstream skills affected by checkpoint failures

### 4.2 Kahn's Topological Sort with Phase Prioritization

Standard topological sort produces arbitrary valid orderings. Pathfinder uses a **modified Kahn's algorithm with a min-heap keyed on `(phase_hint, node_id)`** to ensure:

1. **Phase-aligned sequencing**: Foundation skills (Phase 1) always precede intermediate skills (Phase 3), which precede advanced skills (Phase 5–6).
2. **Deterministic tie-breaking**: When two skills have the same phase, alphabetical node ID determines order — ensuring identical inputs always produce identical roadmaps.

```python
# Kahn's algorithm with min-heap for deterministic, phase-aligned topological sort
heap = [(phase_hint, node_id) for node in zero_in_degree_nodes]
while heap:
    phase, u = heapq.heappop(heap)
    ordered_skills.append(u)
    for v in successors(u):
        in_degree[v] -= 1
        if in_degree[v] == 0:
            heapq.heappush(heap, (v_phase, v))
```

### 4.3 Five-Factor Personalized Recommender

For each skill in the roadmap, Pathfinder selects the best learning resource using a **two-stage pipeline**:

**Stage A — Hard Filter:**
Only resources whose `skills_taught` array contains the target skill pass through.

**Stage B — Weighted Scoring:**

$$S(r) = 0.35 \times \text{DifficultyFit} + 0.25 \times \text{FormatFit} + 0.20 \times \text{TimeFit} + 0.10 \times \text{InterestAlignment} + 0.10 \times \text{QualityScore}$$

| Factor | Weight | Calculation |
|--------|--------|-------------|
| **Difficulty Fit** | 35% | `1.0 - |resource_level - learner_level| / 2` — penalizes resources too easy or too hard |
| **Format Fit** | 25% | Exact match = 1.0, compatible format = 0.7, mismatch = 0.4 |
| **Time Fit** | 20% | Evaluates resource duration against a 2-week milestone capacity window (`weekly_hours × 2`) |
| **Interest Alignment** | 10% | 1.0 if resource topics match learner's stated interest domain, else 0.3 |
| **Quality Score** | 10% | Curated quality rating (0.0–1.0) from resource metadata |

### 4.4 Discrete Confidence State Machine

Each skill tracks learner confidence through a **non-additive finite state machine**:

```
UNKNOWN → FAMILIAR → DEVELOPING → PRACTICED → VERIFIED
                                                  ↑
                                    (quiz ≥ 50%)  │
                                                  │
    WEAK ←──────── (quiz < 50% or self-rating 1-2)
     │
     └── Triggers REFRESHER mode + locks downstream dependents
```

**Key Rules:**
- Only `VERIFIED` skills are excluded from the roadmap (self-reported familiarity still gets refresher material)
- Any checkpoint score < 50% triggers a **hard override to `WEAK`**, regardless of previous confidence
- `WEAK` status propagates to lock all downstream dependent skills until the refresher is completed

### 4.5 Multi-Skill Resource Deduplication

Comprehensive courses often teach multiple skills (e.g., a "Complete Python Bootcamp" covers both `python_basics` and `python_oop`). Pathfinder's deduplication algorithm:

1. Assigns the full resource duration to the **first skill** in topological order
2. Later skills taught by the same resource receive `covered_by_resource_id` with **0.0 hours**
3. This prevents double-counting study time and ensures accurate timeline estimation

### 4.6 Three Dynamic Adaptation Triggers

| Trigger | When It Fires | What Happens |
|---------|---------------|--------------|
| `CHECKPOINT_FAILED` | Quiz score < 50% or self-rating 1–2 | Confidence → WEAK, refresher injected, downstream skills locked |
| `DIFFICULTY_FEEDBACK` | Learner reports "Too Hard" or "Too Easy" | Learner level adjusted, resources re-scored with new difficulty fit |
| `INTEREST_CHANGED` | Learner switches specialization track | Completed progress preserved, new branch generated from DAG |

### 4.7 Natural Language Understanding (NLU)

The NLU layer parses free-text career goals into structured profiles:

**Input:** `"I want to learn cybersecurity in 12 months"`

**Output:**
```json
{
  "goal_description": "Learn cybersecurity",
  "target_skills": ["network_security", "ethical_hacking"],
  "timeline_months": 12,
  "learner_level": 1,
  "weekly_hours": 8
}
```

This uses structured keyword extraction and domain mapping — not generative LLM text — ensuring consistent and predictable parsing.

---

## 5. Key Features and Workflows

### 5.1 End-to-End User Workflow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│  Discovery   │ →  │  Profile     │ →  │  Generation  │ →  │   Dashboard    │
│  (Goal Input)│    │  (Preferences)│    │  (Building)  │    │  (Roadmap +    │
│              │    │              │    │              │    │   Adaptation)  │
└─────────────┘    └──────────────┘    └──────────────┘    └────────────────┘
```

1. **Discovery View**: Learner enters a natural-language career goal or selects a demo preset (ML Engineer, Cybersecurity Analyst, Full-Stack Developer)
2. **Profile Cards View**: Learner sets preferences — experience level, preferred learning format (video/reading/hands-on/interactive), weekly study hours, and interest domain
3. **Generation View**: Animated synthesis HUD shows the engine processing the DAG, scoring resources, and building the roadmap
4. **Dashboard View**: Interactive bento-grid dashboard with:
   - **Next Best Action** card with direct course link
   - **Full Roadmap Graph** organized by learning phases
   - **5-Factor Score Inspector** for any module
   - **Interactive MCQ Quiz Checkpoints**
   - **AI Prerequisite Assistant** drawer
   - **Adaptive triggers** (checkpoint failure, difficulty feedback, track switching)

### 5.2 Key Feature: Personalized Multi-Domain Roadmaps

Pathfinder supports three full learning domains, each with a complete prerequisite DAG:

| Domain | Nodes | Example Path |
|--------|-------|--------------|
| **ML / Data Science** | 22 nodes | Python → Statistics → ML Fundamentals → Deep Learning → NLP/CV |
| **Cybersecurity** | 20 nodes | Networking → Linux → Cryptography → Web Security → Pen Testing → Incident Response |
| **Full-Stack Web Dev** | 19 nodes | HTML/CSS → JavaScript → React → Node.js → Databases → DevOps → System Design |

### 5.3 Key Feature: Real-Time Adaptive Learning

The dashboard provides three live adaptation controls:
- **"Simulate Checkpoint Failure (33%)"** — instantly demonstrates how the engine injects a refresher and locks downstream skills
- **"Switch Track (Computer Vision)"** — shows real-time specialization pivoting while preserving completed foundations
- **Interactive Quiz Checkpoints** — hand-authored MCQ quizzes that feed real scores into the confidence state machine

### 5.4 Key Feature: Authentic Resource Links

All 83 resources in the catalog link to **real, verified courses and documentation** from authoritative providers:

| Provider | Example Resources |
|----------|------------------|
| Coursera | Andrew Ng's Machine Learning Specialization, IBM Cybersecurity Analyst |
| MIT OpenCourseWare | 6.0001 Introduction to CS, 18.06 Linear Algebra |
| Python.org | Official Python Tutorial |
| MDN Web Docs | HTML, CSS, JavaScript references |
| PortSwigger | Web Security Academy |
| Real Python | Python OOP, Data Structures tutorials |
| Fast.ai | Practical Deep Learning for Coders |
| Docker Docs | Official Docker Getting Started |

### 5.5 Key Feature: Explainable 5-Factor Scoring

Every recommended resource shows a transparent mathematical breakdown:
- Users can click **"Fit"** on any module to see exactly *why* that specific course was chosen
- Each factor (Difficulty Fit, Format Fit, Time Fit, Interest Alignment, Quality) is displayed with its individual score and weight

---

## 6. Challenges Faced and Solutions

### Challenge 1: Preventing Hallucinated Course Sequences

**Problem:** LLM-based curriculum generators often produce plausible-sounding but incorrect prerequisite orderings (e.g., suggesting Deep Learning before Statistics).

**Solution:** We confined the LLM to NLU/NLG only and built all sequencing on a **curated, human-verified DAG validated for acyclicity at startup**. The topological sort guarantee means no skill ever appears before its prerequisites.

### Challenge 2: Deterministic Reproducibility

**Problem:** Many AI recommendation systems produce different outputs for identical inputs, making debugging and trust-building difficult.

**Solution:** We use **Kahn's algorithm with deterministic tie-breaking** (phase_hint, then alphabetical node_id). The same profile always generates the exact same roadmap — testable with automated assertions (e.g., canonical ML path = exactly 190.0 hours).

### Challenge 3: Accurate Timeline Estimation with Shared Resources

**Problem:** A single comprehensive course may teach multiple skills. Naively counting its hours for each skill inflates the total timeline.

**Solution:** We implemented **multi-skill resource deduplication** — the first skill in topological order gets the full duration, and subsequent skills taught by the same resource get `covered_by_resource_id` with 0.0 hours.

### Challenge 4: Balancing Adaptation with Progress Preservation

**Problem:** When a learner changes interests or fails a checkpoint, the system must adapt without discarding completed work.

**Solution:** Our adaptation engine treats **completed progress as strictly immutable**. Only the unfinished tail of the roadmap is modified. Track switches preserve all completed foundational skills and only regenerate the specialization branch.

### Challenge 5: Multi-Domain DAG Scalability

**Problem:** Supporting multiple career domains (ML, Cybersecurity, Full-Stack) requires a large, interconnected skill graph without cycles.

**Solution:** We structured the DAG with **domain-prefixed node IDs** and carefully designed cross-domain edges. NetworkX's `is_directed_acyclic_graph` validation runs at startup, and our test suite verifies path generation across all three domains.

### Challenge 6: Meaningful Resource Recommendations

**Problem:** Generic course recommendations don't account for individual learner constraints (time, format preference, difficulty level).

**Solution:** The **five-factor weighted scoring formula** evaluates every eligible resource across difficulty fit, format compatibility, time pacing, interest alignment, and quality — producing a single transparent score that adapts to each learner's unique profile.

---

## 7. Testing and Verification

### 7.1 Automated Test Suite

The project includes **32 automated tests** with a **100% pass rate**, covering:

| Test Category | Count | What's Verified |
|--------------|-------|-----------------|
| DAG Operations | 6 | Acyclicity, ancestor closure, prerequisite traversal |
| Confidence Transitions | 4 | State machine rules, WEAK hard override |
| 5-Factor Scoring | 5 | Individual factor calculations, weight application |
| Resource Deduplication | 3 | Multi-skill courses, 0-hour covered items |
| Roadmap Generation | 6 | ML, Cybersecurity, Full-Stack path validity |
| Adaptation Events | 4 | Checkpoint failure, difficulty feedback, track switching |
| API Integration | 4 | End-to-end HTTP request/response validation |

### 7.2 Deterministic Verification

A standalone verification script (`verify_sprint1.py`) confirms:
- DAG loads with exactly 61 nodes and 67 edges
- Canonical ML demo path totals exactly 190.0 hours
- Tiered confidence transitions produce expected REFRESHER modes
- Adaptation events maintain progress immutability

---

## 8. Local Setup and Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Quick Start
```bash
git clone https://github.com/shubhankar258/pathfinder-ai.git
cd pathfinder-ai
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
python start.py
```

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://127.0.0.1:8000/docs

### Run Tests
```bash
cd backend
pytest -v
```

---

## 9. Future Enhancements

1. **LLM-Powered Conversational Onboarding**: Replace keyword-based NLU with a fine-tuned LLM for richer goal extraction
2. **Progress Persistence**: Add database-backed user accounts with persistent roadmap state
3. **Spaced Repetition Integration**: Schedule review sessions based on forgetting curves
4. **Community DAG Contributions**: Allow domain experts to propose new skill nodes and edges via pull requests
5. **Learning Analytics Dashboard**: Track study time, quiz performance trends, and completion velocity over time

---

*Pathfinder — Adaptive AI Learning Path Engine v1.0*
*Built with FastAPI, React, NetworkX, and TypeScript*
