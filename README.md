# Pathfinder — Adaptive AI Learning Path Engine

An adaptive AI learning companion that converts natural-language goals into explainable, prerequisite-aware roadmaps, and continuously adapts that roadmap based on learner confidence, performance, and changing interests.

---

## 🌟 Governing Architectural Principle

> **The LLM is used ONLY for natural language understanding (parsing goals, extracting structured fields) and natural language generation (phrasing explanations, answering questions).**
>
> The LLM **NEVER** decides prerequisite ordering, never scores or ranks resources, and never decides skill sequencing. All sequencing, scoring, gap analysis, and state transitions are **100% deterministic Python** operating on a curated graph.

---

## 🚀 Key Features

1. **Natural-Language Goal Parsing & Hybrid Onboarding**:
   - Free-text goal input (e.g. Priya: *"I want to become a Machine Learning Engineer in six months. I know basic Python."*)
   - Interactive profile completion cards shown **only** for missing fields (weekly hours, learning format, interest domain).

2. **Discrete-State Confidence State Machine**:
   - State hierarchy: `UNKNOWN` → `FAMILIAR` → `DEVELOPING` → `PRACTICED` → `VERIFIED`
   - Hard failure override: Self-rating 1–2/5 or Quiz < 50% immediately force-sets confidence to `WEAK`.
   - `VERIFIED` skills are excluded from the roadmap; `FAMILIAR` skills trigger `REFRESHER` modules.

3. **Curated Skill DAG & Gap Analysis**:
   - 36-node NetworkX `DiGraph` validated for acyclicity at startup.
   - Deterministic topological ordering with phase prioritization.

4. **Two-Stage Personalized Recommender**:
   - **Stage A**: Hard filter (`target_skill_id in resource.skills_taught`).
   - **Stage B**: 5-factor weighted score:
     $$S(r) = 0.35 \times \text{DifficultyFit} + 0.25 \times \text{FormatFit} + 0.20 \times \text{TimeFit} + 0.10 \times \text{InterestAlignment} + 0.10 \times \text{QualityScore}$$
   - **TimeFit**: Evaluated against a 2-week milestone window capacity ($\text{weekly\_hours} \times 2$). A 10h resource for an 8h/week learner scores **1.0**.

5. **Roadmap Assembly & Multi-Skill Deduplication**:
   - Shared courses deduplicated across the roadmap to prevent timeline inflation.
   - Paced duration range output (e.g. *21–26 weeks at ~8 hrs/week*, totaling ~190h for Priya).

6. **Adaptive Manager (Three Triggers)**:
   - **Trigger A (CHECKPOINT_FAILED)**: Force-sets skill to `WEAK`, locks downstream modules, and inserts curated refresher.
   - **Trigger B (DIFFICULTY_FEEDBACK)**: Recalibrates resource levels and pacing for uncompleted modules.
   - **Trigger C (INTEREST_CHANGED)**: Swaps specialization branch (e.g. NLP ↔ Computer Vision) while preserving completed modules byte-for-byte.

7. **AI Assistant Drawer**:
   - Real-time conversational explanation of prerequisite reasons, reason codes, and adaptive events without modifying data structures.

---

## 📁 Project Structure

