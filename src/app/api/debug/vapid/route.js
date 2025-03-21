import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vapidPublicKey: {
      exists: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      value: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 
        `${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 10)}...` : null
    },
    vapidPrivateKey: {
      exists: !!process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY,
      value: process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY ? 
        `${process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY.substring(0, 5)}...` : null
    },
    webPushEmail: process.env.WEB_PUSH_EMAIL || 'default@example.com',
    envVars: Object.keys(process.env)
      .filter(key => key.includes('VAPID') || key.includes('PUSH') || key.includes('PUBLIC'))
      .map(key => key)
  });
} 