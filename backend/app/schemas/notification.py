from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    title: str
    message: str
    is_read: bool = False


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    drift_id: int
    created_at: datetime
    read_at: Optional[datetime] = None
    drift: Optional[dict] = None

    class Config:
        from_attributes = True


class Notification(NotificationBase):
    id: int
    user_id: int
    drift_id: int
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True