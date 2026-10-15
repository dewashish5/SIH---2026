"""
JWT Verification & Role Scope Enforcer
"""

import jwt
from fastapi import Header, HTTPException, status

from config import settings


class CurrentUser:
    def __init__(self, user_id: str, role: str, state_scope: str | None = None, district_scope: str | None = None):
        self.user_id = user_id
        self.role = role
        self.state_scope = state_scope
        self.district_scope = district_scope

    def check_access(self, state_code: str | None = None, district_code: str | None = None) -> bool:
        if self.role == "national" or self.role == "viewer":
            return True
        if self.role == "state":
            return not (state_code and state_code != self.state_scope)
        if self.role == "district":
            if district_code and district_code != self.district_scope:
                return False
            return not (state_code and state_code != self.state_scope)
        return False

async def get_current_user(authorization: str | None = Header(None)) -> CurrentUser:
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
