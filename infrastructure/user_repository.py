from sqlalchemy.orm import Session
from infrastructure.models import UserModel
from domain.user import User

class UserRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def add_user(self,user:User):
        user_Model = UserModel(id = user.id, name=user.name , tenant_id = user.tenant_id , role = user.role, hashed_password=user.hashed_password , email=user.email)
        self.session.add(user_Model)
        self.session.commit()
        return user
        
    def get_users_by_tenant(self,tenant_id):
        user_models = self.session.query(UserModel).filter(UserModel.tenant_id == tenant_id).all()
        return [User(id = u.id, name=u.name , tenant_id = u.tenant_id , role = u.role , hashed_password=u.hashed_password , email=u.email) for u in user_models]
    
    def get_user_by_email(self, email):
        user_model = self.session.query(UserModel).filter(UserModel.email==email).first()
        if user_model is None:
            return None
        return User(id = user_model.id, name=user_model.name , tenant_id = user_model.tenant_id , role = user_model.role , hashed_password=user_model.hashed_password , email=user_model.email)