import { ACK_SLA_SECONDS } from './constants.js';

export const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const fmtDateTime = (ts) =>
  new Date(ts).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export function fmtDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '—';
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

// Deterministic timer rule: before acknowledgement, compare elapsed time with the urgency SLA.
export function slaState(incident, now) {
  if (['Acknowledged', 'Resolved'].includes(incident.status)) return null;
  const limit = (ACK_SLA_SECONDS[incident.urgency] || ACK_SLA_SECONDS.Medium) * 1000;
  const elapsed = now - incident.createdAt;
  return { elapsed, limit, overdue: elapsed > limit };
}

export const eventTime = (incident, type) => incident.timeline.find((e) => e.type === type)?.t ?? null;
