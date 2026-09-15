from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from api.schemas import LoginRequest, RegisterRequest
from api.dependencies import get_login_use_case, get_register_use_case
from application.login_use_case import LoginUseCase
from application.register_user_use_case import RegisterUserUseCase
from infrastructure.security import create_access_token

router = APIRouter()


@router.post("/login")
def login(
    credentials: LoginRequest,
    login_use_case: LoginUseCase = Depends(get_login_use_case),
):
    user = login_use_case.execute(
        credentials.email,
        credentials.password,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        user_id=user.id,
        tenant_id=user.tenant_id,
        role=user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/token")
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    login_use_case: LoginUseCase = Depends(get_login_use_case),
):
    user = login_use_case.execute(
        form_data.username,
        form_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        user_id=user.id,
        tenant_id=user.tenant_id,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/signup")
def signup(
    data: RegisterRequest,
    register_use_case: RegisterUserUseCase = Depends(
        get_register_use_case
    ),
):
    new_user = register_use_case.execute(
        email=data.email,
        name=data.name,
        password=data.password,
        tenant_id=data.tenant_id,
        role=data.role,
    )

    if new_user is None:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
    }