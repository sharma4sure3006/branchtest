from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.event import EventType


class EventBase(BaseModel):
    event_type: EventType
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    description: str


class EventResponse(EventBase):
    id: int
    drift_id: int
    user_id: int
    created_at: datetime
    user: Optional[dict] = None

    class Config:
        from_attributes = True


class Event(EventBase):
    id: int
    drift_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True