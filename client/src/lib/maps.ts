declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let isGoogleMapsLoaded = false;
let googleMapsPromise: Promise<void> | null = null;

export function initializeGoogleMaps(): Promise<void> {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      isGoogleMapsLoaded = true;
      resolve();
      return;
    }

    // Create callback function
    window.initMap = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        let message = 'Error getting location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  await initializeGoogleMaps();
  
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
      if (status === 'OK' && results && results.length > 0) {
        resolve(results[0].formatted_address);
      } else {
        reject(new Error('Geocoding failed: ' + status));
      }
    });
  });
}

export async function createMap(
  containerId: string, 
  center: { lat: number; lng: number },
  zoom: number = 15
): Promise<any> {
  await initializeGoogleMaps();
  
  const mapOptions = {
    zoom,
    center,
    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'cooperative'
  };

  const map = new window.google.maps.Map(
    document.getElementById(containerId), 
    mapOptions
  );

  // Add marker at center
  new window.google.maps.Marker({
    position: center,
    map,
    title: 'Issue Location'
  });

  return map;
}
