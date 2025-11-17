import { google } from 'googleapis';
import { Video } from '@/data/videos';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const youtubeApiKey = process.env.YOUTUBE_API_KEY || '';
const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID || '';

if (!youtubeApiKey || !youtubeChannelId) {
  console.warn('YouTube API credentials not found. Video features may be limited.');
}

const youtube = google.youtube({
  version: 'v3',
  auth: youtubeApiKey,
});

// Supabase client for caching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

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
   * Get cache key for YouTube videos
   */
  private static getCacheKey(maxResults: number): string {
    return `youtube_videos_${youtubeChannelId}_${maxResults}`;
  }

  /**
   * Get cached videos from Supabase
   */
  private static async getCachedVideos(maxResults: number): Promise<YouTubeVideo[] | null> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const cacheKey = this.getCacheKey(maxResults);
      const { data, error } = await client
        .from('episodes_cache')
        .select('episodes_data, expires_at')
        .eq('cache_key', cacheKey)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if cache is still valid (not expired)
      const expiresAt = new Date(data.expires_at);
      const now = new Date();

      if (now >= expiresAt) {
        // Cache expired, delete it
        await client
          .from('episodes_cache')
          .delete()
          .eq('cache_key', cacheKey);
        return null;
      }

      // Return cached data
      return data.episodes_data as YouTubeVideo[];
    } catch (error) {
      console.error('[YouTubeService] Error getting cache:', error);
      return null;
    }
  }

  /**
   * Save videos to cache in Supabase
   */
  private static async saveToCache(videos: YouTubeVideo[], maxResults: number): Promise<void> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return;
      }

      const cacheKey = this.getCacheKey(maxResults);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const { error } = await client
        .from('episodes_cache')
        .upsert({
          cache_key: cacheKey,
          episodes_data: videos,
          episodes_count: videos.length,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'cache_key',
        });

      if (error) {
        console.error('[YouTubeService] Error saving to cache:', error);
      } else {
        console.log(`[YouTubeService] Cached ${videos.length} videos for 24 hours`);
      }
    } catch (error) {
      console.error('[YouTubeService] Error saving to cache:', error);
    }
  }

  /**
   * Fetch videos from the configured YouTube channel
   * Uses Supabase cache to avoid hitting YouTube API too frequently (24 hour cache)
   */
  static async getChannelVideos(maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      if (!youtubeApiKey || !youtubeChannelId) {
        return [];
      }

      // Try to get from cache first
      const cachedVideos = await this.getCachedVideos(maxResults);
      if (cachedVideos && cachedVideos.length > 0) {
        console.log(`[YouTubeService] Returning ${cachedVideos.length} videos from cache`);
        return cachedVideos;
      }

      // Cache miss or expired, fetch from YouTube API
      console.log('[YouTubeService] Cache miss, fetching from YouTube API...');

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
      const videos = videosResponse.data.items.map((video) => {
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

      // Save to cache for next time
      await this.saveToCache(videos, maxResults);

      return videos;
    } catch (error) {
      console.error('[YouTubeService] Error fetching YouTube videos:', error);
      
      // On error, try to return cached data even if expired
      const cachedVideos = await this.getCachedVideos(maxResults);
      if (cachedVideos && cachedVideos.length > 0) {
        console.log('[YouTubeService] YouTube API failed, returning stale cache');
        return cachedVideos;
      }
      
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

