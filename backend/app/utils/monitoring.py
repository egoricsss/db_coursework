import time
from typing import Dict, Any
from datetime import datetime
from database.session import session_manager
from sqlalchemy import text


class MetricsCollector:
    def __init__(self):
        self.operations_log = []
        self.performance_metrics = {
            "hash": {"operations": 0, "total_time": 0},
            "range": {"operations": 0, "total_time": 0},
            "list": {"operations": 0, "total_time": 0},
        }

    def log_operation(self, operation: str, strategy: str, duration: float, shard: str):
        log_entry = {
            "timestamp": datetime.now(),
            "operation": operation,
            "strategy": strategy,
            "duration": duration,
            "shard": shard,
        }
        self.operations_log.append(log_entry)

        # Обновляем метрики производительности
        if strategy in self.performance_metrics:
            self.performance_metrics[strategy]["operations"] += 1
            self.performance_metrics[strategy]["total_time"] += duration

    async def get_shard_stats(self) -> Dict[str, Any]:
        """Получение статистики по всем шардам"""
        stats = {}

        for shard_name in session_manager.sessions.keys():
            with session_manager.get_session(shard_name) as session:
                # Количество пользователей в шарде
                result = session.execute(text("SELECT COUNT(*) FROM users"))
                user_count = result.scalar()

                # Размер базы данных
                result = session.execute(
                    text("SELECT pg_database_size(current_database())")
                )
                db_size = result.scalar()

                stats[shard_name] = {
                    "user_count": user_count,
                    "db_size_bytes": db_size,
                    "db_size_mb": round(db_size / (1024 * 1024), 2),
                }

        return stats

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Метрики производительности по стратегиям"""
        metrics = {}
        for strategy, data in self.performance_metrics.items():
            if data["operations"] > 0:
                avg_time = data["total_time"] / data["operations"]
            else:
                avg_time = 0

            metrics[strategy] = {
                "total_operations": data["operations"],
                "average_time_ms": round(avg_time * 1000, 2),
                "total_time_seconds": round(data["total_time"], 2),
            }

        return metrics


# Глобальный сборщик метрик
metrics_collector = MetricsCollector()
