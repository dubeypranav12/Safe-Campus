const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '');
export const hasBackend = API_BASE_URL.length > 0;

/**
 * Shared fetch wrapper for the future backend integration.
 *
 * Set VITE_API_BASE_URL in `.env.local` during development and in the Vercel
 * project's environment variables for production. Existing prototype flows
 * continue to use localStorage until they are migrated to this client.
 */
export async function apiRequest(path, options = {}) {
  if (!hasBackend) {
    throw new Error(
      'Backend is not configured. Set VITE_API_BASE_URL before making API requests.',
    );
  }

  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
