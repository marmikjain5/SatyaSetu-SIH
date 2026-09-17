import { config } from 'dotenv';
import path from 'path';
import { sendEmail } from './src/services/gmailService'; // Just test the import if needed, or we can just make the request directly since it's simple

config({ path: path.resolve(process.cwd(), '.env') });

async function getOAuth2AccessToken() {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID,
    client_secret: process.env.GMAIL_CLIENT_SECRET,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error);
  return data.access_token;
}

async function testMail() {
    console.log("Starting test mail dispatch...");
    console.log("Using Refresh Token:", process.env.GMAIL_REFRESH_TOKEN.substring(0, 10) + "...");
    
    try {
        const accessToken = await getOAuth2AccessToken();
        console.log("Successfully generated fresh Access Token!");
        
        const rawMessage = [
            `From: "SatyaSetu Audit" <${process.env.GMAIL_SENDER_EMAIL}>`,
            `To: ${process.env.GMAIL_RECIPIENT_OVERRIDE}`,
            `Subject: SatyaSetu: OAuth Configuration Successful! 🎉`,
            'Content-Type: text/html; charset=utf-8',
            '',
            '<h2>Authentication Successful</h2>',
            '<p>Your Google OAuth 2.0 Client has been successfully configured and the new Refresh Token is working perfectly!</p>',
            '<p>SatyaSetu can now dispatch automated Show Cause Notices.</p>'
        ].join('\\r\\n');
        
        const encodedMessage = Buffer.from(rawMessage).toString('base64url');
        
        const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw: encodedMessage }),
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log("SUCCESS! Test email sent successfully! Message ID:", data.id);
        } else {
            const err = await res.json();
            console.error("FAIL: Could not send test email.", err);
        }
    } catch (e) {
        console.error("Error during token exchange or sending:", e);
    }
}

testMail();
