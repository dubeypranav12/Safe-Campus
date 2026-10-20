import { apiRequest } from './api.js';
import { assessmentAgent, assessmentQuestions } from './agents.js';
import { locationById } from './constants.js';

const REQUEST_TIMEOUT_MS = 20000;

const CATEGORY_ALIASES = {
  medical: 'Medical',
  medical_emergency: 'Medical',
  fire: 'Fire alarm',
  fire_alarm: 'Fire alarm',
  fire_or_smoke: 'Fire alarm',
  smoke: 'Fire alarm',
  hazard: 'Hazard',
  infrastructure_hazard: 'Hazard',
  physical_hazard: 'Hazard',
  safety_hazard: 'Hazard',
  security: 'Security',
  security_concern: 'Security',
  other: 'Other',
};

const normalizedLabel = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\s-]+/g, '_');

const mapCategory = (value) => CATEGORY_ALIASES[normalizedLabel(value)] || 'Other';

function mapUrgency(value, urgentRuleTriggered, panic) {
  if (panic || urgentRuleTriggered) return 'Urgent';
  const normalized = String(value || '').trim().toLowerCase();
  if (['critical', 'emergency', 'urgent'].includes(normalized)) return 'Urgent';
  if (normalized === 'high') return 'High';
  if (normalized === 'medium' || normalized === 'moderate') return 'Medium';
  return 'Low';
}

function clampScore(value, fallback) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : fallback;
}

export async function requestMlAssessment(incident) {
  const description = (incident.text || '').trim();
  if (description.length < 3) {
    return {
      ...assessmentAgent(incident),
      source: 'Local rules fallback',
      fallbackReason: 'The ML API requires a description of at least three characters.',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const location = locationById(incident.locationId);
    const result = await apiRequest('/api/ml/assess', {
      method: 'POST',
      body: JSON.stringify({
        description,
        location_text: location?.name || null,
      }),
      signal: controller.signal,
    });

    const local = assessmentAgent(incident);
    const confidence = clampScore(result.category_model_score, local.confidence);
    const category = mapCategory(result.predicted_category);
    const urgency = mapUrgency(result.predicted_urgency, result.urgent_rule_triggered, incident.panic);
    const matchedRules = Array.isArray(result.matched_rules) ? result.matched_rules : [];

    return {
      ...local,
      category,
      urgency,
      confidence,
      uncertain: confidence < 0.6,
      signals: matchedRules,
      questions: assessmentQuestions(incident, category),
      rationale: `ML category score ${Math.round(confidence * 100)}%. Urgency model: ${result.predicted_urgency || 'unknown'} (${Math.round(clampScore(result.urgency_model_score, 0) * 100)}%).`,
      source: 'SafeCampus ML API',
      modelType: 'TF-IDF + Logistic Regression',
      urgentRuleTriggered: Boolean(result.urgent_rule_triggered),
      modelCategory: result.predicted_category || '',
      modelUrgency: result.predicted_urgency || '',
      matchedRules,
      recommendedAction: result.recommended_action || '',
      disclaimer: result.disclaimer || '',
    };
  } catch (error) {
    const reason = error?.name === 'AbortError'
      ? 'The ML service timed out.'
      : 'The ML service was unavailable.';
    return {
      ...assessmentAgent(incident),
      source: 'Local rules fallback',
      fallbackReason: reason,
    };
  } finally {
    clearTimeout(timeout);
  }
}
