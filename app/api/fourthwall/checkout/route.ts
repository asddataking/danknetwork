import { NextRequest, NextResponse } from 'next/server';
import { fourthwallClient } from '@/lib/fourthwall';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, message } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const checkout = await fourthwallClient.createDonationCheckout(
      amount,
      message
    );

    if (checkout.error) {
      return NextResponse.json(
        { error: checkout.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

