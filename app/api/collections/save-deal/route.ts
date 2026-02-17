import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { createNotification } from '@/lib/notifications/create';

export async function POST(request: NextRequest) {
  try {
    const { collectionId, dealData } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    // Verify user owns the collection
    const { data: collection, error: collectionError } = await supabase
      .from('deal_collections')
      .select('user_id')
      .eq('id', collectionId)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user || user.id !== collection.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Add deal to collection
    const { data, error } = await supabase
      .from('deal_collection_items')
      .insert({
        collection_id: collectionId,
        deal_data: dealData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving deal to collection:', error);
      return NextResponse.json({ error: 'Failed to save deal' }, { status: 500 });
    }

    // Get collection name for notification
    const { data: collectionData } = await supabase
      .from('deal_collections')
      .select('name')
      .eq('id', collectionId)
      .single();

    // Count items in collection
    const { count } = await supabase
      .from('deal_collection_items')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    // Create notification
    if (collectionData) {
      await createNotification({
        userId: user.id,
        type: 'collection_updated',
        title: 'Deal Added to Collection',
        message: `Added to ${collectionData.name} (${count} total deals)`,
        actionUrl: `/deals/collections/${collectionId}`,
        metadata: { collectionId, dealCount: count },
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in save-deal route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



