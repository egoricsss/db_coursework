from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    shard_key: str  # Ключ для определения шарда


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    shard_name: str  # Имя шарда, где хранится пользователь

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    total_users: int
    users_per_shard: dict
    strategy: str
