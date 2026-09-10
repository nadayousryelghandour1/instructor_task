from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from infrastructure.models import Base

engine = create_engine("sqlite:///domain_copilot.db")
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(engine)