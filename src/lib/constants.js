export const STATUSES = ['Reported', 'Assessed', 'Assigned', 'Acknowledged', 'Resolved'];
export const URGENCIES = ['Urgent', 'High', 'Medium', 'Low'];
export const CATEGORIES = ['Medical', 'Fire alarm', 'Hazard', 'Security', 'Other'];
export const ROLES = ['Student', 'Responder', 'Administrator'];

// Deterministic rule: seconds allowed before an unacknowledged incident is flagged "ack overdue".
export const ACK_SLA_SECONDS = { Urgent: 120, High: 300, Medium: 600, Low: 900 };

// Sample campus layout (SVG units, viewBox 0 0 100 70). All names are placeholders for the prototype.
export const LOCATIONS = [
  { id: 'library', name: 'Central Library', x: 24, y: 18 },
  { id: 'hostel', name: 'Hostel Block B', x: 76, y: 16 },
  { id: 'cafeteria', name: 'Cafeteria', x: 26, y: 42 },
  { id: 'lab', name: 'Computer Lab Block', x: 62, y: 38 },
  { id: 'ground', name: 'Sports Ground', x: 84, y: 54 },
  { id: 'gate', name: 'Main Gate', x: 50, y: 62 },
];

// Sample responders (placeholders, not real people or services).
export const RESPONDERS = [
  { id: 'sec', name: 'Security Control Desk', role: 'Security' },
  { id: 'med', name: 'Campus Medical Room', role: 'Medical' },
  { id: 'fire', name: 'Fire & Safety Officer', role: 'Fire safety' },
  { id: 'ward', name: 'Hostel Warden on Duty', role: 'Administration' },
  { id: 'maint', name: 'Maintenance Team', role: 'Facilities' },
];

// Responder routing rules (deterministic, not LLM): ranked list per category.
export const RESPONDER_RANK = {
  Medical: ['med', 'ward', 'sec'],
  'Fire alarm': ['fire', 'sec', 'ward'],
  Hazard: ['maint', 'fire', 'sec'],
  Security: ['sec', 'ward'],
  Other: ['sec', 'ward', 'maint'],
};

// Role-based access rules (deterministic).
export const PERMISSIONS = {
  Student: { details: false, agents: false, approve: false, acknowledge: false, resolve: false, review: false },
  Responder: { details: true, agents: true, approve: true, acknowledge: true, resolve: true, review: true },
  Administrator: { details: true, agents: true, approve: true, acknowledge: false, resolve: true, review: true },
};

export const AGENT_NAMES = {
  intake: 'Intake Agent',
  assessment: 'Assessment Agent',
  coordination: 'Coordination Agent',
  guidance: 'Guidance Agent',
  reporting: 'Reporting Agent',
};

export const responderById = (id) => RESPONDERS.find((r) => r.id === id);
export const locationById = (id) => LOCATIONS.find((l) => l.id === id);

// Incident state machine: a status can only move one step forward.
export const canTransition = (from, to) => STATUSES.indexOf(to) === STATUSES.indexOf(from) + 1;
