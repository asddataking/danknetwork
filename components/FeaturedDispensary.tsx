'use client';

interface FeaturedDispensaryProps {
  name?: string;
  location?: string;
  hours?: string;
  description?: string;
  features?: string[];
  imageUrl?: string;
}

export default function FeaturedDispensary({
  name = 'Bowdega Cannabis',
  location = 'Utica, MI',
  hours = '8AM - 12AM Daily',
  description = 'Utica\'s premier cannabis dispensary featuring a wide selection of premium products including flower, pre-rolls, edibles, concentrates, and more. Adjacent to the Burn1 consumption lounge for a unique cannabis experience.',
  features = [
    'Premium Products',
    'Burn1 Lounge',
    'Community Focused',
  ],
  imageUrl,
}: FeaturedDispensaryProps) {
  return (
    <div className="bg-dark-surface rounded-lg border-2 border-neon-green/30 p-8 md:p-10 mb-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold uppercase">
          ⭐ Verified Partner
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content */}
        <div>
          <h2 className="text-neon-green font-black text-3xl md:text-4xl mb-4 uppercase">
            {name}
          </h2>
          <p className="text-white text-lg mb-6 leading-relaxed">
            {description}
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <span className="text-gray-400 text-sm uppercase font-semibold">Location</span>
              <p className="text-white font-semibold">{location}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm uppercase font-semibold">Hours</span>
              <p className="text-white font-semibold">{hours}</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <span className="text-white text-sm font-semibold">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neon-green text-black px-6 py-3 font-bold rounded-lg hover:bg-neon-green-dark transition-colors duration-200 text-center uppercase"
            >
              Visit Dispensary
            </a>
            <a
              href="https://michiganmunchiemap.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 py-3 font-bold rounded-lg hover:bg-white/10 transition-colors duration-200 text-center uppercase"
            >
              View on Map
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🌿</span>
                <p className="text-gray-500 text-sm">{name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

