// Content taken from the SafeCampus JAI 2026 pitch deck.

export const TEAM = {
  name: 'The Ultimate Descenders',
  college: 'Ajay Kumar Garg Engineering College, Ghaziabad',
  email: 'dubeypranav18525@gmail.com',
  members: ['Pranav Dubey (Team Leader)', 'Sneha Mishra', 'Varnika Sharma', 'Prateek Yadav', 'Devendra Kumar'],
};

export const USER_GROUPS = [
  { name: 'Students', text: 'Report an incident in seconds by text, voice, photo or panic button.' },
  { name: 'Security staff', text: 'See every incoming report on one live dashboard.' },
  { name: 'Medical responders', text: 'Get exact location and context before they arrive.' },
  { name: 'Administrators', text: 'Approve assignments and review the full audit trail.' },
];

export const INFO_TODAY = ['Phone calls', 'Group chats', 'CCTV and security logs', 'No single live picture'];

export const WORKFLOW = [
  { key: 'Report', desc: 'Text, voice, photo, panic', to: '/report' },
  { key: 'Assess', desc: 'Category, urgency, gaps', to: '/architecture' },
  { key: 'Coordinate', desc: 'Suggest responders', to: '/architecture' },
  { key: 'Respond', desc: 'Approved guidance', to: '/dashboard' },
  { key: 'Resolve', desc: 'Status tracked', to: '/dashboard' },
  { key: 'Review', desc: 'Timeline and report', to: '/impact' },
];

export const JOURNEY = [
  { role: 'Student', title: 'Reports', short: 'Text, voice, photo or panic button',
    detail: 'The student sends a report in whichever way is fastest. The urgent alert goes out first, before any AI check runs.', to: '/report', cta: 'Try reporting an incident' },
  { role: 'System', title: 'Asks for context', short: 'Requests location and missing details',
    detail: 'Clarifying questions run alongside the alert. They never delay it. Answers are added to the shared incident record.', to: '/dashboard', cta: 'Open an incident to see questions' },
  { role: 'Responder', title: 'Acknowledges', short: 'Authorized responder confirms assignment',
    detail: 'A human approves the suggested assignment and the responder acknowledges it. Unacknowledged incidents are flagged by a timer.', to: '/dashboard', cta: 'See acknowledgement tracking' },
  { role: 'Responder', title: 'Handles', short: 'Updates status and notes on the dashboard',
    detail: 'The responder adds notes and status updates. Every role sees the same live status.', to: '/dashboard', cta: 'Open the live dashboard' },
  { role: 'Responder', title: 'Closes', short: 'Marks resolved; report is compiled',
    detail: 'Resolving the incident triggers the Reporting Agent, which compiles a timestamped report from the timeline.', to: '/dashboard', cta: 'View a resolved incident' },
];

export const AGENTS = [
  { key: 'intake', name: 'Intake', does: 'Structures text, voice and image reports', tools: ['Speech-to-text', 'Image input'],
    sim: 'Extracts a summary, location and input type from the report.' },
  { key: 'assessment', name: 'Assessment', does: 'Suggests category and urgency; flags uncertainty', tools: ['SafeCampus ML API'],
    sim: 'Uses the deployed ML service, with local keyword rules as a resilient fallback. Low confidence escalates to a human.' },
  { key: 'coordination', name: 'Coordination', does: 'Recommends responders; drafts notifications', tools: ['Maps', 'Notification service'],
    sim: 'Ranked responder rules per category. Notification is drafted, then sent only after human approval (simulated send).' },
  { key: 'guidance', name: 'Guidance', does: 'Retrieves campus-approved instructions', tools: ['Protocol store'],
    sim: 'Looks up a small sample protocol set for the category.' },
  { key: 'reporting', name: 'Reporting', does: 'Builds a timestamped timeline and report', tools: ['Shared incident database'],
    sim: 'Template-based report generated when an incident is resolved.' },
];

export const WHY_MULTI = [
  { title: 'Separate skills', text: 'Each task needs different tools and prompts, so each agent stays focused.' },
  { title: 'Parallel work', text: 'Assessment, guidance and routing can run at the same time.' },
  { title: 'Clear audit trail', text: 'Every agent leaves its own timestamped entry in the incident record.' },
];

