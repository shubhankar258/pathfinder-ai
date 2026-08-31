import os
from pathlib import Path
from typing import List, Tuple
import networkx as nx
from .dag_engine import load_skill_dag
from .recommender import load_catalog
from ..schemas.resource import Resource

_cached_graph: nx.DiGraph = None
_cached_catalog: List[Resource] = None
_last_dag_mtime: float = 0
_last_catalog_mtime: float = 0


def get_graph_and_catalog(force_reload: bool = False) -> Tuple[nx.DiGraph, List[Resource]]:
    global _cached_graph, _cached_catalog, _last_dag_mtime, _last_catalog_mtime
    data_dir = Path(__file__).parent.parent / "data"
    dag_path = str(data_dir / "skill_dag.json")
    catalog_path = str(data_dir / "catalog.json")

    dag_mtime = os.path.getmtime(dag_path) if os.path.exists(dag_path) else 0
    catalog_mtime = os.path.getmtime(catalog_path) if os.path.exists(catalog_path) else 0

    if (
        force_reload
        or _cached_graph is None
        or _cached_catalog is None
        or dag_mtime != _last_dag_mtime
        or catalog_mtime != _last_catalog_mtime
    ):
        _cached_graph = load_skill_dag(dag_path)
        _cached_catalog = load_catalog(catalog_path)
        _last_dag_mtime = dag_mtime
        _last_catalog_mtime = catalog_mtime

    return _cached_graph, _cached_catalog

