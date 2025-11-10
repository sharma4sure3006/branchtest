from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional

from ..database import get_db
from ..models.drift import Drift, DriftStatus, DriftPriority
from ..models.user import User
from ..schemas.drift import DriftCreate, DriftUpdate, DriftResponse, DriftListResponse
from ..utils.dependencies import get_authenticated_user

router = APIRouter()


@router.post("/", response_model=DriftResponse, status_code=status.HTTP_201_CREATED)
async def create_drift(
    drift_data: DriftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Create new drift."""
    # Validate assigned user exists if provided
    if drift_data.assigned_to_id:
        assigned_user = db.query(User).filter(User.id == drift_data.assigned_to_id).first()
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user not found"
            )

    # Create drift
    db_drift = Drift(
        title=drift_data.title,
        description=drift_data.description,
        priority=drift_data.priority,
        created_by_id=current_user.id,
        assigned_to_id=drift_data.assigned_to_id
    )

    db.add(db_drift)
    db.commit()
    db.refresh(db_drift)

    # Load relationships for response
    db_drift.created_by = current_user
    if db_drift.assigned_to_id:
        db_drift.assigned_to = db.query(User).filter(User.id == db_drift.assigned_to_id).first()

    # TODO: Create event record for drift creation

    return db_drift


@router.get("/", response_model=dict)
async def list_drifts(
    status: Optional[DriftStatus] = Query(None),
    priority: Optional[DriftPriority] = Query(None),
    assigned_to: Optional[int] = Query(None),
    created_by: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """List drifts with filtering and search."""
    query = db.query(Drift)

    # Apply filters
    if status:
        query = query.filter(Drift.status == status)
    if priority:
        query = query.filter(Drift.priority == priority)
    if assigned_to:
        query = query.filter(Drift.assigned_to_id == assigned_to)
    if created_by:
        query = query.filter(Drift.created_by_id == created_by)
    if search:
        query = query.filter(
            or_(
                Drift.title.ilike(f"%{search}%"),
                Drift.description.ilike(f"%{search}%")
            )
        )

    # Count total results
    total = query.count()

    # Apply sorting
    sort_column = getattr(Drift, sort_by, Drift.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Apply pagination
    drifts = query.offset(offset).limit(limit).all()

    # Load relationships and count comments/events
    drift_responses = []
    for drift in drifts:
        # Load relationships
        drift.created_by = db.query(User).filter(User.id == drift.created_by_id).first()
        if drift.assigned_to_id:
            drift.assigned_to = db.query(User).filter(User.id == drift.assigned_to_id).first()

        # Count comments and events
        comment_count = db.query(func.count()).filter_by(drift_id=drift.id).scalar()
        event_count = db.query(func.count()).filter_by(drift_id=drift.id).scalar()

        drift_response = DriftListResponse(
            id=drift.id,
            title=drift.title,
            description=drift.description,
            status=drift.status,
            priority=drift.priority,
            assigned_to_id=drift.assigned_to_id,
            created_by_id=drift.created_by_id,
            created_at=drift.created_at,
            updated_at=drift.updated_at,
            resolved_at=drift.resolved_at,
            closed_at=drift.closed_at,
            created_by=drift.created_by,
            assigned_to=drift.assigned_to,
            comment_count=comment_count,
            event_count=event_count
        )
        drift_responses.append(drift_response)

    return {
        "drifts": drift_responses,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/{drift_id}", response_model=DriftResponse)
async def get_drift(
    drift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Get drift details."""
    drift = db.query(Drift).filter(Drift.id == drift_id).first()
    if not drift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drift not found"
        )

    # Load relationships
    drift.created_by = db.query(User).filter(User.id == drift.created_by_id).first()
    if drift.assigned_to_id:
        drift.assigned_to = db.query(User).filter(User.id == drift.assigned_to_id).first()

    return drift


@router.patch("/{drift_id}", response_model=DriftResponse)
async def update_drift(
    drift_id: int,
    drift_update: DriftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Update drift fields."""
    drift = db.query(Drift).filter(Drift.id == drift_id).first()
    if not drift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drift not found"
        )

    # Track changes for event logging
    old_values = {}
    new_values = {}

    # Update fields
    update_data = drift_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(drift, field):
            old_value = getattr(drift, field)
            if old_value != value:
                old_values[field] = old_value
                new_values[field] = value
                setattr(drift, field, value)

    # Validate assigned user exists if provided
    if drift_update.assigned_to_id is not None and drift_update.assigned_to_id != 0:
        assigned_user = db.query(User).filter(User.id == drift_update.assigned_to_id).first()
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user not found"
            )

    db.commit()
    db.refresh(drift)

    # Load relationships for response
    drift.created_by = db.query(User).filter(User.id == drift.created_by_id).first()
    if drift.assigned_to_id:
        drift.assigned_to = db.query(User).filter(User.id == drift.assigned_to_id).first()

    # TODO: Create event records for changes

    return drift