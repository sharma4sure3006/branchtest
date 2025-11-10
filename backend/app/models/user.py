from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..database import Base


class UserRole(PyEnum):
    ADMIN = "admin"
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    created_drifts = relationship("Drift", foreign_keys="Drift.created_by_id", back_populates="created_by")
    assigned_drifts = relationship("Drift", foreign_keys="Drift.assigned_to_id", back_populates="assigned_to")
    comments = relationship("Comment", back_populates="author")
    notifications = relationship("Notification", back_populates="user")
    events = relationship("Event", back_populates="user")