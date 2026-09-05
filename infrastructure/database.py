from sqlalchemy import create_engine
from infrastructure.models import Base

engine = create_engine("sqlite:///domain_copilot.db")

Base.metadata.create_all(engine)