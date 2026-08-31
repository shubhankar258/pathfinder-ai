import os
import re
from typing import Any, Dict, List, Optional
from ..schemas.learner import ConfidenceTier, LearningFormat


def normalize_experience_to_level(experience_text: Optional[str]) -> int:
    """Normalizes free-text experience to 1, 2, or 3 (Section 4 & 13)."""
    if not experience_text:
        return 1
    text = experience_text.lower()
    if any(w in text for w in ["advanced", "senior", "expert", "5+ years", "production"]):
        return 3
    if any(w in text for w in ["intermediate", "some experience", "proficient", "1-2 years"]):
        return 2
    return 1  # beginner default


def normalize_learning_format(format_text: Optional[str]) -> Optional[LearningFormat]:
    """Normalizes learning format string to enum."""
    if not format_text:
        return None
    text = format_text.lower()
    if "hand" in text or "project" in text or "practical" in text:
        return LearningFormat.HANDS_ON
    if "interact" in text or "quiz" in text:
        return LearningFormat.INTERACTIVE
    if "video" in text or "watch" in text or "lecture" in text:
        return LearningFormat.VIDEO
    if "read" in text or "book" in text or "article" in text:
        return LearningFormat.READING
    return None


def parse_goal_nlp(goal_raw: str) -> Dict[str, Any]:
    """
    Structured NLU goal parser (Section 11).
    Extracts structured fields and identifies missing fields for profile cards.
    Supports Machine Learning, Cybersecurity, Full-Stack Development, Cloud & DevOps, and Data Science.
    """
    text = goal_raw.strip()
    text_lower = text.lower()

    # 1. Target Role & Target Skill Resolution
    target_role = None
    target_skill = "ml_engineer_target"

    if any(k in text_lower for k in ["cybersecurity", "security", "ethical hack", "penetration test", "infosec", "soc analyst", "cyber defense"]):
        target_role = "Cybersecurity Specialist"
        target_skill = "cybersecurity_engineer_target"
    elif any(k in text_lower for k in ["full stack", "fullstack", "web dev", "web develop", "frontend", "backend", "software engineer", "react"]):
        target_role = "Full-Stack Developer"
        target_skill = "fullstack_engineer_target"
    elif any(k in text_lower for k in ["devops", "cloud engineer", "cloud computing", "kubernetes", "docker", "sre", "platform engineer"]):
        target_role = "Cloud & DevOps Engineer"
        target_skill = "devops_engineer_target"
    elif "data scientist" in text_lower or "data science" in text_lower:
        target_role = "Data Scientist"
        target_skill = "data_scientist_target"
    elif "nlp engineer" in text_lower:
        target_role = "NLP Engineer"
        target_skill = "nlp_engineer_target"
    elif "computer vision engineer" in text_lower or "cv engineer" in text_lower:
        target_role = "Computer Vision Engineer"
        target_skill = "cv_engineer_target"
    elif "machine learning" in text_lower or "ml engineer" in text_lower or "ai engineer" in text_lower:
        target_role = "Machine Learning Engineer"
        target_skill = "ml_engineer_target"
    else:
        target_role = "Machine Learning Engineer"
        target_skill = "ml_engineer_target"

    # 2. Timeline weeks
    timeline_weeks = 24  # default 6 months
    if "six months" in text_lower or "6 months" in text_lower or "half year" in text_lower:
        timeline_weeks = 24
    elif "3 months" in text_lower or "three months" in text_lower:
        timeline_weeks = 12
    elif "1 year" in text_lower or "one year" in text_lower or "12 months" in text_lower or "twelve months" in text_lower:
        timeline_weeks = 52
    elif "9 months" in text_lower or "nine months" in text_lower:
        timeline_weeks = 36
    else:
        match = re.search(r"(\d+)\s*(month|week|year)", text_lower)
        if match:
            num = int(match.group(1))
            unit = match.group(2)
            if "year" in unit:
                timeline_weeks = num * 52
            elif "month" in unit:
                timeline_weeks = num * 4
            else:
                timeline_weeks = num

    # 3. Known skills and confidence
    skill_confidence: Dict[str, ConfidenceTier] = {}
    experience_level = None

    if "basic python" in text_lower or "know python" in text_lower or "python basics" in text_lower:
        skill_confidence["python_basics"] = ConfidenceTier.FAMILIAR
        experience_level = "Basic Python"
    elif "intermediate python" in text_lower or "good python" in text_lower:
        skill_confidence["python_basics"] = ConfidenceTier.DEVELOPING
        experience_level = "Intermediate Python"
    elif "know networking" in text_lower or "basic networking" in text_lower:
        skill_confidence["network_fundamentals"] = ConfidenceTier.FAMILIAR
        experience_level = "Basic Networking"
    elif "know linux" in text_lower or "basic linux" in text_lower:
        skill_confidence["linux_administration"] = ConfidenceTier.FAMILIAR
        experience_level = "Basic Linux"
    elif "know javascript" in text_lower or "basic javascript" in text_lower or "know js" in text_lower:
        skill_confidence["javascript_typescript"] = ConfidenceTier.FAMILIAR
        experience_level = "Basic JavaScript"
    elif "no python" in text_lower or "never coded" in text_lower or "beginner" in text_lower:
        experience_level = "Beginner"

    learner_level = normalize_experience_to_level(experience_level)

    # 4. Weekly hours (extract if mentioned, otherwise None)
    weekly_hours = None
    hours_match = re.search(r"(\d+)\s*(hrs|hours)\s*(per|\/|a)?\s*week", text_lower)
    if hours_match:
        weekly_hours = float(hours_match.group(1))

    # 5. Learning format
    learning_format = None
    for fmt_candidate in ["hands-on", "hands on", "interactive", "video", "reading"]:
        if fmt_candidate in text_lower:
            learning_format = normalize_learning_format(fmt_candidate)
            break

    # 6. Interest domain
    interest_domain = None
    if "nlp" in text_lower or "natural language" in text_lower or "llm" in text_lower:
        interest_domain = "NLP"
    elif "computer vision" in text_lower or "vision" in text_lower or "cv" in text_lower:
        interest_domain = "Computer Vision"
    elif "ethical hack" in text_lower or "penetration test" in text_lower or "red team" in text_lower:
        interest_domain = "Ethical Hacking & Pen Testing"
    elif "soc" in text_lower or "siem" in text_lower or "blue team" in text_lower:
        interest_domain = "SOC & Threat Analysis"
    elif "frontend" in text_lower or "ui" in text_lower:
        interest_domain = "Frontend & UI/UX"
    elif "backend" in text_lower or "api" in text_lower:
        interest_domain = "Backend & Microservices"
    elif "kubernetes" in text_lower or "k8s" in text_lower:
        interest_domain = "Kubernetes & Platform Eng"

    # Identify missing fields that must be presented as cards
    missing_fields = []
    if weekly_hours is None:
        missing_fields.append("weekly_hours")
    if learning_format is None:
        missing_fields.append("learning_format")
    if interest_domain is None:
        missing_fields.append("interest_domain")

    return {
        "profile": {
            "target_role": target_role,
            "target_skill": target_skill,
            "timeline_weeks": timeline_weeks,
            "experience_level": experience_level,
            "learner_level": learner_level,
            "skill_confidence": skill_confidence,
            "weekly_hours": weekly_hours,
            "learning_format": learning_format.value if learning_format else None,
            "interest_domain": interest_domain,
        },
        "missing_fields": missing_fields,
    }


