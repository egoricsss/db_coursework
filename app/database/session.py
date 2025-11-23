from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from database.config import db_config
from models.user import Base
import asyncio

class ShardSessionManager:
    def __init__(self):
        self.engines = {}
        self.sessions = {}
        self._init_engines()
    
    def _init_engines(self):
        for shard_name, db_url in db_config.SHARD_CONFIGS.items():
            engine = create_engine(db_url, pool_pre_ping=True)
            self.engines[shard_name] = engine
            self.sessions[shard_name] = sessionmaker(
                bind=engine, 
                autocommit=False, 
                autoflush=False
            )
    
    def get_session(self, shard_name: str) -> Session:
        if shard_name not in self.sessions:
            raise ValueError(f"Unknown shard: {shard_name}")
        return self.sessions[shard_name]()
    
    def get_all_sessions(self):
        return {name: session() for name, session in self.sessions.items()}
    
    def close_sessions(self):
        for session in self.sessions.values():
            session.close_all()

# Глобальный менеджер сессий
session_manager = ShardSessionManager()

async def init_db():
    """Инициализация таблиц во всех шардах"""
    for shard_name, engine in session_manager.engines.items():
        Base.metadata.create_all(bind=engine)
        print(f"Database initialized for {shard_name}")