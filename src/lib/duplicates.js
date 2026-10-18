// Deterministic duplicate check: same place, same category, reported within 15 minutes of each other.
const WINDOW = 15 * 60 * 1000;

export function findDuplicates(incidents) {
  const map = {}; // id -> id of the earlier incident it may duplicate
  incidents.forEach((a) => {
    if (!a.locationId || !a.category || a.category === 'Pending') return;
    incidents.forEach((b) => {
      if (a.id === b.id || b.createdAt >= a.createdAt) return;
      if (a.locationId === b.locationId && a.category === b.category && a.createdAt - b.createdAt < WINDOW) map[a.id] = b.id;
    });
  });
  return map;
}
