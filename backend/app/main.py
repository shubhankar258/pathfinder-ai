from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api import onboarding, roadmap, assistant
from .core.dag_engine import load_skill_dag
from .core.recommender import load_catalog


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup validation
    data_dir = Path(__file__).parent / "data"
    dag_path = str(data_dir / "skill_dag.json")
    catalog_path = str(data_dir / "catalog.json")

    # Load and validate DAG — fails loudly if invalid
    app.state.graph = load_skill_dag(dag_path)
    app.state.catalog = load_catalog(catalog_path)
    print(f"[PATHFINDER] Skill DAG verified with {app.state.graph.number_of_nodes()} nodes.")
    print(f"[PATHFINDER] Resource catalog loaded with {len(app.state.catalog)} resources.")

    yield


app = FastAPI(
    title="Pathfinder Adaptive AI Learning Path Engine",
    description="Adaptive AI learning engine that generates explainable, prerequisite-aware roadmaps.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes with /api prefix AND without /api prefix
app.include_router(onboarding.router, prefix="/api")
app.include_router(onboarding.router)
app.include_router(roadmap.router, prefix="/api")
app.include_router(roadmap.router)
app.include_router(assistant.router, prefix="/api")
app.include_router(assistant.router)


@app.get("/api/health")
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Pathfinder Adaptive Learning Path Engine",
        "version": "1.0.0",
    }

