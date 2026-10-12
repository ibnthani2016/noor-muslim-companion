// Kaaba coordinates in Makkah, Saudi Arabia
export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

/**
 * Calculates the forward azimuth bearing from any geographic coordinates to the Holy Kaaba.
 * Uses the spherical great-circle formula.
 * @returns Heading angle in degrees (0° - 360°, where 0° is True North)
 */
export function calculateQiblaDirection(userLat: number, userLng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const phi1 = toRad(userLat);
  const phi2 = toRad(KAABA_COORDS.latitude);
  const deltaLambda = toRad(KAABA_COORDS.longitude - userLng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return Math.round(bearing * 10) / 10;
}

export const calculateQiblaBearing = calculateQiblaDirection;

/**
 * Calculates distance to Makkah in kilometers using the Haversine formula.
 */
export function calculateDistanceToKaaba(userLat: number, userLng: number): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(KAABA_COORDS.latitude - userLat);
  const dLng = toRad(KAABA_COORDS.longitude - userLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(userLat)) *
      Math.cos(toRad(KAABA_COORDS.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Returns cardinal or ordinal direction text for a given bearing angle
 */
export function getDirectionName(bearing: number): string {
  const directions = [
    "North", "NNE", "NE", "ENE",
    "East", "ESE", "SE", "SSE",
    "South", "SSW", "SW", "WSW",
    "West", "WNW", "NW", "NNW"
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}
