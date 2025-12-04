import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { burnPoints, awardPoints } from '@/lib/rewards/supabase';
import { createNotification } from '@/lib/notifications/create';

export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, amount, message, transferType } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate inputs
    if (!recipientEmail || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid recipient or amount' }, { status: 400 });
    }

    // Get sender's profile
    const { data: senderProfile, error: senderError } = await supabase
      .from('user_profiles')
      .select('points')
      .eq('id', user.id)
      .single();

    if (senderError || !senderProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check balance
    if (senderProfile.points < amount) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Check daily/monthly limits (simplified - can be enhanced)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayCount } = await supabase
      .from('points_transfers')
      .select('*', { count: 'exact', head: true })
      .eq('from_user_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());

    const todayTotal = await supabase
      .from('points_transfers')
      .select('amount')
      .eq('from_user_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());

    const todayAmount = (todayTotal.data || []).reduce((sum, t) => sum + t.amount, 0);
    
    if (todayAmount + amount > 1000) {
      return NextResponse.json({ error: 'Daily transfer limit exceeded (1,000 points/day)' }, { status: 400 });
    }

    // Find recipient by email
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      return NextResponse.json({ error: 'Failed to find recipient' }, { status: 500 });
    }

    const recipientUser = usersData?.users?.find(u => u.email?.toLowerCase() === recipientEmail.toLowerCase());
    
    if (!recipientUser) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    if (recipientUser.id === user.id) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 });
    }

    // Create transfer record
    const { data: transfer, error: transferError } = await supabase
      .from('points_transfers')
      .insert({
        from_user_id: user.id,
        to_user_id: recipientUser.id,
        amount,
        transfer_type: transferType || 'transfer',
        message: message || null,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transferError) {
      console.error('Error creating transfer:', transferError);
      return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
    }

    // Burn points from sender
    await burnPoints(
      user.id,
      amount,
      transfer.id,
      'admin',
      `Points ${transferType === 'gift' ? 'gifted' : 'transferred'} to ${recipientEmail}`
    );

    // Award points to recipient
    await awardPoints(
      recipientUser.id,
      amount,
      'transfer_received',
      transfer.id,
      'promotion',
      transferType === 'gift' 
        ? `Points gift from ${user.email}${message ? `: ${message}` : ''}`
        : `Points transfer from ${user.email}`
    );

    // Create notifications
    await createNotification({
      userId: recipientUser.id,
      type: 'points_awarded',
      title: transferType === 'gift' ? 'Points Gift Received! 🎁' : 'Points Transfer Received',
      message: `You received ${amount} points from ${user.email}${message ? `: "${message}"` : ''}`,
      actionUrl: '/rewards/marketplace',
      metadata: { transferId: transfer.id, amount, type: transferType },
    });

    await createNotification({
      userId: user.id,
      type: 'points_awarded',
      title: transferType === 'gift' ? 'Gift Sent! 🎁' : 'Transfer Completed',
      message: `You ${transferType === 'gift' ? 'gifted' : 'transferred'} ${amount} points to ${recipientEmail}`,
      actionUrl: '/rewards/marketplace',
      metadata: { transferId: transfer.id, amount, type: transferType },
    });

    return NextResponse.json({ success: true, transfer });
  } catch (error) {
    console.error('Error in transfer route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



