// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

// ✅ Add this line:
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      {/* ✅ Add this line: */}
      <Analytics />
    </>
  )
}
