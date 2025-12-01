import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function UpgradeSuccess() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push('/'), 3000);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <>
      <Head>
        <title>Upgrade Success</title>
      </Head>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1d', color: '#f0f0f0', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Thank you</h1>
          <p style={{ marginTop: 8 }}>You now have Pro access. Redirecting to home…</p>
        </div>
      </div>
    </>
  );
}
