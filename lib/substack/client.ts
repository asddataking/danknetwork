/**
 * Substack API Client
 * Simple wrapper for publishing content to Substack
 * Substack handles all subscriber management and email delivery
 */

export interface SubstackPost {
  title: string;
  subtitle?: string;
  body: string; // Markdown content
  send?: boolean; // Auto-send or save as draft
}

/**
 * Publish content to Substack
 * Substack will automatically send emails to subscribers
 */
export async function publishToSubstack(post: SubstackPost): Promise<{ id: string }> {
  const substackApiKey = process.env.SUBSTACK_API_KEY;
  const substackPublicationId = process.env.SUBSTACK_PUBLICATION_ID;

  if (!substackApiKey || !substackPublicationId) {
    throw new Error('Substack API not configured. Set SUBSTACK_API_KEY and SUBSTACK_PUBLICATION_ID');
  }

  const response = await fetch('https://substack.com/api/v1/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${substackApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publication_id: substackPublicationId,
      title: post.title,
      subtitle: post.subtitle,
      body: post.body,
      send: post.send ?? true, // Auto-send by default
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Substack API error: ${response.status} ${error}`);
  }

  return await response.json();
}

/**
 * Publish to free tier (public newsletter)
 */
export async function publishToFreeTier(post: SubstackPost): Promise<{ id: string }> {
  // Substack handles free vs premium based on publication settings
  // You might need separate publication IDs for free vs premium
  return publishToSubstack(post);
}

/**
 * Publish to premium tier (paid newsletter)
 */
export async function publishToPremiumTier(post: SubstackPost): Promise<{ id: string }> {
  // If you have separate publication IDs, use that here
  // Otherwise, Substack handles tiers based on publication settings
  return publishToSubstack(post);
}

