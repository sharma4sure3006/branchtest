from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List

from ..database import get_db
from ..models.notification import Notification
from ..models.drift import Drift
from ..models.user import User
from ..schemas.notification import NotificationResponse
from ..utils.dependencies import get_authenticated_user

router = APIRouter()


@router.get("/", response_model=dict)
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """List current user's notifications."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    # Filter by read status if requested
    if unread_only:
        query = query.filter(Notification.is_read == False)

    # Get total count
    total = query.count()

    # Get unread count for all notifications
    unread_count = db.query(func.count()).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).scalar()

    # Get notifications with pagination
    notifications = query.order_by(Notification.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()

    # Load drift information for each notification
    for notification in notifications:
        notification.drift = db.query(Drift).filter(Drift.id == notification.drift_id).first()

    return {
        "notifications": notifications,
        "total": total,
        "unread_count": unread_count
    }


@router.post("/read/{notification_id}", response_model=dict)
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Mark notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Mark as read
    notification.is_read = True
    notification.read_at = datetime.utcnow()

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification": {
            "id": notification.id,
            "is_read": notification.is_read,
            "read_at": notification.read_at
        }
    }


@router.post("/read-all", response_model=dict)
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Mark all user's notifications as read."""
    # Update all unread notifications for current user
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })

    db.commit()

    return {
        "message": "All notifications marked as read"
    }


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Delete notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Get count of unread notifications for current user."""
    unread_count = db.query(func.count()).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).scalar()

    return {"unread_count": unread_count}