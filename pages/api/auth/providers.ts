import type { NextApiRequest, NextApiResponse } from 'next';

// Lightweight compatibility endpoint. Some libraries (or older code) may request
// /api/auth/providers expecting NextAuth-like behaviour. This endpoint prevents
// a 404 and returns the list of OAuth providers we support. It does not
// implement full NextAuth — the app uses Supabase for OAuth.

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // In future you could dynamically read this from configuration.
  const providers = [{ id: 'google', name: 'Google' }];
  return res.status(200).json({ providers });
}
