from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    tenant_id: str
    role: str
    
class TenantOnboardRequest(BaseModel):
    tenant_name: str
    admin_name: str
    admin_email: str
    admin_password: str