from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_trail"
    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String)
    client_name = Column(String)
    tone_used = Column(String)
    email_content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class InvoiceRequest(BaseModel):
    invoice_no: str
    client_name: str
    amount: float
    due_date: str
    overdue_days: int
    reminders_sent: int