```
pathfinder/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── onboarding.py       # POST /api/onboard/parse
│   │   │   ├── roadmap.py          # POST /api/roadmap/generate, POST /api/roadmap/adapt, GET /api/quiz/{id}
│   │   │   └── assistant.py        # POST /api/assistant/explain
│   │   ├── core/
│   │   │   ├── dag_engine.py       # Graph load, acyclicity validation, gap traversal, topo sort
│   │   │   ├── confidence.py       # Discrete state machine
│   │   │   ├── recommender.py      # Hard filter + 5-factor scoring
│   │   │   ├── roadmap_builder.py  # Roadmap assembly, deduplication, duration range
│   │   │   ├── reasoning.py        # Templated reason codes -> natural language
│   │   │   ├── adaptation.py       # Three adaptive triggers (checkpoint fail, difficulty, interest)
│   │   │   └── state.py            # Cached singleton state provider
│   │   ├── data/
│   │   │   ├── skill_dag.json      # 36 curated skill nodes in node-link format
│   │   │   ├── catalog.json        # 42 curated learning resources with populated topics & metadata
│   │   │   └── quiz_bank.json      # 3 hand-authored MCQs for statistics_probability checkpoint
│   │   ├── schemas/                # Pydantic schemas (LearnerProfile, Resource, RoadmapItem, Events)
│   │   ├── services/
│   │   │   └── llm_service.py      # NLU Goal parser and NLG Assistant
│   │   └── main.py                 # FastAPI application with CORS & static frontend mount
│   ├── tests/                      # 24 comprehensive pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── DiscoveryView.tsx       # Screen 1 — Free text goal input & Priya demo button
│   │   │   ├── ProfileCardsView.tsx    # Screen 2 — Missing field completion chips
│   │   │   ├── GenerationView.tsx      # Screen 3 — Animated pipeline transition checklist
│   │   │   └── DashboardView.tsx       # Screen 4 — Persistent dashboard & adaptation controls
│   │   ├── components/
│   │   │   ├── NextBestAction.tsx      # Hero card with direct CTA
│   │   │   ├── RoadmapGraph.tsx        # Multi-phase visual flow chart
│   │   │   ├── QuizModal.tsx           # Interactive Statistics MCQ checkpoint modal
│   │   │   ├── ScoreBreakdownModal.tsx # 5-factor scoring inspector modal
│   │   │   └── AssistantDrawer.tsx     # Floating conversational explanation drawer
│   │   ├── services/
│   │   │   └── api.ts                  # API client
│   │   ├── styles/
│   │   │   └── index.css               # Modern dark theme & design system
│   │   └── types/
│   │       └── index.ts                # TypeScript interfaces matching backend schemas
│   ├── package.json
│   └── vite.config.ts
├── start.py                            # Unified local launcher for backend & frontend
└── BUILD_SPEC.md                       # Canonical build specification
```

---

## 🛠️ Quick Start

### 1. Requirements
- Python 3.10+
- Node.js v18+ & npm

### 2. Install Dependencies
```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd frontend && npm install && npm run build && cd ..
```

### 3. Run Backend & Frontend
You can launch both services with the unified startup script:
```bash
python start.py
```

Or run them individually:
```bash
# Terminal 1: FastAPI Backend
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Vite Frontend Dev Server
cd frontend
npm run dev
```

- **Web Application UI**: `http://localhost:5173/` (or `http://127.0.0.1:8000/`)
- **FastAPI Interactive Docs**: `http://127.0.0.1:8000/docs`

---

## 🧪 Running Automated Tests

Run the complete 24-test unit and API test suite:
```bash
pytest -v
```

Run Sprint 1 deterministic script verification:
```bash
python backend/verify_sprint1.py
```

---

## 🎯 The Canonical Priya Demo Flow

1. **Discovery Screen**: Click *"Priya (ML Career Switcher)"* to populate: *"I want to become a Machine Learning Engineer in six months. I know basic Python."* Click **Build My Path**.
2. **Profile Completion**: The parser extracts `target_role: Machine Learning Engineer`, `timeline_weeks: 24`, and `python_basics: FAMILIAR`. The missing fields appear as interactive cards. Select **8 hrs/week**, **Hands-on Projects**, and **NLP**. Click **Generate My Learning Path**.
3. **Transition**: Observe the animated 5-step deterministic synthesis checklist.
4. **Dashboard**:
   - Review the roadmap totaling **190 hours** (~21–26 weeks at 8h/week).
   - `python_basics` is in **REFRESHER** mode because it was self-reported (`FAMILIAR`).
   - Next Best Action points to **Python Quickstart & Syntax Refresher**.
5. **The Adaptive Moment (Checkpoint Failure)**:
   - Click **Take Checkpoint Quiz** (or click *"Simulate Stats Checkpoint Fail (33%)"*).
   - In the Quiz modal, answer 1/3 correctly (33%) and submit.
   - `statistics_probability` is force-set to **WEAK**, `ml_fundamentals` stays **LOCKED**, and the **Statistics Refresher** is inserted before it.
   - Next Best Action updates immediately to **Statistics & Probability Focused Refresher**.
6. **Track Specialization Switch**:
   - Click **Switch Track: Computer Vision**.
   - Completed modules remain untouched; Phase 5 specialization swaps to **Computer Vision Specialization**.
7. **Assistant Drawer**:
   - Click **Ask Pathfinder AI** and ask *"Why am I learning statistics right now?"* to view the prerequisite explanation.
