import type { NextApiRequest, NextApiResponse } from 'next';

const NOCODEAPI_URL = 'https://v1.nocodeapi.com/orenlevano/google_sheets/UKqAINjGIcUbMdeL?tabId=Sheet1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const response = await fetch(NOCODEAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([[email]]), // ✅ 2D array is required
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const data = await response.json();
      return res.status(500).json({ error: data?.message || 'Failed to save email.' });
    }
  } catch (error) {
    console.error('NoCodeAPI error:', error);
    return res.status(500).json({ error: 'Network error.' });
  }
}
