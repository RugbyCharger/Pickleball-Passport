'use client'

import NextError from "next/error"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html>
      <body>
        <h1>Something went wrong!</h1>
        <p>{error.message || 'An unexpected error occurred'}</p>
        <NextError statusCode={500} />
      </body>
    </html>
  )
}
