from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.comment import Comment
from ..models.drift import Drift
from ..models.user import User
from ..schemas.comment import CommentCreate, CommentResponse
from ..utils.dependencies import get_authenticated_user

router = APIRouter()


@router.post("/{drift_id}", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    drift_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Add comment to drift."""
    # Verify drift exists
    drift = db.query(Drift).filter(Drift.id == drift_id).first()
    if not drift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drift not found"
        )

    # Validate comment content
    if not comment_data.content or not comment_data.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment content cannot be empty"
        )

    # Create comment
    db_comment = Comment(
        drift_id=drift_id,
        author_id=current_user.id,
        content=comment_data.content.strip()
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    # Load relationships for response
    db_comment.author = current_user

    # TODO: Create event record for comment addition

    return db_comment


@router.get("/{drift_id}", response_model=dict)
async def list_comments(
    drift_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """List comments for drift."""
    # Verify drift exists
    drift = db.query(Drift).filter(Drift.id == drift_id).first()
    if not drift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drift not found"
        )

    # Get comments with author info
    comments = db.query(Comment).filter(Comment.drift_id == drift_id)\
        .order_by(Comment.created_at.asc())\
        .offset(offset)\
        .limit(limit)\
        .all()

    # Load relationships
    for comment in comments:
        comment.author = db.query(User).filter(User.id == comment.author_id).first()

    # Get total count
    total = db.query(Comment).filter(Comment.drift_id == drift_id).count()

    return {
        "comments": comments,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/comment/{comment_id}", response_model=CommentResponse)
async def get_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Get specific comment."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Load relationships
    comment.author = db.query(User).filter(User.id == comment.author_id).first()

    return comment


@router.delete("/comment/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    """Delete comment (author only)."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Only author can delete their own comments
    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )

    db.delete(comment)
    db.commit()

    # TODO: Create event record for comment deletion