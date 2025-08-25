// app/book/page.js
import { Suspense } from 'react'
import PublicBookingPage from './booking' // Move your component logic here

export default function BookPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicBookingPage />
    </Suspense>
  )
}