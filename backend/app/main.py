from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.session import init_db
from api.endpoints import router as api_router


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
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=[""],
    allow_headers=[""],
)

app.include_router(api_router, prefix="/api/v1")
