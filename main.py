from fastapi import FastAPI
from api.routes.auth_router import router as auth_router
from api.routes.tenants_router import router as tenants_router
from api.routes.users_router import router as users_router
from api.routes.documents_router import router as documents_router

app = FastAPI()

app.include_router(tenants_router)
app.include_router(users_router)
app.include_router(documents_router)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Domain Copilot is alive!"}

