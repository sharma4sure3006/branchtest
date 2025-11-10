from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.user import User, UserRole
from ..utils.security import verify_password, decode_basic_auth, verify_token

# HTTP Basic and Bearer schemes
basic_scheme = HTTPBasic()
bearer_scheme = HTTPBearer()


def get_current_user_basic(
    credentials: HTTPAuthorizationCredentials = Depends(basic_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current user using HTTP Basic Authentication."""
    try:
        username = credentials.username
        password = credentials.password

        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Basic"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication headers",
            headers={"WWW-Authenticate": "Basic"},
        )


def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current user using JWT token."""
    try:
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = None,
    basic_auth: Optional[str] = None
) -> User:
    """Get current user using either JWT token or Basic Auth."""
    # Try JWT token first
    if token:
        payload = verify_token(token)
        if payload:
            username = payload.get("sub")
            if username:
                user = db.query(User).filter(User.username == username).first()
                if user and user.is_active:
                    return user

    # Fall back to Basic Auth
    if basic_auth:
        decoded = decode_basic_auth(basic_auth)
        if decoded:
            username, password = decoded
            user = db.query(User).filter(User.username == username).first()
            if user and user.is_active and verify_password(password, user.password_hash):
                return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Basic"},
    )


def get_admin_user(current_user: User = Depends(get_current_user_basic)) -> User:
    """Ensure current user has admin role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(basic_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Generic authentication for any valid user (Basic Auth for login)."""
    username = credentials.username
    password = credentials.password

    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return user