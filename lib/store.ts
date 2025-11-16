'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  likedVideos: string[];
  savedVideos: string[];
  toggleLike: (videoId: string) => void;
  toggleSave: (videoId: string) => void;
  isLiked: (videoId: string) => boolean;
  isSaved: (videoId: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      likedVideos: [],
      savedVideos: [],
      toggleLike: (videoId: string) => {
        set((state) => {
          const newLiked = state.likedVideos.includes(videoId)
            ? state.likedVideos.filter((id) => id !== videoId)
            : [...state.likedVideos, videoId];
          return { likedVideos: newLiked };
        });
      },
      toggleSave: (videoId: string) => {
        set((state) => {
          const newSaved = state.savedVideos.includes(videoId)
            ? state.savedVideos.filter((id) => id !== videoId)
            : [...state.savedVideos, videoId];
          return { savedVideos: newSaved };
        });
      },
      isLiked: (videoId: string) => {
        return get().likedVideos.includes(videoId);
      },
      isSaved: (videoId: string) => {
        return get().savedVideos.includes(videoId);
      },
    }),
    {
      name: 'dank-network-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
