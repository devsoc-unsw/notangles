export interface Location {
  lat: number;
  long: number;
}
const EARTH_RADIUS_METERS = 6371000;

export function toLocalXY(
  origin: Location,
  point: Location,
): { x: number; y: number } {
  const latRad = (origin.lat * Math.PI) / 180;

  const x =
    ((EARTH_RADIUS_METERS * ((point.long - origin.long) * Math.PI)) / 180) *
    Math.cos(latRad);

  const y = (EARTH_RADIUS_METERS * ((point.lat - origin.lat) * Math.PI)) / 180;

  return { x, y };
}

export function pointToSegmentDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLenSq = abx * abx + aby * aby;

  let t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq;

  t = Math.max(0, Math.min(1, t));

  const closestX = a.x + t * abx;
  const closestY = a.y + t * aby;

  const dx = p.x - closestX;
  const dy = p.y - closestY;

  return Math.sqrt(dx * dx + dy * dy);
}
