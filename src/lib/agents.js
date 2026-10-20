// Browser-side agents. Assessment can be replaced by the deployed ML result;
// these deterministic rules also keep the complete flow available offline.
import { RESPONDER_RANK, locationById, responderById } from './constants.js';
import { fmtDuration, fmtTime, eventTime } from './format.js';

const KEYWORDS = {
  Medical: ['collapse', 'faint', 'unconscious', 'bleeding', 'injur', 'chest pain', 'breathing', 'seizure', 'accident', 'hurt', 'medical', 'ambulance', 'allergic', 'vomit', 'fell', 'ankle', 'dizzy'],
  'Fire alarm': ['fire', 'smoke', 'burning', 'alarm', 'flame', 'sparks', 'short circuit'],
  Hazard: ['leak', 'gas', 'chemical', 'spill', 'broken', 'slippery', 'flood', 'hazard', 'fallen', 'exposed wire', 'electric'],
  Security: ['theft', 'stolen', 'fight', 'harass', 'threat', 'stalk', 'intruder', 'suspicious', 'weapon', 'attack', 'unknown person'],
};

const URGENT_WORDS = ['unconscious', 'not breathing', 'collapse', 'bleeding', 'seizure', 'fire', 'smoke', 'gas', 'weapon', 'attack', 'chest pain', 'trapped'];

const BASE_URGENCY = { Medical: 'High', 'Fire alarm': 'High', Security: 'Medium', Hazard: 'Low', Other: 'Low' };

const PROTOCOLS = {
  Medical: {
    title: 'Medical emergency (sample protocol)',
    steps: [
      'Stay with the person and keep them calm. Do not leave them alone.',
      'Do not move them unless they are in immediate danger.',
      'Do not give food, drink or medicine.',
      'Send someone to the nearest entrance to guide responders in.',
      'Tell responders what you saw and when it started.',
    ],
  },
  'Fire alarm': {
    title: 'Fire or smoke (sample protocol)',
    steps: [
      'Leave the area by the nearest safe exit. Use stairs, not lifts.',
      'Do not go back for belongings.',
      'Warn people nearby on your way out.',
      'Gather at the nearest assembly point and wait for a head count.',
      'Emergency services are contacted only through the authorized campus procedure.',
    ],
  },
  Hazard: {
    title: 'Physical hazard (sample protocol)',
    steps: [
      'Keep away from the hazard and stop others from approaching it.',
      'If safe, block off the area or place a warning sign.',
      'Do not touch spills, wires or leaks.',
      'Stay nearby (at a safe distance) to point the responder to it.',
    ],
  },
  Security: {
    title: 'Security concern (sample protocol)',
    steps: [
      'Move to a well-lit place with other people.',
      'Do not confront anyone.',
      'Note what you saw: description, direction, time.',
      'Stay reachable so the responder can ask follow-up questions.',
    ],
  },
  Other: {
    title: 'General incident (sample protocol)',
    steps: [
      'Stay where it is safe and keep your phone on.',
      'A human responder will review this report.',
      'Answer any follow-up questions you receive.',
    ],
  },
};

const lc = (s) => (s || '').toLowerCase();
const matched = (text, words) => words.filter((w) => text.includes(w));

export function intakeAgent(inc) {
  const text = (inc.text || '').trim();
  const first = text.match(/^[^.!?]*[.!?]?/)?.[0]?.trim() || text;
  const summary = first ? (first.length > 140 ? `${first.slice(0, 137)}…` : first) : 'Panic button pressed (no description)';
  const loc = locationById(inc.locationId);
  return {
    summary,
    location: loc ? loc.name : 'Unknown',
    locationSource: inc.locationSource || 'unknown',
    modality: inc.modality || ['text'],
    wordCount: text ? text.split(/\s+/).length : 0,
  };
}

