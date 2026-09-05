from sqlalchemy.orm import Session
from infrastructure.models import UserModel
from domain.user import User

class UserRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def addUser(self,user:User):
        user_Model = UserModel(id = user.id, name=user.name , tenant_id = user.tenant_id , role = user.role)
        self.session.add(user_Model)
        self.session.commit()
        
    def getUsers_by_tenant(self,tenant_id):
        user_models = self.session.query(UserModel).filter(UserModel.tenant_id == tenant_id).all()
        return [User(id = u.id, name=u.name , tenant_id = u.tenant_id , role = u.role) for u in user_models]