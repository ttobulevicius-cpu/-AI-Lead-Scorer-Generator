// Vercel Serverless Function to capture emails
// This will save emails to Google Sheets

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Get Google Sheets credentials from environment variables
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT;

    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT) {
      console.error('Missing Google Sheets configuration');
      // Still return success to user, but log the error
      return res.status(200).json({ success: true });
    }

    // Parse service account credentials
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT);

    // Import Google Sheets API
    const { google } = require('googleapis');
    
    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Append email to Google Sheet
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:C', // Columns: Email, Timestamp, Source
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[email, timestamp, 'Lead Scorer Tool']],
      },
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error saving email:', error);
    // Return success to user even if backend fails
    // You can check logs in Vercel dashboard
    return res.status(200).json({ success: true });
  }
}
