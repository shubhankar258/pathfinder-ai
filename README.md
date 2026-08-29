<div align="center">
  
# Pathfinder — Adaptive AI Learning Path Engine (v1.0)

*An explainable, prerequisite-aware learning curriculum engine that converts natural-language career goals into deterministic roadmaps and dynamically adapts to learner performance, confidence, and changing interests.*

[![Version](https://img.shields.io/badge/Version-1.0.0-f97316?style=for-the-badge)](https://github.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NetworkX](https://img.shields.io/badge/NetworkX-000000?style=for-the-badge&logo=python&logoColor=white)](https://networkx.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![WebGL](https://img.shields.io/badge/WebGL_OGL-990000?style=for-the-badge&logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)

</div>

---

## Introduction

This repository contains the **Version 1.0 (v1.0.0)** production-grade prototype of **Pathfinder**, an adaptive AI learning companion designed to eliminate arbitrary curriculum generation and hallucinated prerequisite sequencing.

### The Governing Architectural Principle

> **The LLM is strictly confined to Natural Language Understanding (extracting structured intent from goals) and Natural Language Generation (explaining prerequisite decisions to the learner).**
> 
> All skill sequencing, prerequisite gap analysis, resource scoring, milestone capacity estimation, and confidence transitions are **100% deterministic Python** running against a curated Directed Acyclic Graph (DAG).

---

## Technical Highlights

1. **Deterministic Skill DAG & Gap Analysis:** Built on a 36-node, 37-edge NetworkX `DiGraph` validated for acyclicity at startup. Uses Kahn's topological sort with phase prioritization ($1 \rightarrow 6$) and prerequisite ancestor traversal that excludes **only** `VERIFIED` skills, keeping self-reported knowledge for targeted refresher modules.
2. **Discrete Confidence State Machine:** Enforces non-additive confidence transitions (`UNKNOWN` $\rightarrow$ `FAMILIAR` $\rightarrow$ `DEVELOPING` $\rightarrow$ `PRACTICED` $\rightarrow$ `VERIFIED`). Any checkpoint score $< 50\%$ or self-rating of $1\text{--}2/5$ immediately triggers a **hard override to `WEAK`**, locking downstream dependent modules and inserting a focused refresher.
3. **Two-Stage Personalized 5-Factor Recommender:**
   * **Stage A (Hard Filter):** Strictly requires `target_skill_id in resource.skills_taught`.
   * **Stage B (Scoring Formula):**
     $$S(r) = 0.35 \times \text{DifficultyFit} + 0.25 \times \text{FormatFit} + 0.20 \times \text{TimeFit} + 0.10 \times \text{InterestAlignment} + 0.10 \times \text{QualityScore}$$
   * **Milestone TimeFit:** Evaluates resource duration against a 2-week milestone capacity window ($\text{weekly\_hours} \times 2$). A 10h module for an 8h/week learner scores a perfect **1.0**.
4. **Multi-Skill Resource Deduplication:** Shared multi-skill courses (e.g., comprehensive data manipulation bundles) are deduplicated across the entire roadmap. Earlier skills retain the resource duration, while later skills carry `covered_by_resource_id` with 0.0h, ensuring accurate timeline pacing (Priya's canonical path lands on **exactly 190.0 hours**).
5. **Three Dynamic Adaptive Triggers:**
   * `CHECKPOINT_FAILED`: Sets skill status to `WEAK`, locks downstream modules, and inserts a curated refresher before the blocked concept.
   * `DIFFICULTY_FEEDBACK`: Recalibrates resource difficulty and pace for uncompleted modules based on learner feedback.
   * `INTEREST_CHANGED`: Dynamically swaps the specialization track (e.g., NLP $\leftrightarrow$ Computer Vision) while keeping completed foundational progress immutable.
6. **Ultra-Modern Frosted Glassmorphism UI:** Built with React, TypeScript, GSAP-powered `<CardNav />`, interactive WebGL `<Threads />` particle wave shader, and an Electric Orange Obsidian design system.

---

## System Architecture

The application is decoupled into an independent, high-performance Backend and a responsive, interactive Frontend.

```
pathfinder/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI Endpoints: /api/onboard/parse, /api/roadmap/generate, /api/roadmap/adapt, /api/quiz/{id}
│   │   ├── core/            # Deterministic Python: dag_engine, confidence, recommender, roadmap_builder, adaptation
│   │   ├── data/            # Curated JSON datasets: skill_dag.json (36 nodes), catalog.json (42 resources), quiz_bank.json
│   │   ├── schemas/         # Strict Pydantic models for profiles, resources, roadmaps, and events
│   │   └── services/        # Structured NLU Goal Parser & Grounded Assistant Generator
│   └── tests/               # 24 automated unit and integration tests (100% pass rate)
├── frontend/
│   ├── src/
│   │   ├── components/      # CardNav (GSAP), Threads (WebGL), NextBestAction, RoadmapGraph, QuizModal, ScoreModal
│   │   ├── views/           # DiscoveryView, ProfileCardsView, GenerationView, DashboardView
│   │   └── styles/          # Deep Frosted Glassmorphism Design System in Electric Orange & Obsidian
│   └── vite.config.ts       # Proxy configuration to backend APIs
└── start.py                 # Unified launcher for simultaneous local execution
```

### The Backend (Python / FastAPI)
* **Framework:** FastAPI with asynchronous ASGI execution and CORS middleware.
* **Graph Engine:** NetworkX `DiGraph` loading curated skill relationships, computing ancestor closures, and validating acyclicity at startup.
* **Testing:** Comprehensive test suite covering graph traversal, confidence transitions, recommendation weights, deduplication, and adaptation events.

### The Frontend (React / Vite / TypeScript)
* **Framework:** Vite + React 18 + TypeScript with strict type checking.
* **Animations & Visuals:** GSAP timelines for `<CardNav />`, WebGL shader via `ogl` for ambient `<Threads />` waves, and custom CSS glassmorphism with specular reflections.
* **Interactive Modals:** Real-time 5-Factor Scoring Inspector, Hand-Authored MCQ Quiz Checkpoints, and an AI Prerequisite Assistant Drawer.

---

## Getting Started Locally

Follow the instructions below to run the complete Pathfinder v1.0 stack locally.

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Unified Startup (Recommended)
You can start both the FastAPI backend (port 8000) and the Vite frontend (port 5173) with a single command:

```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..

# Launch both servers simultaneously
python start.py
```

### 2. Manual Startup

#### Terminal 1: Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

* **Web Application UI:** `http://localhost:5173/` (or `http://127.0.0.1:8000/`)
* **FastAPI Interactive API Docs:** `http://127.0.0.1:8000/docs`
* **Health Check Endpoint:** `http://127.0.0.1:8000/api/health`

---

## Running Automated Tests

Run the complete 24-test pytest suite:
```bash
pytest -v
```

Run the Sprint 1 deterministic validation script:
```bash
python backend/verify_sprint1.py
```

---

## Evaluation Scenarios

To effectively evaluate the system, follow the canonical test scenarios:

1. **The Priya Persona Flow (Baseline Validation):**
   * On the Discovery screen, click **"Priya (ML Engineer in 6 Mo)"** to populate: *"I want to become a Machine Learning Engineer in six months. I know basic Python."*
   * Observe the structured NLU extraction. Select **8 hrs/week**, **Hands-on Projects**, and **NLP & LLMs** on the profile completion cards.
   * **Verification:** The synthesized roadmap totals **exactly 190.0 hours** (21–26 weeks pace at 8h/week), `python_basics` is placed in `REFRESHER` mode (5h), and the Next Best Action recommends **Python Quickstart & Syntax Refresher**.

2. **The Adaptive Moment (Checkpoint Failure):**
   * Click **"Take Checkpoint Quiz"** (or click *"Simulate Stats Checkpoint Fail (33%)"*).
   * Submit an assessment score $< 50\%$ (1/3 correct).
   * **Verification:** An alert banner declares `REFRESHER_INSERTED`. `statistics_probability` is force-set to `WEAK`, downstream `ml_fundamentals` stays `LOCKED`, and the Next Best Action immediately points to the newly inserted **Statistics & Probability Focused Refresher** (4h).

3. **The Specialization Track Switch:**
   * On the Dashboard, click **"Switch Track: Computer Vision"**.
   * **Verification:** Phase 5 immediately swaps the NLP specialization to **Computer Vision Specialization** (35h) while keeping all completed and in-progress foundational modules byte-for-byte intact.

4. **The Prerequisite Assistant Explanation:**
   * Click **"Ask Pathfinder AI"** in the bottom-right corner.
   * Ask *"Why am I learning statistics right now?"*
   * **Verification:** The assistant returns a grounded explanation detailing that Statistics is an essential prerequisite for Machine Learning Fundamentals, citing the exact reason codes without hallucinations.

---

<div align="center">
  <i>Pathfinder v1.0 — Adaptive AI Learning Path Engine. Built with deterministic graph rigor and modern glassmorphism aesthetics.</i>
</div>
