"""
JWT Verification & Role Scope Enforcer
"""
from typing import Optional
from fastapi import Header, HTTPException, status
import jwt
from config import settings

class CurrentUser:
    def __init__(self, user_id: str, role: str, state_scope: Optional[str] = None, district_scope: Optional[str] = None):
        self.user_id = user_id
        self.role = role
        self.state_scope = state_scope
        self.district_scope = district_scope

    def check_access(self, state_code: Optional[str] = None, district_code: Optional[str] = None) -> bool:
        if self.role == "national" or self.role == "viewer":
            return True
        if self.role == "state":
            if state_code and state_code != self.state_scope:
                return False
            return True
        if self.role == "district":
            if district_code and district_code != self.district_scope:
                return False
            if state_code and state_code != self.state_scope:
                return False
            return True
        return False

async def get_current_user(authorization: Optional[str] = Header(None)) -> CurrentUser:
    if not authorization:
        # Default unauthenticated public viewer access
        return CurrentUser(user_id="anonymous", role="viewer")

    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return CurrentUser(
            user_id=payload.get("sub", "unknown"),
            role=payload.get("role", "viewer"),
            state_scope=payload.get("state_scope"),
            district_scope=payload.get("district_scope")
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
