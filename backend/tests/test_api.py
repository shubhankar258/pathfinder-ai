import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

@pytest.mark.anyio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

@pytest.mark.anyio
async def test_parse_goal_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/onboard/parse", json={"goal_raw": "I want to become a Machine Learning Engineer in six months. I know basic Python."})
    assert resp.status_code == 200
    data = resp.json()
    assert data["profile"]["target_role"] == "Machine Learning Engineer"
    assert data["profile"]["timeline_weeks"] == 24
    assert data["profile"]["skill_confidence"]["python_basics"] == "FAMILIAR"
    assert "weekly_hours" in data["missing_fields"]
    assert "learning_format" in data["missing_fields"]
    assert "interest_domain" in data["missing_fields"]

@pytest.mark.anyio
async def test_generate_and_adapt_api():
    demo_payload = {
        "profile": {
            "user_id": "demo_user",
            "goal_raw": "I want to become a Machine Learning Engineer in six months. I know basic Python.",
            "target_role": "Machine Learning Engineer",
            "target_skill": "ml_engineer_target",
            "timeline_weeks": 24,
            "weekly_hours": 8.0,
            "experience_level": "Basic Python",
            "learner_level": 1,
            "learning_format": "hands_on",
            "interest_domain": "NLP",
            "skill_confidence": {"python_basics": "FAMILIAR"},
        }
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        gen_resp = await ac.post("/api/roadmap/generate", json=demo_payload)
        assert gen_resp.status_code == 200
        gen_data = gen_resp.json()
        assert gen_data["estimated_total_hours"] == 190.0

        # Test Adaptation via API
        adapt_payload = {
            "event": {
                "event_type": "CHECKPOINT_FAILED",
                "skill_id": "statistics_probability",
                "score": 0.33,
            },
            "current_roadmap": gen_data["roadmap"],
            "profile": demo_payload["profile"],
        }
        adapt_resp = await ac.post("/api/roadmap/adapt", json=adapt_payload)
        assert adapt_resp.status_code == 200
        adapt_data = adapt_resp.json()
        assert adapt_data["adaptation"]["action"] == "REFRESHER_INSERTED"
        assert "Statistics" in adapt_data["next_best_action"]["skill_name"]

@pytest.mark.anyio
async def test_quiz_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/quiz/statistics_probability")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["questions"]) == 3

        # Test new network fundamentals checkpoint
        net_resp = await ac.get("/api/quiz/network_fundamentals")
        assert net_resp.status_code == 200
        net_data = net_resp.json()
        assert len(net_data["questions"]) == 3

@pytest.mark.anyio
async def test_cybersecurity_parse_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/onboard/parse", json={"goal_raw": "I want to learn cybersecurity in 12 months."})
    assert resp.status_code == 200
    data = resp.json()
    assert data["profile"]["target_role"] == "Cybersecurity Specialist"
    assert data["profile"]["target_skill"] == "cybersecurity_engineer_target"
    assert data["profile"]["timeline_weeks"] == 52
    assert "weekly_hours" in data["missing_fields"]
