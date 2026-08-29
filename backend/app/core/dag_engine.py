import heapq
import json
from pathlib import Path
from typing import Dict, List, Optional
import networkx as nx
from ..schemas.learner import ConfidenceTier


def load_skill_dag(filepath: Optional[str] = None) -> nx.DiGraph:
    """Loads and validates the skill DAG from JSON. Fails loudly if not a DAG."""
    if filepath is None:
        filepath = str(Path(__file__).parent.parent / "data" / "skill_dag.json")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    graph = nx.DiGraph()

    # Load nodes
    for node in data.get("nodes", []):
        node_id = node["id"]
        graph.add_node(
            node_id,
            id=node_id,
            name=node.get("name", node_id),
            description=node.get("description", ""),
            domain=node.get("domain", "General"),
            phase_hint=node.get("phase_hint", 1),
        )

    # Load links/edges
    for link in data.get("links", []):
        source = link["source"]
        target = link["target"]
        graph.add_edge(source, target)

    # Validate acyclicity
    if not nx.is_directed_acyclic_graph(graph):
        raise RuntimeError("skill_dag.json is not a DAG — refusing to start")

    return graph


def get_required_skills(
    graph: nx.DiGraph,
    target_skill: str,
    skill_confidence: Dict[str, ConfidenceTier],
) -> List[str]:
    """
    Finds all ancestors of target_skill plus target_skill itself,
    filters out only VERIFIED skills, and returns a deterministically
    topologically sorted list prioritizing (phase_hint, node_id).
    """
    if target_skill not in graph:
        return []

    prereqs = set(nx.ancestors(graph, target_skill))
    prereqs.add(target_skill)

    # Only VERIFIED skills are excluded from the roadmap
    verified = {s for s, tier in skill_confidence.items() if tier == ConfidenceTier.VERIFIED}
    missing = prereqs - verified

    subgraph = graph.subgraph(missing)

    # Kahn's algorithm with min-heap on (phase_hint, node_id) for deterministic, phase-aligned topo sort
    in_degree = {node: subgraph.in_degree(node) for node in subgraph.nodes()}
    heap = []
    for node, deg in in_degree.items():
        if deg == 0:
            phase = subgraph.nodes[node].get("phase_hint", 1)
            heapq.heappush(heap, (phase, node))

    ordered_skills = []
    while heap:
        phase, u = heapq.heappop(heap)
        ordered_skills.append(u)
        for v in subgraph.successors(u):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                v_phase = subgraph.nodes[v].get("phase_hint", 1)
                heapq.heappush(heap, (v_phase, v))

    return ordered_skills


def get_dependents(graph: nx.DiGraph, skill_id: str) -> List[str]:
    """Returns all downstream descendant skill IDs for a given skill."""
    if skill_id not in graph:
        return []
    return list(nx.descendants(graph, skill_id))


def get_prerequisites(graph: nx.DiGraph, skill_id: str) -> List[str]:
    """Returns direct upstream prerequisite skill IDs for a given skill."""
    if skill_id not in graph:
        return []
    return list(graph.predecessors(skill_id))
