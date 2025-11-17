import { notFound } from 'next/navigation';
import { PlacesService } from '@/lib/supabase';
import PlaceDetail from '@/components/places/PlaceDetail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PlacePageProps {
  params: {
    slug: string;
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const place = await PlacesService.getPlaceBySlug(params.slug);

  if (!place) {
    notFound();
  }

  return <PlaceDetail place={place} />;
}

