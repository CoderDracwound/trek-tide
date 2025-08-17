interface MapImageProps {
  locations: string[];
  day: number;
  className?: string;
}

export default function MapImage({ locations, day, className }: MapImageProps) {
  // For now, we'll use a static map service or generate a placeholder
  // In a real implementation, you'd integrate with Google Maps Static API, Mapbox, etc.
  
  const generateMapUrl = (locations: string[]) => {
    // Using a placeholder map service - replace with actual map API
    const encodedLocations = locations.map(loc => encodeURIComponent(loc)).join('|');
    return `https://via.placeholder.com/400x200/e5e7eb/6b7280?text=Day+${day}+Map`;
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={generateMapUrl(locations)}
        alt={`Day ${day} locations map`}
        className="w-full h-48 object-cover rounded-lg border-2 border-border neo-shadow"
      />
      <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs">
        📍 {locations.length} locations
      </div>
    </div>
  );
}