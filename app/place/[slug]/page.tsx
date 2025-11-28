import { notFound } from 'next/navigation';
import { PlacesService } from '@/lib/supabase';
import PlaceDetail from '@/components/places/PlaceDetail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PlacePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await PlacesService.getPlaceBySlug(slug);

  if (!place) {
    return {
      title: 'Place Not Found | Dank Network',
    };
  }

  return {
    title: `${place.name} | Dank Network`,
    description: place.address 
      ? `${place.name} - ${place.address}${place.city ? `, ${place.city}` : ''}${place.state ? `, ${place.state}` : ''}`
      : `${place.name} on Dank Network`,
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  
  console.log('[PlacePage] Fetching place with slug:', slug);
  console.log('[PlacePage] Environment check:', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!(process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
  
  try {
    const place = await PlacesService.getPlaceBySlug(slug);

    if (!place) {
      console.warn('[PlacePage] Place not found for slug:', slug);
      notFound();
    }

    console.log('[PlacePage] Place found:', { id: place.id, name: place.name, slug: place.slug });

    return <PlaceDetail place={place} />;
  } catch (error) {
    console.error('[PlacePage] Error fetching place:', error);
    console.error('[PlacePage] Error details:', error instanceof Error ? error.message : String(error));
    notFound();
  }
}

