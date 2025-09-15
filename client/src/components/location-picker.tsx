import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, RotateCcw } from "lucide-react";
import { initializeGoogleMaps, getCurrentPosition, reverseGeocode } from "@/lib/maps";

interface LocationPickerProps {
  onLocationCapture: (location: { lat: number; lng: number }, address: string) => void;
}

export default function LocationPicker({ onLocationCapture }: LocationPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError("");

    try {
      const position = await getCurrentPosition();
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setLocation(coords);

      // Reverse geocode to get address
      try {
        const resolvedAddress = await reverseGeocode(coords.lat, coords.lng);
        setAddress(resolvedAddress);
        onLocationCapture(coords, resolvedAddress);
      } catch (geocodeError) {
        const fallbackAddress = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
        setAddress(fallbackAddress);
        onLocationCapture(coords, fallbackAddress);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get location");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Google Maps when component mounts
    initializeGoogleMaps();
  }, []);

  return (
    <div className="space-y-4">
      {/* Get Location Button */}
      <Button
        onClick={handleGetLocation}
        disabled={isLoading}
        className="w-full py-4 text-left px-4 shadow-sm"
        data-testid="button-get-location"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <MapPin size={20} />
            )}
          </div>
          <div>
            <p className="font-semibold">
              {isLoading ? "Getting Location..." : location ? "Location Captured" : "Use Current Location"}
            </p>
            <p className="text-primary-foreground/80 text-sm">
              {isLoading ? "Please wait" : location ? "Tap to update" : "Tap to get your exact coordinates"}
            </p>
          </div>
        </div>
      </Button>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Location Display */}
      {location && (
        <Card className="shadow-sm" data-testid="location-display">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mt-1">
                <MapPin size={20} className="text-secondary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Location Captured</h4>
                <p className="text-muted-foreground text-sm" data-testid="coordinates-display">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
                <p className="text-muted-foreground text-sm" data-testid="address-display">
                  {address || "Fetching address..."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetLocation}
                className="p-2"
                data-testid="button-refresh-location"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      {location && (
        <div className="bg-muted rounded-lg h-64 relative shadow-sm" data-testid="map-container">
          <div id="map" className="w-full h-full rounded-lg">
            {/* Placeholder for Google Maps */}
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Map will load here</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
          {/* Map pin indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none">
            <MapPin size={32} className="text-destructive drop-shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
