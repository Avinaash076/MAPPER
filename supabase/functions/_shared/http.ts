import { ServiceError } from './validation.ts';

export type Fetcher = typeof fetch;
export async function readJson(response: Response | Request, limit = 2_000_000): Promise<unknown> {
  if (!response.body) throw new ServiceError('INVALID_DATA', 502);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > limit) throw new ServiceError('INVALID_DATA', 502);
      chunks.push(next.value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ServiceError('INVALID_DATA', 502);
  }
}
export async function fetchJson(fetcher: Fetcher, url: string | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetcher(url, { ...init, signal: controller.signal, redirect: 'error' });
    if (!response.ok) {
      await response.body?.cancel();
      throw new ServiceError(
        response.status === 429 ? 'PROVIDER_BUSY' : 'PROVIDER_UNAVAILABLE',
        503,
      );
    }
    return await readJson(response);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('PROVIDER_UNAVAILABLE', 503);
  } finally {
    clearTimeout(timeout);
  }
}
