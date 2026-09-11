from domain.user import User
from infrastructure.security import hash_password


class RegisterUserUseCase:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    def execute(self, email: str,name:str, password: str, tenant_id: str, role: str):
        existing_user = self.user_repository.get_user_by_email(email)

        if existing_user is not None:
            return None

        hashed_password = hash_password(password)

        new_user = User(
            email=email,
            name=name,
            hashed_password=hashed_password,
            tenant_id=tenant_id,
            role=role,
        )

        return self.user_repository.add_user(new_user)