export const LLM_HANDLES = [
  'Reading text, voice and image reports',
  'Drafting structured fields',
  'Suggesting category and urgency',
  'Flagging uncertainty',
  'Summarizing the timeline',
];
export const DETERMINISTIC_HANDLES = [
  'Incident state machine',
  'Role-based access',
  'Responder routing rules',
  'Alert dispatch and timers',
  'Audit log',
];

export const STACK = [
  { layer: 'Frontend', proposed: 'React: reports and dashboard', here: 'This React prototype (Vite + React Router)' },
  { layer: 'Backend API', proposed: 'FastAPI or Node.js', here: 'SafeCampus FastAPI ML service connected for assessment.' },
  { layer: 'Database', proposed: 'PostgreSQL / Supabase + real-time updates', here: 'Browser localStorage (one shared incident record)' },
  { layer: 'AI', proposed: 'LLM with structured tool calling', here: 'TF-IDF + Logistic Regression ML assessment, with local fallback' },
  { layer: 'Speech', proposed: 'Speech-to-text', here: 'Browser speech API if available, otherwise simulated' },
  { layer: 'Maps', proposed: 'Map service', here: 'Schematic sample campus map' },
];

export const FEATURES = [
  { title: 'Multimodal reporting', text: 'Text, voice and photo in one form.', to: '/report' },
  { title: 'Panic button', text: 'One tap sends an urgent alert first.', to: '/report' },
  { title: 'Location capture', text: 'Pick on the map or capture location.', to: '/report' },
  { title: 'Campus map', text: 'See active incidents where they happen.', to: '/map' },
  { title: 'Live incident dashboard', text: 'One status for every role.', to: '/dashboard' },
  { title: 'Responder assignment', text: 'Suggested by agents, approved by a human.', to: '/dashboard' },
  { title: 'Acknowledgement tracking', text: 'Timers flag unacknowledged incidents.', to: '/dashboard' },
  { title: 'Incident timeline', text: 'A timestamped record of everything.', to: '/dashboard' },
];

// Status of each demo step in THIS prototype.
export const DEMO_STEPS = [
  { title: 'Student reports a medical incident', status: 'Implemented', where: 'Report page', to: '/report' },
  { title: 'Location captured', status: 'Simulated', where: 'Map picker + simulated GPS', to: '/report' },
  { title: 'Incident assessed by ML', status: 'Implemented', where: 'SafeCampus ML API + local fallback', to: '/architecture' },
  { title: 'Responder assignment approved', status: 'Implemented', where: 'Incident page (human approval)', to: '/dashboard' },
  { title: 'Notification sent', status: 'Simulated', where: 'Logged to the timeline; nothing is sent', to: '/dashboard' },
  { title: 'Acknowledgement updates dashboard', status: 'Implemented', where: 'Incident page + dashboard', to: '/dashboard' },
  { title: 'Incident report generated', status: 'Implemented', where: 'Template-based report on resolve', to: '/dashboard' },
];

export const BENEFITS = [
  { title: 'Clearer handoffs', text: 'Everyone works from the same incident record.' },
  { title: 'Fewer duplicate reports', text: 'Related reports can be spotted and linked.' },
  { title: 'Traceable incident logs', text: 'Every step is timestamped and attributed.' },
];

export const SAFEGUARDS = [
  { title: 'Urgent alerts never wait for AI checks', text: 'The alert is dispatched first. AI runs alongside it.', where: 'Every new incident logs the alert before any agent step.' },
  { title: 'Uncertain cases escalate to humans', text: 'Low-confidence assessments are flagged for review.', where: 'Try a vague report such as "help".' },
  { title: 'Role-based access to sensitive data', text: 'Students see status only, not internal details.', where: 'Switch roles in the bar under the menu.' },
  { title: 'Guidance from approved protocols', text: 'The Guidance Agent retrieves, it does not invent.', where: 'Incident page, guidance card.' },
  { title: 'Emergency services via authorized procedures', text: 'The system never contacts emergency services on its own.', where: 'Notifications are simulated and need human approval.' },
];

export const MVP = ['One end-to-end medical scenario', 'Web reporting and live dashboard', 'Five agents, human approval', 'Simulated notifications'];
export const FUTURE = ['Campus system integrations', 'Multilingual reporting', 'Authorized sensor feeds', 'More incident types'];

export const SAMPLE_REPORTS = [
  'A student has collapsed in the library and is not responding.',
  'Smoke smell and the fire alarm is going off near the lab.',
  'Water is leaking from the ceiling and the floor is slippery.',
];
export const SAMPLE_VOICE = 'Someone fainted near the study area and is not waking up.';
