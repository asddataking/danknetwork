import zipGroups from '@/data/zip-groups.json';

export interface ZipGroup {
  name: string;
  zips: string[];
  description: string;
}

export function getZipGroup(zip: string): string | null {
  // Normalize ZIP (remove dashes, ensure 5 digits)
  const normalizedZip = zip.replace(/\D/g, '').slice(0, 5);
  
  // Find which group contains this ZIP
  for (const [groupKey, groupData] of Object.entries(zipGroups)) {
    if (groupData.zips.includes(normalizedZip)) {
      return groupKey;
    }
  }
  
  // If not found, return 'other' or null
  return 'other';
}

export function getZipGroupName(zip: string): string {
  const groupKey = getZipGroup(zip);
  if (!groupKey || !zipGroups[groupKey as keyof typeof zipGroups]) {
    return 'Michigan';
  }
  return zipGroups[groupKey as keyof typeof zipGroups].name;
}

export function getAllZipGroups(): string[] {
  return Object.keys(zipGroups);
}

export function getZipsInGroup(groupKey: string): string[] {
  return zipGroups[groupKey as keyof typeof zipGroups]?.zips || [];
}

export function getZipGroupData(groupKey: string): ZipGroup | null {
  return zipGroups[groupKey as keyof typeof zipGroups] || null;
}

