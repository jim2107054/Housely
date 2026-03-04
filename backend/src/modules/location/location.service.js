import prisma from '../../config/prisma.js';

// ─── Reverse Geocode (OpenStreetMap Nominatim) ───

export const reverseGeocode = async (latitude, longitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Housely/1.0' },
  });

  if (!response.ok) {
    throw Object.assign(new Error('Geocoding service unavailable'), { statusCode: 503 });
  }

  const data = await response.json();

  return {
    displayName: data.display_name,
    address: data.address?.road || data.display_name,
    city: data.address?.city || data.address?.town || data.address?.village,
    area: data.address?.suburb || data.address?.neighbourhood,
    street: data.address?.road,
    country: data.address?.country,
    postcode: data.address?.postcode,
    latitude,
    longitude,
  };
};

// ─── Get Saved Locations ───

export const getSavedLocations = async (userId) => {
  return prisma.savedLocation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

// ─── Save Location ───

export const saveLocation = async (userId, data) => {
  return prisma.savedLocation.create({
    data: { userId, ...data },
  });
};

// ─── Delete Saved Location ───

export const deleteLocation = async (userId, locationId) => {
  const location = await prisma.savedLocation.findFirst({
    where: { id: locationId, userId },
  });

  if (!location) {
    throw Object.assign(new Error('Location not found'), { statusCode: 404 });
  }

  await prisma.savedLocation.delete({ where: { id: locationId } });

  return { message: 'Location deleted' };
};
