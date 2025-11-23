import { Deal } from '@/lib/scoring/queries';

/**
 * Format date for newsletter
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate markdown for a single deal
 */
export function formatDealMarkdown(deal: Deal, rank: number): string {
  const dispensaryName = deal.dispensaries?.name || 'Unknown Dispensary';
  const thcDisplay = deal.thc_percent ? `${deal.thc_percent}%` : 'N/A';
  const weightDisplay = deal.weight_grams ? `${deal.weight_grams}g` : 'N/A';
  const valueScoreDisplay = deal.value_score.toFixed(2);
  const labelEmoji = deal.deal_label === 'STEAL' ? '🔥' : deal.deal_label === 'SOLID' ? '✅' : '';

  return `### ${rank}. ${deal.product_name} - ${dispensaryName}
- **Price:** $${deal.price_usd} | **THC:** ${thcDisplay} | **Weight:** ${weightDisplay}
- **Value Score:** ${valueScoreDisplay} mg/$ (${deal.deal_label || 'MID'} ${labelEmoji})
- **Location:** ${deal.zip}`;
}

/**
 * Group deals by product type
 */
export function groupDealsByType(deals: Deal[]): Record<string, Deal[]> {
  const grouped: Record<string, Deal[]> = {};

  for (const deal of deals) {
    const type = deal.product_type || 'other';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(deal);
  }

  return grouped;
}

/**
 * Get emoji for product type
 */
export function getProductTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    flower: '🌿',
    cart: '💨',
    edible: '🍪',
    concentrate: '💎',
    topical: '🧴',
    other: '📦',
  };

  return emojis[type.toLowerCase()] || '📦';
}

/**
 * Capitalize product type
 */
export function capitalizeProductType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Generate markdown newsletter for a ZIP group
 */
export function generateMarkdownForZipGroup(
  deals: Deal[],
  groupName: string,
  date: Date = new Date()
): string {
  if (deals.length === 0) {
    return `# Daily Dispo Deals - ${groupName}

**${formatDate(date)}**

No deals found for ${groupName} today. Check back tomorrow!`;
  }

  const byType = groupDealsByType(deals);
  let markdown = `# Daily Dispo Deals - ${groupName}\n\n`;
  markdown += `**${formatDate(date)}**\n\n`;
  markdown += `Here are today's best dispensary deals in ${groupName}, ranked by THC-per-dollar value.\n\n`;
  markdown += `---\n\n`;

  // Process each product type
  const typeOrder = ['flower', 'cart', 'edible', 'concentrate', 'topical', 'other'];

  for (const type of typeOrder) {
    if (!byType[type] || byType[type].length === 0) continue;

    const typeDeals = byType[type].slice(0, 10); // Top 10 per type
    const emoji = getProductTypeEmoji(type);
    const typeName = capitalizeProductType(type);

    markdown += `## ${emoji} ${typeName}\n\n`;

    typeDeals.forEach((deal, idx) => {
      markdown += formatDealMarkdown(deal, idx + 1);
      markdown += '\n\n';
    });
  }

  markdown += `---\n\n`;
  markdown += `**Not seeing your area?** [Upgrade to Premium] for ZIP group-specific daily deals.\n\n`;
  markdown += `**Want to unsubscribe?** [Manage preferences]\n`;

  return markdown;
}

/**
 * Generate weekly summary newsletter (for free tier)
 */
export function generateWeeklySummaryMarkdown(
  allDeals: Deal[],
  date: Date = new Date()
): string {
  // Get top deals across all ZIP groups
  const topDeals = allDeals
    .sort((a, b) => b.value_score - a.value_score)
    .slice(0, 15);

  if (topDeals.length === 0) {
    return `# Deals of the Week\n\n**${formatDate(date)}**\n\nNo deals found this week. Check back next week!`;
  }

  const byType = groupDealsByType(topDeals);
  let markdown = `# Deals of the Week\n\n`;
  markdown += `**Week of ${formatDate(date)}**\n\n`;
  markdown += `Here are the best dispensary deals across Michigan this week, ranked by THC-per-dollar value.\n\n`;
  markdown += `---\n\n`;

  const typeOrder = ['flower', 'cart', 'edible', 'concentrate', 'topical', 'other'];

  for (const type of typeOrder) {
    if (!byType[type] || byType[type].length === 0) continue;

    const typeDeals = byType[type].slice(0, 5); // Top 5 per type for weekly
    const emoji = getProductTypeEmoji(type);
    const typeName = capitalizeProductType(type);

    markdown += `## ${emoji} ${typeName}\n\n`;

    typeDeals.forEach((deal, idx) => {
      markdown += formatDealMarkdown(deal, idx + 1);
      markdown += '\n\n';
    });
  }

  markdown += `---\n\n`;
  markdown += `💎 Want daily personalized deals? [Upgrade to Premium for $7/month]\n\n`;
  markdown += `**Want to unsubscribe?** [Manage preferences]\n`;

  return markdown;
}

