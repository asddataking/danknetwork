'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Plus, Folder, Share2, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface DealCollection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_code: string | null;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export default function DealCollectionsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [collections, setCollections] = useState<DealCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadCollections();
    }
  }, [authLoading, isAuthenticated, user]);

  const loadCollections = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Get collections with item counts
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('deal_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (collectionsError) throw collectionsError;

      // Get item counts for each collection
      const collectionsWithCounts = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          const { count } = await supabase
            .from('deal_collection_items')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          return {
            ...collection,
            item_count: count || 0,
          };
        })
      );

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!user || !newCollectionName.trim()) return;

    try {
      const supabase = getSupabaseClient();

      // Generate share code
      const shareCode = `DANK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { data, error } = await supabase
        .from('deal_collections')
        .insert({
          user_id: user.id,
          name: newCollectionName.trim(),
          description: newCollectionDesc.trim() || null,
          is_public: false,
          share_code: shareCode,
        })
        .select()
        .single();

      if (error) throw error;

      setCollections([{ ...data, item_count: 0 }, ...collections]);
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDesc('');
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('deal_collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCollections(collections.filter(c => c.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  const handleShareCollection = async (collection: DealCollection) => {
    const shareUrl = `${window.location.origin}/deals/collections/${collection.share_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: collection.name,
          text: collection.description || `Check out my ${collection.name} collection`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Collection link copied to clipboard!');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-primary">
        <div className="px-6 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="w-10 h-10 rounded-full bg-brand-card border border-brand-subtle/20 flex items-center justify-center hover:bg-brand-card/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-brand-subtle" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-brand-ink">Deal Collections</h1>
                  <p className="text-brand-subtle">Organize and share your favorite deals</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Collection
              </button>
            </div>

            {/* Collections Grid */}
            {collections.length === 0 ? (
              <div className="card text-center py-12">
                <Folder className="w-16 h-16 text-brand-subtle mx-auto mb-4 opacity-50" />
                <p className="text-brand-subtle mb-4">No collections yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-brand-ink mb-1">{collection.name}</h3>
                        {collection.description && (
                          <p className="text-sm text-brand-subtle">{collection.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCollection(collection.id)}
                        className="w-8 h-8 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-brand-subtle">
                        {collection.item_count || 0} deal{collection.item_count !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShareCollection(collection)}
                          className="px-3 py-1.5 text-sm bg-brand-card border border-brand-subtle/20 rounded-lg hover:bg-brand-card/80 transition-colors flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <Link
                          href={`/deals/collections/${collection.id}`}
                          className="px-3 py-1.5 text-sm bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
                        >
                          View
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Create Collection Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-card border border-brand-subtle/20 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-brand-ink mb-4">Create New Collection</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Name</label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., Weekend Shopping"
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Description (Optional)</label>
                  <textarea
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    placeholder="Describe this collection..."
                    rows={3}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-brand-card border border-brand-subtle/20 rounded-xl text-brand-ink hover:bg-brand-card/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="flex-1 px-4 py-2 bg-brand-primary text-black rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}



