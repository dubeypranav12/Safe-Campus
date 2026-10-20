import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { seedIncidents } from '../lib/seed.js';
import {
  analyze, coordinationAgent, guidanceAgent, intakeAgent, reportingAgent, ev,
} from '../lib/agents.js';
import { AGENT_NAMES, PERMISSIONS, canTransition, locationById, responderById } from '../lib/constants.js';
import { requestMlAssessment } from '../lib/ml.js';

const STORAGE_KEY = 'safecampus.prototype.v1';
const PIPELINE = ['intake', 'assessment', 'coordination', 'guidance'];
const STEP_DELAY = 1100;

const init = () => ({ role: 'Student', incidents: seedIncidents() });

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.incidents)) return parsed;
    }
  } catch (e) { /* ignore corrupt storage */ }
  return init();
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, incidents: [action.incident, ...state.incidents] };
    case 'UPDATE':
      return { ...state, incidents: state.incidents.map((i) => (i.id === action.id ? action.fn(i) : i)) };
    case 'ROLE':
      return { ...state, role: action.role };
    case 'RESET':
      return { ...init(), role: state.role };
    default:
      return state;
  }
}

const Ctx = createContext(null);
export const useIncidents = () => useContext(Ctx);

export function IncidentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }, [state]);

  const update = useCallback((id, fn) => dispatch({ type: 'UPDATE', id, fn }), []);

  // ---- Orchestrator: runs one agent step against the shared incident record -------------------
  const runStep = useCallback(async (id, agent) => {
    if (agent === 'assessment') {
      const current = stateRef.current.incidents.find((inc) => inc.id === id);
      if (!current || current.agentsDone?.assessment) return;

      const assessment = await requestMlAssessment(current);
      update(id, (inc) => {
        if (inc.agentsDone?.assessment) return inc;
        const timeline = [
          ...inc.timeline,
          ev(
            AGENT_NAMES.assessment,
            'agent',
            `${assessment.source} suggested ${assessment.category} / ${assessment.urgency} (confidence ${assessment.confidence})`,
          ),
        ];
        if (assessment.uncertain) {
          timeline.push(ev('System', 'escalation', 'Low confidence: escalated to a human reviewer'));
        }
        if (assessment.fallbackReason) {
          timeline.push(ev('System', 'agent', `${assessment.fallbackReason} Continued with local assessment rules.`));
        }
        return {
          ...inc,
          category: assessment.category,
          urgency: assessment.urgency,
          needsReview: assessment.uncertain,
          status: inc.status === 'Reported' ? 'Assessed' : inc.status,
          agents: { ...inc.agents, assessment },
          agentsDone: { ...inc.agentsDone, assessment: true },
          timeline,
        };
      });
      return;
    }

    update(id, (inc) => {
      if (inc.agentsDone?.[agent]) return inc;
      const agents = { ...inc.agents };
      const done = { ...inc.agentsDone, [agent]: true };
      const events = [];

      if (agent === 'intake') {
        const o = intakeAgent(inc);
        agents.intake = o;
        events.push(ev(AGENT_NAMES.intake, 'agent', `Structured report: "${o.summary}"`));
      }
      if (agent === 'coordination') {
        const o = coordinationAgent({ ...inc, agents }, agents.assessment);
        agents.coordination = o;
        events.push(ev(AGENT_NAMES.coordination, 'agent', 'Recommended responders and drafted notification (awaiting human approval)'));
      }
      if (agent === 'guidance') {
        const o = guidanceAgent(agents.assessment?.category || inc.category);
        agents.guidance = o;
        events.push(ev(AGENT_NAMES.guidance, 'agent', `Retrieved protocol: ${o.title}`));
      }
      return { ...inc, agents, agentsDone: done, timeline: [...inc.timeline, ...events] };
    });
  }, [update]);

  const schedulePipeline = useCallback(async (id) => {
    for (const agent of PIPELINE) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, STEP_DELAY));
      await runStep(id, agent);
    }
  }, [runStep]);

  // Resume any pipeline interrupted by a page reload.
  useEffect(() => {
    stateRef.current.incidents.filter((i) => i.agentsDone && !i.agentsDone.guidance).forEach((i) => schedulePipeline(i.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Public actions -----------------------------------------------------------------------
  const setRole = useCallback((role) => dispatch({ type: 'ROLE', role }), []);

  const submitReport = useCallback(({ text, locationId, locationSource, modality, panic, photoName }) => {
    const nums = stateRef.current.incidents.map((i) => parseInt(i.id.replace('INC-', ''), 10) || 0);
    const id = `INC-${Math.max(1000, ...nums) + 1}`;
    const t = Date.now();
    const loc = locationById(locationId);
    const incident = {
      id, createdAt: t, reporter: 'Student (you)', text, modality, panic, locationId, locationSource,
      photoName: photoName || null, sample: false, mine: true,
      status: 'Reported', category: 'Pending', urgency: panic ? 'Urgent' : 'Pending', needsReview: false,
      assignedTo: null, answers: {}, agents: {},
      agentsDone: { intake: false, assessment: false, coordination: false, guidance: false, reporting: false },
      timeline: [
        ev('Reporter', 'report', panic ? 'Panic button pressed' : `Report submitted by ${modality.join(' + ')}${loc ? ` from ${loc.name}` : ''}`, t),
        ev('System', 'alert', 'Urgent alert dispatched to Security Control Desk (sent before any AI check)', t + 1),
      ],
    };
    dispatch({ type: 'ADD', incident });
    schedulePipeline(id);
    return id;
  }, [schedulePipeline]);

  const answerQuestion = useCallback((id, question, answer) => {
    if (!answer.trim()) return;
    update(id, (inc) => ({
      ...inc,
      answers: { ...inc.answers, [question]: answer.trim() },
      timeline: [...inc.timeline, ev('Reporter', 'context', `Answered "${question}": ${answer.trim()}`)],
    }));
  }, [update]);

  const humanReview = useCallback((id, { category, urgency }) => {
    update(id, (inc) => {
      const assessment = { ...inc.agents.assessment, category, urgency, uncertain: false, rationale: 'Confirmed by a human reviewer.' };
      const coordination = coordinationAgent({ ...inc, agents: inc.agents }, assessment);
      return {
        ...inc, category, urgency, needsReview: false,
        agents: { ...inc.agents, assessment, coordination, guidance: guidanceAgent(category) },
        timeline: [...inc.timeline, ev(stateRef.current.role, 'review', `Human review: set ${category} / ${urgency}. Routing and guidance refreshed`)],
      };
    });
  }, [update]);

  const approveAssignment = useCallback((id, responderId) => {
    const role = stateRef.current.role;
    if (!PERMISSIONS[role].approve) return;
    update(id, (inc) => {
      if (!canTransition(inc.status, 'Assigned')) return inc;
      const r = responderById(responderId);
      return {
        ...inc, status: 'Assigned', assignedTo: responderId,
        timeline: [...inc.timeline, ev(role, 'assigned', `Approved assignment to ${r?.name}. Notification sent (simulated)`)],
      };
    });
  }, [update]);

  const acknowledge = useCallback((id) => {
    const role = stateRef.current.role;
    if (!PERMISSIONS[role].acknowledge) return;
    update(id, (inc) => {
      if (!canTransition(inc.status, 'Acknowledged')) return inc;
      return { ...inc, status: 'Acknowledged', timeline: [...inc.timeline, ev(role, 'acknowledged', 'Responder acknowledged and is on the way')] };
    });
  }, [update]);

  const addNote = useCallback((id, note) => {
    const role = stateRef.current.role;
    if (!PERMISSIONS[role].details || !note.trim()) return;
    update(id, (inc) => ({ ...inc, timeline: [...inc.timeline, ev(role, 'note', note.trim())] }));
  }, [update]);

  const resolve = useCallback((id, note) => {
    const role = stateRef.current.role;
    if (!PERMISSIONS[role].resolve) return;
    update(id, (inc) => {
      if (!canTransition(inc.status, 'Resolved')) return inc;
      const resolved = {
        ...inc, status: 'Resolved', resolutionNote: note.trim() || 'Resolved on site.',
        timeline: [...inc.timeline, ev(role, 'resolved', note.trim() || 'Marked resolved')],
      };
      const withReporting = {
        ...resolved,
        timeline: [...resolved.timeline, ev(AGENT_NAMES.reporting, 'agent', 'Compiled the timestamped incident report')],
        agentsDone: { ...inc.agentsDone, reporting: true },
      };
      return { ...withReporting, report: reportingAgent(withReporting) };
    });
  }, [update]);

  const resetDemo = useCallback(() => dispatch({ type: 'RESET' }), []);

  const value = useMemo(() => ({
    role: state.role, incidents: state.incidents, setRole, submitReport, answerQuestion, humanReview,
    approveAssignment, acknowledge, addNote, resolve, resetDemo, analyze,
  }), [state, setRole, submitReport, answerQuestion, humanReview, approveAssignment, acknowledge, addNote, resolve, resetDemo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
