import { NextResponse } from 'next/server';
import { YouTubeService } from '@/lib/youtube';
import { Video } from '@/data/videos';

// Force dynamic rendering (cache is handled in YouTubeService)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '50', 10);
    const brand = searchParams.get('brand') as Video['brand'] || 'danknddevour';

    const youtubeVideos = await YouTubeService.getChannelVideos(maxResults);

    // Transform to our Video format
    const videos = youtubeVideos.map((ytVideo) =>
      YouTubeService.transformToVideo(ytVideo, brand)
    );

    return NextResponse.json({ videos });
  } catch (error) {
    // Log error in development, but don't expose details in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching YouTube videos:', error);
    }
    return NextResponse.json({ videos: [] }, { status: 500 });
  }
}

