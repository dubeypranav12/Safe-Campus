import { analyze, ev, reportingAgent } from './agents.js';
import { STATUSES, responderById } from './constants.js';

const MIN = 60000;

function make({ n, minsAgo, text, locationId, modality = ['text'], panic = false, status, resolutionNote }) {
  const created = Date.now() - minsAgo * MIN;
  const base = {
    id: `INC-${n}`,
    createdAt: created,
    reporter: 'Student (sample)',
    text,
    modality,
    panic,
    locationId,
    locationSource: 'selected',
    photoName: null,
    sample: true,
    mine: false,
    answers: {},
  };
  const a = analyze(base);
  const idx = STATUSES.indexOf(status);
  const timeline = [
    ev('Reporter', 'report', `Report submitted by ${modality.join(' + ')}`, created),
    ev('System', 'alert', 'Urgent alert dispatched to Security Control Desk (sent before any AI check)', created + 1000),
    ev('Intake Agent', 'agent', `Structured report: "${a.intake.summary}"`, created + 5000),
    ev('Assessment Agent', 'agent', `Suggested ${a.assessment.category} / ${a.assessment.urgency} (confidence ${a.assessment.confidence})`, created + 9000),
    ev('Coordination Agent', 'agent', 'Recommended responders and drafted notification', created + 14000),
    ev('Guidance Agent', 'agent', `Retrieved protocol: ${a.guidance.title}`, created + 18000),
  ];
  if (idx >= 2) timeline.push(ev('Administrator', 'assigned', `Approved assignment to ${responderById(a.coordination.recommended[0]).name}. Notification sent (simulated)`, created + 70000));
  if (idx >= 3) timeline.push(ev('Responder', 'acknowledged', 'Responder acknowledged and is on the way', created + 125000));
  if (idx >= 4) timeline.push(ev('Responder', 'resolved', resolutionNote, created + 14 * MIN));

  a.assessment.questions.forEach((q) => { base.answers[q] = 'Answered by reporter (sample data)'; });

  const inc = {
    ...base,
    status,
    category: a.assessment.category,
    urgency: a.assessment.urgency,
    needsReview: false,
    assignedTo: idx >= 2 ? a.coordination.recommended[0] : null,
    resolutionNote: idx >= 4 ? resolutionNote : null,
    agents: { intake: a.intake, assessment: a.assessment, coordination: a.coordination, guidance: a.guidance },
    agentsDone: { intake: true, assessment: true, coordination: true, guidance: true, reporting: idx >= 4 },
    timeline,
  };
  if (idx >= 4) inc.report = reportingAgent(inc);
  return inc;
}

export function seedIncidents() {
  return [
    make({ n: 1041, minsAgo: 3, locationId: 'library', status: 'Assigned', modality: ['text', 'voice'],
      text: 'A student has collapsed near the study tables and seems unconscious. Friends are with them.' }),
    make({ n: 1040, minsAgo: 6, locationId: 'lab', status: 'Assessed',
      text: 'Smoke smell and the fire alarm is going off in the corridor near the server room.' }),
    make({ n: 1039, minsAgo: 11, locationId: 'hostel', status: 'Acknowledged',
      text: 'An unknown person is trying door handles on the ground floor rooms. Looks suspicious.' }),
    make({ n: 1038, minsAgo: 19, locationId: 'cafeteria', status: 'Assessed',
      text: 'Water is leaking from the ceiling and the floor near the counter is slippery.' }),
    make({ n: 1037, minsAgo: 48, locationId: 'gate', status: 'Resolved', modality: ['text', 'photo'],
      text: 'A student twisted their ankle and fell near the main gate. Cannot walk.',
      resolutionNote: 'Student examined at the medical room and sent home with a first-aid advice sheet.' }),
  ];
}
