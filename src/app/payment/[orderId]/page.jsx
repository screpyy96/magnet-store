import { use } from 'react'
import PaymentClient from './PaymentClient'

export default function Payment({ params }) {
  const resolvedParams = use(params)
  return <PaymentClient orderId={resolvedParams.orderId} />
} 