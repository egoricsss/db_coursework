from typing import Dict, Any
from database.session import session_manager
from database.config import db_config
from utils.sharding_strategies import (
    HashShardingStrategy,
    RangeShardingStrategy,
    ListShardingStrategy,
)


class ShardingManager:
    def __init__(self):
        self.strategies = {
            "hash": HashShardingStrategy(),
            "range": RangeShardingStrategy(),
            "list": ListShardingStrategy(),
        }
        self.current_strategy = "hash"

    def set_strategy(self, strategy_name: str):
        if strategy_name not in self.strategies:
            raise ValueError(f"Unknown strategy: {strategy_name}")
        self.current_strategy = strategy_name

    def get_shard_name(self, shard_key: Any) -> str:
        strategy = self.strategies[self.current_strategy]
        return strategy.get_shard(shard_key, db_config.TOTAL_SHARDS)

    def get_shard_session(self, shard_key: Any):
        shard_name = self.get_shard_name(shard_key)
        return session_manager.get_session(shard_name)

    def get_all_shards_info(self) -> Dict[str, Any]:
        return {
            "current_strategy": self.current_strategy,
            "available_strategies": list(self.strategies.keys()),
            "total_shards": db_config.TOTAL_SHARDS,
            "shard_names": db_config.SHARD_NAMES,
        }


# Глобальный менеджер шардирования
sharding_manager = ShardingManager()
