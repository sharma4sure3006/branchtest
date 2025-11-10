from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Dict

from ..database import get_db
from ..models.user import User, UserRole
from ..schemas.user import UserCreate, UserResponse, UserLogin
from ..utils.security import get_password_hash, create_access_token, verify_password
from ..utils.dependencies import get_admin_user, get_authenticated_user

router = APIRouter()


@router.post("/bootstrap", response_model=Dict, status_code=status.HTTP_201_CREATED)
async def bootstrap_admin(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Create first admin user. Only works if no users exist."""
    # Check if any users exist
    existing_user = db.query(User).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )

    # Validate input
    if not user_data.username or not user_data.email or not user_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username, email, and password are required"
        )

    # Create admin user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hashed_password,
        role=UserRole.ADMIN,
        is_active=True
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "message": "Admin user created successfully",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "role": db_user.role.value
        }
    }


@router.post("/login", response_model=Dict)
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.username == user_data.username).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Create JWT token
    access_token = create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_authenticated_user)
):
    """Get current authenticated user info."""
    return current_user