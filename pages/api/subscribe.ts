import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const EMAILS_FILE = path.join(process.cwd(), 'emails.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  try {
    let emails: string[] = [];
    if (fs.existsSync(EMAILS_FILE)) {
      const data = fs.readFileSync(EMAILS_FILE, 'utf-8');
      emails = JSON.parse(data);
      if (!Array.isArray(emails)) emails = [];
    }
    if (emails.includes(email)) {
      return res.status(200).json({ message: 'Already subscribed' });
    }
    emails.push(email);
    fs.writeFileSync(EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf-8');
    return res.status(200).json({ message: 'Subscribed successfully' });
  } catch {
    return res.status(500).json({ error: 'Failed to save email' });
  }
}