export function assessmentAgent(inc) {
  const text = lc(inc.text);
  const scores = Object.entries(KEYWORDS)
    .map(([cat, words]) => ({ cat, hits: matched(text, words) }))
    .sort((a, b) => b.hits.length - a.hits.length);
  const top = scores[0];
  let category = top.cat;
  let confidence;
  let signals = top.hits;
  if (top.hits.length === 0) {
    category = 'Other';
    confidence = inc.panic ? 0.5 : 0.35;
    signals = [];
  } else {
    confidence = Math.min(0.95, 0.55 + 0.15 * top.hits.length);
    if (scores[1].hits.length === top.hits.length) confidence -= 0.2;
  }
  confidence = Math.round(confidence * 100) / 100;

  const urgentHits = matched(text, URGENT_WORDS);
  const urgency = inc.panic || urgentHits.length ? 'Urgent' : BASE_URGENCY[category];

  const questions = assessmentQuestions(inc, category);

  const uncertain = confidence < 0.6;
  return {
    category,
    urgency,
    confidence,
    uncertain,
    signals,
    questions,
    rationale: signals.length
      ? `Matched ${signals.length} signal(s): ${signals.join(', ')}.`
      : 'No clear category signals found in the report.',
  };
}

export function assessmentQuestions(inc, category) {
  const text = lc(inc.text);
  const questions = [];
  if (!inc.locationId) questions.push('Exact location (building / floor)?');
  if (category === 'Medical') questions.push('Is the person conscious and breathing?');
  if (category === 'Fire alarm') questions.push('Is anyone still inside the affected area?');
  if (category === 'Security') questions.push('Is anyone in immediate danger?');
  if (category === 'Hazard') questions.push('Is the area blocked or cordoned off?');
  if (text.length < 25 && !inc.panic) questions.push('Can you add a few more details about what happened?');
  return questions;
}

export function coordinationAgent(inc, assessment) {
  const loc = locationById(inc.locationId);
  const recommended = (RESPONDER_RANK[assessment.category] || RESPONDER_RANK.Other).slice(0, 2);
  const summary = inc.agents?.intake?.summary || intakeAgent(inc).summary;
  const notification = `${assessment.urgency.toUpperCase()} · ${assessment.category} at ${loc ? loc.name : 'location pending'}: ${summary} Please acknowledge in the SafeCampus dashboard.`;
  return { recommended, notification, needsHumanApproval: true };
}

export function guidanceAgent(category) {
  return { ...(PROTOCOLS[category] || PROTOCOLS.Other), source: 'Sample protocol store (a real deployment uses campus-approved protocols)' };
}

export function reportingAgent(inc) {
  const lines = [];
  const loc = locationById(inc.locationId);
  const ack = eventTime(inc, 'acknowledged');
  const done = eventTime(inc, 'resolved');
  lines.push(`SAFECAMPUS INCIDENT REPORT: ${inc.id}`);
  lines.push('Prototype output (simulated, template-based).');
  lines.push('');
  lines.push(`Category:  ${inc.category}`);
  lines.push(`Urgency:   ${inc.urgency}`);
  lines.push(`Location:  ${loc ? loc.name : 'Unknown'}`);
  lines.push(`Reported:  ${fmtTime(inc.createdAt)} via ${(inc.modality || []).join(', ')}`);
  lines.push(`Assigned:  ${inc.assignedTo ? responderById(inc.assignedTo)?.name : '—'}`);
  lines.push('');
  lines.push('Summary:');
  lines.push(`  ${inc.agents?.intake?.summary || inc.text}`);
  lines.push('');
  lines.push('Timeline:');
  inc.timeline.forEach((e) => lines.push(`  [${fmtTime(e.t)}] ${e.actor}: ${e.text}`));
  lines.push('');
  lines.push('Response times:');
  lines.push(`  Report to acknowledgement: ${ack ? fmtDuration(ack - inc.createdAt) : '—'}`);
  lines.push(`  Report to resolution:      ${done ? fmtDuration(done - inc.createdAt) : '—'}`);
  if (inc.resolutionNote) {
    lines.push('');
    lines.push(`Resolution note: ${inc.resolutionNote}`);
  }
  return lines.join('\n');
}

// Runs the first four agents in order against a plain incident object (used for seed data and tests).
export function analyze(inc) {
  const intake = intakeAgent(inc);
  const assessment = assessmentAgent(inc);
  const withIntake = { ...inc, agents: { intake } };
  const coordination = coordinationAgent(withIntake, assessment);
  const guidance = guidanceAgent(assessment.category);
  return { intake, assessment, coordination, guidance };
}

export const ev = (actor, type, text, t = Date.now()) => ({ t, actor, type, text });