def generate_assistant_explanation(
    question: str,
    roadmap_context: List[Dict[str, Any]],
    profile: Dict[str, Any],
) -> str:
    """
    Natural-language assistant explanation generation (Section 10 & 11).
    Phrases deterministic DAG prerequisites, reason codes, and confidence states.
    Never invents ordering or mutates data.
    """
    q = question.lower()
    target_role = profile.get("target_role", "Machine Learning Engineer")
    interest = profile.get("interest_domain", "NLP")

    # Cybersecurity Grounded Reasoning
    if ("network" in q or "networking" in q) and ("why" in q or "before" in q):
        return (
            f"Computer Networking & Protocols is positioned before Penetration Testing and Web Security "
            f"because security practitioners must understand the TCP/IP stack, packet headers, routing, and DNS "
            f"to accurately diagnose vulnerabilities, analyze Wireshark captures, and craft defensive firewall rules."
        )

    if ("linux" in q) and ("why" in q or "before" in q):
        return (
            f"Linux System Administration is foundational for both Cybersecurity and Cloud/DevOps because "
            f"enterprise production servers, SIEM collectors, Docker daemons, and security appliances run on Linux. "
            f"Mastering CLI permissions and bash scripting is essential for incident response and container orchestration."
        )

    # Machine Learning Grounded Reasoning
    if "why" in q and ("statistics" in q or "prob" in q):
        return (
            f"Statistics & Probability is positioned before Machine Learning Fundamentals "
            f"because our curated prerequisite graph requires foundational knowledge of probability distributions, "
            f"Bayes' theorem, and statistical inference to understand loss optimization and model evaluation."
        )

    if "skip" in q and ("python oop" in q or "oop" in q):
        return (
            f"Python OOP is an essential architectural building block for creating modular machine learning pipelines "
            f"and production-grade capstone services for a {target_role}. If you already have strong OOP experience, "
            f"you can take a quick skill checkpoint to verify your proficiency."
        )

    if "time" in q or "less time" in q or "schedule" in q or "busy" in q:
        weekly = profile.get("weekly_hours", 8.0)
        return (
            f"Pathfinder automatically recalculates your timeline range whenever you change your weekly commitment. "
            f"At your current {weekly} hrs/week pace, each module is tailored to fit 2-week milestone windows without compromising core prerequisites."
        )

    if "refresher" in q or "weak" in q:
        return (
            f"When a checkpoint score falls below 50% or self-rating is low, Pathfinder switches that skill's mode to REFRESHER "
            f"and temporarily locks downstream modules until foundational gaps are reinforced."
        )

    if "nlp" in q or "computer vision" in q or "specialization" in q:
        return (
            f"Your roadmap includes a dedicated specialization phase for {interest}, "
            f"which builds directly upon your completed fundamentals and applied portfolio project."
        )

    # General contextual response
    return (
        f"In your learning path toward {target_role}, each skill is sequenced deterministically by prerequisite dependencies in our graph. "
        f"You can view the exact reasoning, estimated hours, and curated resources on any roadmap node."
    )
