import asyncio
import os
import sys

# Add backend to path so we can import
sys.path.append('c:/Users/marmi/webdev/SatyaSetu-SIH/backend')
from services.email_service import EmailService

# Force reload of environment
from dotenv import load_dotenv
load_dotenv('c:/Users/marmi/webdev/SatyaSetu-SIH/.env', override=True)

async def test_email():
    print('Testing email service with new OAuth credentials...')
    print(f"Sender: {os.getenv('GMAIL_SENDER_EMAIL')}")
    
    email_service = EmailService()
    
    # Send a quick test email
    success = await email_service.send_email(
        to_email=os.getenv('GMAIL_RECIPIENT_OVERRIDE', 'jainmarmik5@gmail.com'),
        subject='SatyaSetu: OAuth Configuration Successful! 🎉',
        html_content='''
        <h2>Authentication Successful</h2>
        <p>Your Google OAuth 2.0 Client has been successfully configured and the new Refresh Token is working perfectly!</p>
        <p>SatyaSetu can now dispatch automated Show Cause Notices.</p>
        '''
    )
    
    if success:
        print('SUCCESS: Test email was sent successfully!')
    else:
        print('FAIL: Could not send test email. Check logs.')

asyncio.run(test_email())
