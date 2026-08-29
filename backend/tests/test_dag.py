import pytest
import networkx as nx
from pathlib import Path
from app.core.dag_engine import load_skill_dag, get_required_skills, get_dependents, get_prerequisites
from app.schemas.learner import ConfidenceTier

@pytest.fixture
def dag():
    data_dir = Path(__file__).parent.parent / "app" / "data"
    return load_skill_dag(str(data_dir / "skill_dag.json"))

def test_dag_acyclicity(dag):
    assert nx.is_directed_acyclic_graph(dag)
    assert dag.number_of_nodes() >= 30

def test_unknown_target_skill(dag):
    skills = get_required_skills(dag, "non_existent_skill", {})
    assert skills == []

def test_ancestor_traversal_verified_exclusion(dag):
    confidence = {
        "python_basics": ConfidenceTier.VERIFIED,
        "python_oop": ConfidenceTier.FAMILIAR,
    }
    skills = get_required_skills(dag, "ml_engineer_target", confidence)
    assert "python_basics" not in skills  # VERIFIED must be excluded
    assert "python_oop" in skills         # FAMILIAR must stay in the path
    assert "ml_fundamentals" in skills

def test_topological_sort_deterministic(dag):
    confidence = {}
    skills_run1 = get_required_skills(dag, "ml_engineer_target", confidence)
    skills_run2 = get_required_skills(dag, "ml_engineer_target", confidence)
    assert skills_run1 == skills_run2

def test_dependents_and_prerequisites(dag):
    deps = get_dependents(dag, "statistics_probability")
    assert "ml_fundamentals" in deps
    prereqs = get_prerequisites(dag, "statistics_probability")
    assert "numpy_pandas" in prereqs
