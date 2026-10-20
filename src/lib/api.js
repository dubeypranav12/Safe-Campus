const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '');
export const hasConfiguredBackend = API_BASE_URL.length > 0;

/**
 * Shared fetch wrapper for backend integrations.
 *
 * Requests are same-origin by default so the Vite/Vercel proxy can reach the
 * ML service without exposing the browser to cross-origin restrictions. Set
 * VITE_API_BASE_URL only when the backend itself allows the frontend origin.
 */
export async function apiRequest(path, options = {}) {
  const normalizedPath = `/${path.replace(/^\//, '')}`;
  const url = API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
