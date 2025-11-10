from sqlalchemy.orm import Session
from typing import Dict, Any
import json
from datetime import datetime

from ..models.event import Event, EventType
from ..models.drift import Drift, DriftStatus


def create_event(
    db: Session,
    drift_id: int,
    user_id: int,
    event_type: EventType,
    description: str,
    old_value: Any = None,
    new_value: Any = None
) -> Event:
    """Create an event record for audit trail."""
    event = Event(
        drift_id=drift_id,
        user_id=user_id,
        event_type=event_type,
        description=description,
        old_value=json.dumps(old_value) if old_value is not None else None,
        new_value=json.dumps(new_value) if new_value is not None else None
    )

    db.add(event)
    return event


def log_drift_creation(db: Session, drift: Drift) -> None:
    """Log drift creation event."""
    create_event(
        db=db,
        drift_id=drift.id,
        user_id=drift.created_by_id,
        event_type=EventType.CREATED,
        description=f"Created drift: {drift.title}",
        new_value={
            "title": drift.title,
            "description": drift.description,
            "priority": drift.priority.value,
            "assigned_to_id": drift.assigned_to_id
        }
    )


def log_drift_update(
    db: Session,
    drift_id: int,
    user_id: int,
    old_values: Dict[str, Any],
    new_values: Dict[str, Any]
) -> None:
    """Log drift field update events."""
    for field, new_value in new_values.items():
        if field in old_values:
            old_value = old_values[field]

            # Create specific event for status changes
            if field == "status" and old_value != new_value:
                create_event(
                    db=db,
                    drift_id=drift_id,
                    user_id=user_id,
                    event_type=EventType.STATUS_CHANGED,
                    description=f"Status changed from {format_status(old_value)} to {format_status(new_value)}",
                    old_value={"status": old_value.value if hasattr(old_value, 'value') else old_value},
                    new_value={"status": new_value.value if hasattr(new_value, 'value') else new_value}
                )

            # Create specific event for assignment changes
            elif field == "assigned_to_id" and old_value != new_value:
                if new_value is None or new_value == 0:
                    event_type = EventType.UNASSIGNED
                    description = "Drift unassigned"
                else:
                    event_type = EventType.ASSIGNED
                    description = f"Assigned to user {new_value}"

                create_event(
                    db=db,
                    drift_id=drift_id,
                    user_id=user_id,
                    event_type=event_type,
                    description=description,
                    old_value={"assigned_to_id": old_value},
                    new_value={"assigned_to_id": new_value}
                )

            # General field update
            else:
                create_event(
                    db=db,
                    drift_id=drift_id,
                    user_id=user_id,
                    event_type=EventType.UPDATED,
                    description=f"Updated {field}: {old_value} → {new_value}",
                    old_value={field: old_value.value if hasattr(old_value, 'value') else old_value},
                    new_value={field: new_value.value if hasattr(new_value, 'value') else new_value}
                )


def log_comment_added(db: Session, drift_id: int, user_id: int, comment_content: str) -> None:
    """Log comment addition event."""
    create_event(
        db=db,
        drift_id=drift_id,
        user_id=user_id,
        event_type=EventType.COMMENT_ADDED,
        description=f"Added comment: {comment_content[:100]}{'...' if len(comment_content) > 100 else ''}",
        new_value={"comment_content": comment_content}
    )


def format_status(status) -> str:
    """Format drift status for display."""
    if hasattr(status, 'value'):
        return status.value.replace('_', ' ').title()
    elif isinstance(status, str):
        return status.replace('_', ' ').title()
    return str(status)


def get_drift_events(
    db: Session,
    drift_id: int,
    limit: int = 50,
    offset: int = 0
) -> list[Event]:
    """Get events for a specific drift."""
    return db.query(Event)\
        .filter(Event.drift_id == drift_id)\
        .order_by(Event.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()


def get_user_events(
    db: Session,
    user_id: int,
    limit: int = 50,
    offset: int = 0
) -> list[Event]:
    """Get events performed by a specific user."""
    return db.query(Event)\
        .filter(Event.user_id == user_id)\
        .order_by(Event.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()