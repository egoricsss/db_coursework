from abc import ABC, abstractmethod
from typing import Any

class BaseShardingStrategy(ABC):
    @abstractmethod
    def get_shard(self, shard_key: Any, total_shards: int) -> str:
        pass

class HashShardingStrategy(BaseShardingStrategy):
    """Шардирование на основе хеша ключа"""
    
    def get_shard(self, shard_key: Any, total_shards: int) -> str:
        hash_value = hash(str(shard_key))
        shard_index = abs(hash_value) % total_shards
        return f'shard{shard_index + 1}'

class RangeShardingStrategy(BaseShardingStrategy):
    """Шардирование по диапазонам (для числовых ключей)"""
    
    def get_shard(self, shard_key: Any, total_shards: int) -> str:
        if not isinstance(shard_key, (int, float)):
            raise ValueError("Range sharding requires numeric keys")
        
        # Предполагаем, что ключи распределены в диапазоне 0-1000
        range_size = 1000 / total_shards
        shard_index = int(shard_key / range_size)
        shard_index = min(shard_index, total_shards - 1)
        return f'shard{shard_index + 1}'

class ListShardingStrategy(BaseShardingStrategy):
    """Шардирование по списку значений"""
    
    def get_shard(self, shard_key: Any, total_shards: int) -> str:
        # Простая стратегия на основе первой буквы строкового ключа
        if isinstance(shard_key, str):
            first_char = shard_key[0].lower()
            if first_char <= 'i':
                return 'shard1'
            elif first_char <= 'r':
                return 'shard2'
            else:
                return 'shard3'
        else:
            # Для нестроковых ключей используем хеш
            hash_value = hash(str(shard_key))
            shard_index = abs(hash_value) % total_shards
            return f'shard{shard_index + 1}'