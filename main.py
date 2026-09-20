from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from api.routes.auth_router import router as auth_router
from api.routes.tenants_router import router as tenants_router
from api.routes.users_router import router as users_router
from api.routes.documents_router import router as documents_router
from api.routes.onboard_router import router as onboard_router
from api.routes.chat_router import router as chat_router
from api.routes.workflow_router import router as workflow_router
from api.middleware import CorrelationIdMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

app = FastAPI()
@app.get("/health")
def health_check():
    return {"status": "ok"}


limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.include_router(tenants_router)
app.include_router(users_router)
app.include_router(documents_router)
app.include_router(auth_router)
app.include_router(onboard_router)
app.include_router(chat_router)
app.include_router(workflow_router)
app.add_middleware(CorrelationIdMiddleware)

@app.get("/")
def read_root():
    return {"message": "Domain Copilot is alive!"}
