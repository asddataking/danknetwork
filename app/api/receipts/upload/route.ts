/**
 * POST /api/receipts/upload
 * 
 * Handles receipt upload, OCR extraction, and validation
 * 
 * Flow:
 * 1. Upload image to Supabase Storage
 * 2. Extract data using Gemini Flash OCR
 * 3. Create receipt record in database (pending approval)
 * 4. Return extracted data for user confirmation
 */

import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { extractReceiptWithGemini, calculatePointsFromReceipt } from '@/lib/ai/receipt-extraction';
import { isUserPremium } from '@/lib/subscription/premium';
import { matchPartnerByMerchantName } from '@/lib/rewards/supabase';
import { notifyReceiptApproved, notifyReceiptRejected, notifyPointsAwarded } from '@/lib/notifications/create';

export async function POST(request: Request) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only images and PDFs are supported' },
        { status: 400 }
      );
    }

    // Check user's premium status
    const isPremium = await isUserPremium(userId, true);

    // TODO: Check upload limit for free users (when rewards tables exist)
    // For now, just log the premium status
    console.log(`[Receipt Upload] User ${userId} - Premium: ${isPremium}`);

    // Upload to Supabase Storage
    const supabase = getSupabaseServiceClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (uploadError) {
      console.error('[Receipt Upload] Storage error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    console.log(`[Receipt Upload] File uploaded: ${publicUrl}`);

    // Extract receipt data using Gemini
    let extractedData = null;
    try {
      // Convert file to base64 for Gemini
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');

      extractedData = await extractReceiptWithGemini(base64, file.type);
      
      console.log(`[Receipt Upload] Extraction complete - Valid: ${extractedData.isValid}, Confidence: ${extractedData.validationConfidence}`);
    } catch (extractError) {
      console.error('[Receipt Upload] Extraction error:', extractError);
      // Continue anyway - manual review can process it
    }

    // Match merchant to partner
    let partnerId = null;
    let partnerMultiplier = 1.0;
    if (extractedData?.merchantName) {
      const partner = await matchPartnerByMerchantName(extractedData.merchantName);
      if (partner) {
        partnerId = partner.id;
        partnerMultiplier = partner.points_multiplier || 1.0;
        console.log(`[Receipt Upload] Matched partner: ${partner.business_name} (${partnerMultiplier}x multiplier)`);
      }
    }

    // Calculate potential points
    let pointsAwarded = 0;
    if (extractedData?.isValid && extractedData.totalAmount) {
      pointsAwarded = calculatePointsFromReceipt(
        extractedData.totalAmount,
        isPremium,
        partnerMultiplier
      );
    }

    // Create receipt record in database
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: userId,
        partner_id: partnerId,
        image_url: publicUrl,
        status: extractedData?.isValid ? 'approved' : 'pending',
        total: extractedData?.totalAmount,
        merchant_name: extractedData?.merchantName,
        purchase_date: extractedData?.purchaseDate,
        points_awarded: extractedData?.isValid ? pointsAwarded : 0,
        points_multiplier: partnerMultiplier,
        parsed_data: extractedData,
        processed_at: extractedData?.isValid ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (receiptError) {
      console.error('[Receipt Upload] Database error:', receiptError);
      return NextResponse.json(
        { success: false, error: 'Failed to save receipt' },
        { status: 500 }
      );
    }

    // If auto-approved, award points immediately
    if (extractedData?.isValid && pointsAwarded > 0) {
      // Update user profile points
      const { awardPoints } = await import('@/lib/rewards/supabase');
      await awardPoints(
        userId,
        pointsAwarded,
        'earned',
        receipt.id,
        'receipt',
        `Receipt from ${extractedData.merchantName || 'merchant'} - $${extractedData.totalAmount}`
      );

      // Points awarded successfully, continue with notifications and bonuses
      {
        // Create notification for approved receipt
        await notifyReceiptApproved(
          userId,
          receipt.id,
          pointsAwarded,
          extractedData?.merchantName || undefined
        );

        // Check if this is first receipt and award bonus
        if (receipt.status === 'approved') {
          try {
            // Check receipt count to see if this is first
            const { count } = await supabase
              .from('receipts')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('status', 'approved');

            // If this is the first approved receipt, award bonus
            if (count === 1) {
              // Import and call directly instead of HTTP request
              const { awardPoints } = await import('@/lib/rewards/supabase');
              
              // Check if already awarded
              const { data: existing } = await supabase
                .from('points_transactions')
                .select('id')
                .eq('user_id', userId)
                .eq('reference_type', 'promotion')
                .eq('description', 'First receipt bonus')
                .limit(1)
                .single();

              if (!existing) {
                await awardPoints(
                  userId,
                  50,
                  'bonus',
                  receipt.id,
                  'promotion',
                  'First receipt bonus'
                );
                console.log('[Receipt Upload] First receipt bonus awarded');
                
                // Notify about bonus
                await notifyPointsAwarded(
                  userId,
                  50,
                  'First receipt bonus! 🎉',
                  '/rewards'
                );
              }
            }
          } catch (err) {
            console.log('[Receipt Upload] Could not check first receipt bonus:', err);
          }
        }
      }
    } else if (receipt.status === 'pending') {
      // Create notification for pending receipt
      await notifyReceiptRejected(
        userId,
        receipt.id,
        'Receipt needs manual review'
      );
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: receipt.id,
        imageUrl: publicUrl,
        status: receipt.status,
        extractedData,
        pointsAwarded,
        message: receipt.status === 'approved'
          ? `Receipt approved! ${pointsAwarded} points earned! 🎉`
          : 'Receipt uploaded! Our team will review and approve it soon.',
      },
    });
  } catch (error) {
    console.error('[Receipt Upload] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

