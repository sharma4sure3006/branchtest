from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..database import Base


class DriftStatus(PyEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class DriftPriority(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Drift(Base):
    __tablename__ = "drifts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(DriftStatus), default=DriftStatus.OPEN)
    priority = Column(Enum(DriftPriority), default=DriftPriority.MEDIUM)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="created_drifts")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_drifts")
    comments = relationship("Comment", back_populates="drift", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="drift", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="drift")