from pathlib import Path
from typing import List, Tuple
import networkx as nx
from .dag_engine import load_skill_dag
from .recommender import load_catalog
from ..schemas.resource import Resource

_cached_graph: nx.DiGraph = None
_cached_catalog: List[Resource] = None


def get_graph_and_catalog() -> Tuple[nx.DiGraph, List[Resource]]:
    global _cached_graph, _cached_catalog
    if _cached_graph is None or _cached_catalog is None:
        data_dir = Path(__file__).parent.parent / "data"
        dag_path = str(data_dir / "skill_dag.json")
        catalog_path = str(data_dir / "catalog.json")
        _cached_graph = load_skill_dag(dag_path)
        _cached_catalog = load_catalog(catalog_path)
    return _cached_graph, _cached_catalog
