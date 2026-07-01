import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

async function testGeocode() {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=Nairobi&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("GEOCODE RESULT:", JSON.stringify(data).substring(0, 200));
  } catch (e) {
    console.log("GEOCODE ERROR:", e.message);
  }
}

async function testPlaces() {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.regularOpeningHours,places.nationalPhoneNumber,places.primaryType'
  };
  const body = JSON.stringify({
    includedTypes: ["hospital", "medical_clinic"],
    maxResultCount: 15,
    locationRestriction: {
      circle: {
        center: { latitude: -1.2921, longitude: 36.8219 }, // Nairobi
        radius: 10000.0
      }
    }
  });

  try {
    const res = await fetch(url, { method: 'POST', headers, body });
    if (!res.ok) {
      console.log("PLACES ERROR STATUS:", res.status);
      console.log("PLACES ERROR BODY:", await res.text());
    } else {
      const data = await res.json();
      console.log("PLACES SUCCESS. Results:", data.places ? data.places.length : 0);
    }
  } catch (e) {
    console.log("PLACES FETCH ERROR:", e.message);
  }
}

async function run() {
  await testGeocode();
  await testPlaces();
}
run();
