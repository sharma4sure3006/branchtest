from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.drift import DriftStatus, DriftPriority


class DriftBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: DriftStatus = DriftStatus.OPEN
    priority: DriftPriority = DriftPriority.MEDIUM
    assigned_to_id: Optional[int] = None


class DriftCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: DriftPriority = DriftPriority.MEDIUM
    assigned_to_id: Optional[int] = None


class DriftUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DriftStatus] = None
    priority: Optional[DriftPriority] = None
    assigned_to_id: Optional[int] = None


class UserRef(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class DriftResponse(DriftBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    created_by: UserRef
    assigned_to: Optional[UserRef] = None

    class Config:
        from_attributes = True


class DriftListResponse(DriftResponse):
    comment_count: int = 0
    event_count: int = 0


class Drift(DriftBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True