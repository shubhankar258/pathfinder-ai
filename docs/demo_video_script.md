# Pathfinder — Demo Video Script & Walkthrough

## 3–5 Minute Demo Video Guide

**Total Duration Target: 4 minutes**

---

## Pre-Recording Setup

1. Open two browser tabs:
   - **Tab 1**: `http://localhost:5173` (Pathfinder Frontend)
   - **Tab 2**: `http://127.0.0.1:8000/docs` (FastAPI Swagger — optional, for API demo)
2. Make sure both backend and frontend servers are running (`python start.py`)
3. Use a screen recorder (OBS Studio, Loom, or Windows Game Bar `Win + G`)
4. Set browser zoom to **100%** for clean visuals
5. Close unnecessary tabs and notifications

---

## SCENE 1: Introduction (0:00 – 0:30)

### What to Say:
> "Hi, this is Pathfinder — an AI-Powered Personalized Learning Path Recommender. The core problem we're solving is that learners struggle to find the right sequence of courses to achieve a career goal. Existing platforms recommend individual courses, but they don't build prerequisite-aware, personalized roadmaps.
>
> Pathfinder solves this by combining a curated Directed Acyclic Graph of 61 skill nodes with a 5-factor personalized scoring engine — all running as deterministic Python. No hallucinated course sequences. Let me show you how it works."

### What to Show:
- The Pathfinder landing page / Discovery View with the hero section and goal input field
- Briefly hover over the three demo preset buttons (ML Engineer, Cybersecurity, Full-Stack)

---

## SCENE 2: Goal Input & Onboarding (0:30 – 1:15)

### What to Say:
> "A learner enters their career goal in natural language. Let me try: 'I want to learn cybersecurity in 12 months.'
>
> The NLU layer parses this into structured data — extracting the target domain, timeline, and skill level. Now I set my preferences: I'm a beginner, I prefer hands-on learning, I have about 10 hours a week, and I'm interested in penetration testing."

### What to Do:
1. Click the **"Demo: Cybersecurity (12 Mo)"** preset button (or type the goal manually)
2. Click **"Build My Path"**
3. On the **Profile Cards View**:
   - Select experience level: **Beginner**
   - Select learning format: **Hands-on**
   - Set weekly hours: **10**
   - Set interest domain: **Penetration Testing** (or leave default)
4. Click **"Generate My Learning Path"**

### What to Show:
- The animated Generation View / synthesis HUD showing the engine processing

---

## SCENE 3: The Personalized Roadmap (1:15 – 2:15)

### What to Say:
> "Here's my personalized learning roadmap. The engine used Kahn's topological sort on the skill DAG to sequence 20 cybersecurity modules across 6 phases — from networking fundamentals all the way to incident response and compliance.
>
> Each module shows the best-matched course. Look — it's recommending Wireshark's official documentation for Network Analysis and PortSwigger's Web Security Academy for web application security. These are real, verified links.
>
> Let me inspect the scoring. I'll click 'Fit' on this module... You can see the five-factor breakdown: Difficulty Fit at 35%, Format Fit at 25%, Time Fit at 20%, Interest Alignment at 10%, and Quality at 10%. This exact formula determines why this specific course was chosen over alternatives.
>
> I can also click 'Open Course' to go directly to the actual learning resource in a new tab."

### What to Do:
1. Scroll through the **Dashboard View** showing the bento-grid layout
2. Point out the **Next Best Action** card at the top
3. Click **"Open Course / Resource ↗"** to show a real external link opening
4. Scroll down to the **Roadmap Graph** showing phases
5. Click **"Fit"** on any module to open the **Score Breakdown Modal**
6. Click **"Open ↗"** chip on a roadmap node to demonstrate direct resource access

---

## SCENE 4: Adaptive Learning — Checkpoint Failure (2:15 – 3:15)

### What to Say:
> "Now let's see the adaptive engine in action. Suppose I take a quiz checkpoint and score poorly — below 50%.
>
> Watch what happens... The confidence state machine immediately overrides this skill to WEAK status. The engine injects a targeted refresher module with easier, focused material. And critically — all downstream skills that depend on this concept are now LOCKED until I complete the refresher.
>
> This is the key insight: completed progress is always preserved. Only the unfinished tail of the roadmap is modified. The learner never loses work they've already done."

### What to Do:
1. Click **"Simulate Checkpoint Failure (33%)"** button on the Dashboard
2. Watch the roadmap update in real-time:
   - The failed skill turns **red/WEAK** with "(Refresher)" appended
   - Downstream skills show **LOCKED** state
   - The Next Best Action card updates to the refresher module
3. Point out the adaptation explanation message

**Alternative — Interactive Quiz:**
1. Click the **quiz icon** on any skill to open the **Quiz Modal**
2. Answer questions incorrectly to trigger a real checkpoint failure
3. Show the same WEAK → Refresher → Locked cascade

---

## SCENE 5: Adaptive Learning — Track Switching (3:15 – 3:45)

### What to Say:
> "The engine also handles interest changes. Say I started on the NLP track but now I want to switch to Computer Vision.
>
> When I click 'Switch Track,' the engine preserves all my completed foundational skills — Python, statistics, ML fundamentals — and regenerates only the specialization branch. My progress is never thrown away."

### What to Do:
1. (If on ML path) Click **"Switch Track (Computer Vision)"** button
2. Show how completed items remain intact while the specialization modules change
3. Point out the adaptation message: "Completed foundations were preserved"

---

## SCENE 6: AI Assistant & Explainability (3:45 – 4:15)

### What to Say:
> "Finally, there's an AI Prerequisite Assistant. Learners can ask questions like 'Why am I learning statistics right now?' and get grounded, explainable answers based on the actual DAG structure — not generic LLM responses.
>
> To summarize: Pathfinder combines a curated prerequisite DAG, a 5-factor personalized recommender, a discrete confidence state machine, and three adaptive triggers — all running as deterministic, testable Python with 32 automated tests at 100% pass rate. The result is an AI learning companion that's explainable, reproducible, and genuinely personalized."

### What to Do:
1. Click **"Ask Pathfinder AI"** button in the bottom-right corner
2. Type: **"Why am I learning statistics right now?"**
3. Show the grounded response explaining the prerequisite chain
4. Close the drawer

---

## SCENE 7: Closing (4:15 – 4:30)

### What to Say:
> "Thank you for watching! The full source code, documentation, and test suite are available on GitHub. Pathfinder — your AI-powered learning companion."

### What to Show:
- Quick flash of the full roadmap view
- Project logo / title

---

## Recording Tips

1. **Speak clearly and at a moderate pace** — don't rush through the demo
2. **Use mouse movements deliberately** — hover over elements before clicking so viewers can follow
3. **Pause briefly after each adaptation** to let the visual changes register
4. **Keep the browser window maximized** and free of bookmarks bar clutter
5. **Test the full flow once** before recording to ensure servers are responsive
6. **Aim for 4 minutes** — slightly under 5 is better than going over

## Recommended Recording Tools

| Tool | Platform | Notes |
|------|----------|-------|
| **Loom** | Web / Desktop | Easiest, includes webcam overlay |
| **OBS Studio** | Windows / Mac / Linux | Free, professional quality |
| **Windows Game Bar** | Windows | Built-in, press `Win + G` |
| **QuickTime Player** | Mac | Built-in screen recording |

---

*Pathfinder — Adaptive AI Learning Path Engine v1.0*
