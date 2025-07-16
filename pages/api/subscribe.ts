import type { NextApiRequest, NextApiResponse } from 'next';

// Use actual NoCodeAPI endpoint URL
const NOCODEAPI_URL = 'https://v1.nocodeapi.com/orenlevano/google_sheets/UKqAINjGIcUbMdeL?tabId=Sheet1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }
  try {
    // POST to NoCodeAPI Google Sheets endpoint
    const response = await fetch(NOCODEAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const data = await response.json();
      res.status(500).json({ error: data?.message || 'Failed to save email.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Network error.' });
  }
}
