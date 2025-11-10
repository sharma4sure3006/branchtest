from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    drift_id: int


class CommentResponse(CommentBase):
    id: int
    drift_id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    author: Optional[dict] = None

    class Config:
        from_attributes = True


class Comment(CommentBase):
    id: int
    drift_id: int
    author_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True