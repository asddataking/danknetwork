import { google } from 'googleapis';
import { Video } from '@/data/videos';

const youtubeApiKey = process.env.YOUTUBE_API_KEY || '';
const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID || '';

if (!youtubeApiKey || !youtubeChannelId) {
  console.warn('YouTube API credentials not found. Video features may be limited.');
}

const youtube = google.youtube({
  version: 'v3',
  auth: youtubeApiKey,
});

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  channelId: string;
  channelTitle: string;
}

export class YouTubeService {
  /**
   * Fetch videos from the configured YouTube channel
   */
  static async getChannelVideos(maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      if (!youtubeApiKey || !youtubeChannelId) {
        return [];
      }

      // First, get the uploads playlist ID from the channel
      const channelResponse = await youtube.channels.list({
        part: ['contentDetails'],
        id: [youtubeChannelId],
      });

      const uploadsPlaylistId =
        channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        console.error('Could not find uploads playlist for channel');
        return [];
      }

      // Get videos from the uploads playlist
      const playlistResponse = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults,
      });

      if (!playlistResponse.data.items) {
        return [];
      }

      // Get video IDs
      const videoIds = playlistResponse.data.items
        .map((item) => item.contentDetails?.videoId)
        .filter((id): id is string => !!id);

      if (videoIds.length === 0) {
        return [];
      }

      // Get detailed video information
      const videosResponse = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      });

      if (!videosResponse.data.items) {
        return [];
      }

      // Transform YouTube data to our Video format
      return videosResponse.data.items.map((video) => {
        const snippet = video.snippet!;
        const statistics = video.statistics || {};
        const contentDetails = video.contentDetails || {};

        return {
          id: video.id!,
          title: snippet.title || '',
          description: snippet.description || '',
          thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
          videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
          publishedAt: snippet.publishedAt || '',
          duration: this.parseDuration(contentDetails.duration || ''),
          viewCount: parseInt(statistics.viewCount || '0', 10),
          likeCount: parseInt(statistics.likeCount || '0', 10),
          channelId: snippet.channelId || '',
          channelTitle: snippet.channelTitle || '',
        };
      });
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return [];
    }
  }

  /**
   * Parse ISO 8601 duration (e.g., "PT2M34S") to "2:34"
   */
  static parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Transform YouTube video to our Video format
   */
  static transformToVideo(youtubeVideo: YouTubeVideo, brand: Video['brand'] = 'danknddevour'): Video {
    // Try to extract location from title or description
    const locationMatch = youtubeVideo.title.match(/–\s*(.+?)(?:\s*\|)?$/);
    const location = locationMatch ? locationMatch[1].trim() : 'Unknown';

    // Determine vibes based on title/description keywords
    const vibes: string[] = [];
    const titleLower = youtubeVideo.title.toLowerCase();
    const descLower = youtubeVideo.description.toLowerCase();

    if (titleLower.includes('recipe') || descLower.includes('recipe')) {
      vibes.push('high & hungry');
    }
    if (titleLower.includes('game') || titleLower.includes('sport') || titleLower.includes('tailgate')) {
      vibes.push('game day');
    }
    if (titleLower.includes('road') || titleLower.includes('trip') || titleLower.includes('travel')) {
      vibes.push('road trip');
    }
    if (titleLower.includes('late') || titleLower.includes('night') || titleLower.includes('midnight')) {
      vibes.push('late night');
    }
    if (titleLower.includes('infused') || descLower.includes('cannabis')) {
      vibes.push('infused');
    }
    if (vibes.length === 0) {
      vibes.push('high & hungry'); // Default
    }

    return {
      id: youtubeVideo.id,
      title: youtubeVideo.title,
      brand,
      location,
      runtime: youtubeVideo.duration,
      vibes,
      thumbnailUrl: youtubeVideo.thumbnailUrl,
      videoUrl: youtubeVideo.videoUrl,
      likes: youtubeVideo.likeCount,
      createdAt: youtubeVideo.publishedAt.split('T')[0], // Just the date part
    };
  }
}

