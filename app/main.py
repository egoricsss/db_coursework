from fastapi import FastAPI
from contextlib import asynccontextmanager
from database.session import init_db
from api.endpoints import router as api_router
from utils.monitoring import MetricsCollector


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Инициализация при запуске
    await init_db()
    yield
    # Очистка при завершении
    pass

app = FastAPI(
    title="Sharding Service",
    description="Сервис для тестирования методов шардирования PostgreSQL",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Sharding Service API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}