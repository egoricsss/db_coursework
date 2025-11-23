from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import time

from database.session import session_manager
from database.sharding import sharding_manager
from models.user import User
from schemas.user import UserCreate, UserResponse, UserUpdate, UserStats
from utils.monitoring import metrics_collector

router = APIRouter()

@router.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    start_time = time.time()
    
    try:
        # Получаем сессию для нужного шарда
        session = sharding_manager.get_shard_session(user.shard_key)
        
        # Проверяем существование пользователя
        existing_user = session.query(User).filter(
            (User.username == user.username) | (User.email == user.email)
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Создаем пользователя
        db_user = User(
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            shard_key=user.shard_key
        )
        
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        
        # Логируем операцию
        duration = time.time() - start_time
        shard_name = sharding_manager.get_shard_name(user.shard_key)
        metrics_collector.log_operation(
            operation="create_user",
            strategy=sharding_manager.current_strategy,
            duration=duration,
            shard=shard_name
        )
        
        return UserResponse(
            **db_user.__dict__,
            shard_name=shard_name
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Поиск пользователя по ID (проверяем все шарды)"""
    start_time = time.time()
    
    for shard_name in session_manager.sessions.keys():
        session = session_manager.get_session(shard_name)
        user = session.query(User).filter(User.id == user_id).first()
        
        if user:
            duration = time.time() - start_time
            metrics_collector.log_operation(
                operation="get_user_by_id",
                strategy=sharding_manager.current_strategy,
                duration=duration,
                shard=shard_name
            )
            
            return UserResponse(
                **user.__dict__,
                shard_name=shard_name
            )
    
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/users/by-key/{shard_key}", response_model=List[UserResponse])
async def get_users_by_shard_key(shard_key: str):
    """Получение пользователей по ключу шардирования"""
    start_time = time.time()
    
    session = sharding_manager.get_shard_session(shard_key)
    users = session.query(User).filter(User.shard_key == shard_key).all()
    
    duration = time.time() - start_time
    shard_name = sharding_manager.get_shard_name(shard_key)
    metrics_collector.log_operation(
        operation="get_users_by_shard_key",
        strategy=sharding_manager.current_strategy,
        duration=duration,
        shard=shard_name
    )
    
    return [
        UserResponse(**user.__dict__, shard_name=shard_name)
        for user in users
    ]

@router.put("/strategy/{strategy_name}")
async def set_sharding_strategy(strategy_name: str):
    """Изменение стратегии шардирования"""
    try:
        sharding_manager.set_strategy(strategy_name)
        return {
            "message": f"Strategy changed to {strategy_name}",
            "current_strategy": sharding_manager.current_strategy
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/strategy/current")
async def get_current_strategy():
    """Получение текущей стратегии шардирования"""
    return sharding_manager.get_all_shards_info()

@router.get("/stats/users", response_model=UserStats)
async def get_user_stats():
    """Статистика пользователей по шардам"""
    shard_stats = await metrics_collector.get_shard_stats()
    
    total_users = 0
    users_per_shard = {}
    
    for shard_name, stats in shard_stats.items():
        users_per_shard[shard_name] = stats['user_count']
        total_users += stats['user_count']
    
    return UserStats(
        total_users=total_users,
        users_per_shard=users_per_shard,
        strategy=sharding_manager.current_strategy
    )

@router.get("/monitoring/metrics")
async def get_performance_metrics():
    """Метрики производительности"""
    shard_stats = await metrics_collector.get_shard_stats()
    performance_metrics = metrics_collector.get_performance_metrics()
    
    return {
        "shard_statistics": shard_stats,
        "performance_metrics": performance_metrics,
        "current_strategy": sharding_manager.current_strategy
    }

@router.get("/shards/info")
async def get_shards_info():
    """Информация о всех шардах"""
    shard_stats = await metrics_collector.get_shard_stats()
    return {
        "shards": shard_stats,
        "total_shards": len(shard_stats),
        "current_strategy": sharding_manager.current_strategy
    }