import g4f

def get_escalation_details(reminders_sent):
    matrix = {
        0: ("Warm & Friendly", "Gentle reminder, assume oversight", "Pay now link"),
        1: ("Polite but Firm", "Payment still pending; request confirmation", "Confirm payment date"),
        2: ("Formal & Serious", "Escalating concern; mention impact", "Respond within 48 hrs"),
        3: ("Stern & Urgent", "Final reminder before escalation", "Pay immediately"),
    }
    return matrix.get(reminders_sent, matrix[3])

async def generate_email(data: dict):
    tone, key_msg, cta = get_escalation_details(data['reminders_sent'])
    
    prompt = f"""
    You are a Finance Collection Agent. Write a {tone} business email regarding Invoice {data['invoice_no']}.
    Client: {data['client_name']}
    Amount: ₹{data['amount']} 
    Days Overdue: {data['overdue_days']}
    Message: {key_msg}
    CTA: {cta}
    
    Rules:
    - Include all details provided above.
    - Do not use placeholders like [Your Name]. Sign off as 'Finance Department'.
    - Output ONLY the email text, no conversational filler.
    """

    try:
        response = await g4f.ChatCompletion.create_async(
            model=g4f.models.gpt_35_turbo,
            messages=[{"role": "user", "content": prompt}]
        )
        return response
    except Exception as e:
        return f"""Subject: Payment Follow up Invoice {data['invoice_no']}

Dear {data['client_name']},

This is a {tone.lower()} message regarding your pending invoice of ₹{data['amount']}, which is currently {data['overdue_days']} days overdue. 

{key_msg}. Please ensure you {cta.lower()} at your earliest convenience to keep your account in good standing.

Sincerely,
Finance Department
"""