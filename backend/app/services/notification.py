from sqlalchemy.orm import Session
from typing import Optional

from ..models.notification import Notification
from ..models.drift import Drift
from ..models.user import User


def create_notification(
    db: Session,
    user_id: int,
    drift_id: int,
    title: str,
    message: str
) -> Notification:
    """Create a notification for a user."""
    notification = Notification(
        user_id=user_id,
        drift_id=drift_id,
        title=title,
        message=message,
        is_read=False
    )

    db.add(notification)
    return notification


def create_assignment_notification(
    db: Session,
    drift: Drift,
    assigned_user: User
) -> Notification:
    """Create notification when drift is assigned to user."""
    return create_notification(
        db=db,
        user_id=assigned_user.id,
        drift_id=drift.id,
        title="Assigned to drift",
        message=f"You have been assigned to drift #{drift.id}: {drift.title}"
    )


def create_status_change_notification(
    db: Session,
    drift: Drift,
    old_status: str,
    new_status: str
) -> list[Notification]:
    """Create notifications when drift status changes."""
    notifications = []

    # Notify assignee if drift is resolved or closed
    if new_status in ["resolved", "closed"] and drift.assigned_to_id:
        message = f"Drift #{drift.id} has been {new_status}: {drift.title}"
        notification = create_notification(
            db=db,
            user_id=drift.assigned_to_id,
            drift_id=drift.id,
            title=f"Drift {new_status.title()}",
            message=message
        )
        notifications.append(notification)

    # Notify creator if drift is resolved or closed (if different from assignee)
    if new_status in ["resolved", "closed"] and drift.created_by_id != drift.assigned_to_id:
        message = f"Your drift #{drift.id} has been {new_status}: {drift.title}"
        notification = create_notification(
            db=db,
            user_id=drift.created_by_id,
            drift_id=drift.id,
            title=f"Drift {new_status.title()}",
            message=message
        )
        notifications.append(notification)

    return notifications


def create_comment_notification(
    db: Session,
    drift: Drift,
    comment_author: User
) -> Optional[Notification]:
    """Create notification when someone comments on a drift."""
    # Only notify if there's an assignee and they're not the comment author
    if drift.assigned_to_id and drift.assigned_to_id != comment_author.id:
        message = f"{comment_author.full_name or comment_author.username} commented on drift #{drift.id}: {drift.title}"
        return create_notification(
            db=db,
            user_id=drift.assigned_to_id,
            drift_id=drift.id,
            title="New comment on assigned drift",
            message=message
        )

    # Also notify creator if they're not the comment author and different from assignee
    if drift.created_by_id != comment_author.id and drift.created_by_id != drift.assigned_to_id:
        message = f"{comment_author.full_name or comment_author.username} commented on your drift #{drift.id}: {drift.title}"
        return create_notification(
            db=db,
            user_id=drift.created_by_id,
            drift_id=drift.id,
            title="New comment on your drift",
            message=message
        )

    return None


def mark_notification_read(
    db: Session,
    notification_id: int,
    user_id: int
) -> bool:
    """Mark a notification as read for a user."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()

    if notification:
        notification.is_read = True
        db.commit()
        return True

    return False


def mark_all_notifications_read(db: Session, user_id: int) -> int:
    """Mark all notifications as read for a user. Returns count of updated notifications."""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})

    db.commit()
    return count


def get_unread_notification_count(db: Session, user_id: int) -> int:
    """Get count of unread notifications for a user."""
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()


def cleanup_old_notifications(db: Session, days_old: int = 30) -> int:
    """Clean up read notifications older than specified days. Returns count of deleted notifications."""
    from datetime import datetime, timedelta

    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    count = db.query(Notification).filter(
        Notification.is_read == True,
        Notification.read_at < cutoff_date
    ).delete()

    db.commit()
    return count