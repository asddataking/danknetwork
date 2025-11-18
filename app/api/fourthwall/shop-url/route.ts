import { NextResponse } from 'next/server';

export async function GET() {
  const shopUrl = process.env.FW_SHOP_URL || '';
  
  if (!shopUrl) {
    return NextResponse.json(
      { error: 'Shop URL not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ shopUrl });
}

