let googleMapsPromise = null;

const loadGoogleMaps = () => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!API_KEY || API_KEY === 'your_google_maps_api_key_here') {
    return Promise.reject(new Error('API_KEY_MISSING'));
  }

  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('UNKNOWN_ERROR'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export const geocodeLocation = async (locationText) => {
  await loadGoogleMaps();
  
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: locationText }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else if (status === 'ZERO_RESULTS') {
        reject(new Error('ZERO_RESULTS'));
      } else {
        reject(new Error(status));
      }
    });
  });
};

export const fetchNearbyClinics = async ({ lat, lng }) => {
  await loadGoogleMaps();

  return new Promise((resolve, reject) => {
    const dummyElement = document.createElement('div');
    const service = new window.google.maps.places.PlacesService(dummyElement);
    
    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 10000,
      keyword: 'hospital clinic health centre medical',
      type: 'hospital'
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        
        // Remove duplicates by place_id
        const uniquePlaces = [];
        const seen = new Set();
        results.forEach(place => {
          if (!seen.has(place.place_id)) {
            seen.add(place.place_id);
            uniquePlaces.push(place);
          }
        });

        const normalized = uniquePlaces.map(place => {
          const mapLink = `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}&query_place_id=${place.place_id}`;
          
          return {
            id: place.place_id,
            name: place.name || 'Unknown Facility',
            county: 'API Result',
            type: (place.types && place.types.length > 0) ? place.types[0].replace(/_/g, ' ') : 'Healthcare Facility',
            location: place.vicinity || 'Address not available',
            phone: '', // Google JS Nearby API doesn't provide phone without extra detail requests
            services: 'General healthcare',
            openingHours: place.opening_hours?.isOpen() ? 'Open Now' : (place.opening_hours ? 'Closed' : 'Hours not available'),
            rating: place.rating || null,
            mapLink: mapLink,
            isApiResult: true,
            source: 'Google Places'
          };
        });

        resolve(normalized);
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]); // Empty array instead of reject for ZERO_RESULTS
      } else {
        reject(new Error(status));
      }
    });
  });
};

export const getCurrentUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("UNSUPPORTED"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("PERMISSION_DENIED"));
        } else {
          reject(new Error("LOCATION_ERROR"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
