import os


class DatabaseConfig:
    SHARD_CONFIGS = {
        "shard1": os.getenv(
            "DATABASE_URL_SHARD1",
            "postgresql://postgres:password@localhost:5432/shard1",
        ),
        "shard2": os.getenv(
            "DATABASE_URL_SHARD2",
            "postgresql://postgres:password@localhost:5433/shard2",
        ),
        "shard3": os.getenv(
            "DATABASE_URL_SHARD3",
            "postgresql://postgres:password@localhost:5434/shard3",
        ),
    }

    SHARD_NAMES = list(SHARD_CONFIGS.keys())
    TOTAL_SHARDS = len(SHARD_NAMES)


db_config = DatabaseConfig()
