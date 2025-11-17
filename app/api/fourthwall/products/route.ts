import { NextRequest, NextResponse } from 'next/server';
import { fourthwallClient } from '@/lib/fourthwall';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : undefined;
    const featured = searchParams.get('featured') === 'true';

    const products = await fourthwallClient.getProducts({
      category,
      limit,
      featured,
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [] },
      { status: 500 }
    );
  }
}

