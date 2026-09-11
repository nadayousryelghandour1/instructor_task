from infrastructure.security import verify_password


class LoginUseCase:
    def __init__(self, user_repository):
        self.user_repository = user_repository
        
    def execute(self, email: str, password: str):
        user = self.user_repository.get_user_by_email(email)
        
        if user is None:
            return None
        
        if not verify_password(password, user.hashed_password): 
            return None
        
        return user