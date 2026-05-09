from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sqlalchemy.orm import Session
from agent_logic import generate_email
from database import engine, SessionLocal
from models import AuditLog, InvoiceRequest, Base 

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/invoices")
def get_invoices():
    df = pd.read_csv("data/invoices.csv")
    return df.to_dict(orient="records")

@app.post("/process-email")
async def process_email(invoice: InvoiceRequest):
    if invoice.reminders_sent >= 4:
        return {"status": "ESCALATED", "message": "Flagged for Legal Review"}
    
    email_body = await generate_email(invoice.dict())
    
    db = SessionLocal()
    log_entry = AuditLog(
        invoice_no=invoice.invoice_no,
        client_name=invoice.client_name,
        tone_used="Escalation Stage " + str(invoice.reminders_sent + 1),
        email_content=email_body
    )
    db.add(log_entry)
    db.commit()
    db.close()
    
    return {"status": "SENT", "content": email_body}

@app.get("/logs")
def get_audit_logs():
    db = SessionLocal()
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).all()
    db.close()
    return logs