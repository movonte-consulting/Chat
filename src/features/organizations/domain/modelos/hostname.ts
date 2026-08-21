/** Extrae el hostname de una URL de Jira, con o sin protocolo. Función pura. */
export function parseHost(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}
